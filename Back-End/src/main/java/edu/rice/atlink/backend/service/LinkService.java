package edu.rice.atlink.backend.service;

import edu.rice.atlink.backend.config.AppProperties;
import edu.rice.atlink.backend.dto.CreateLinkRequest;
import edu.rice.atlink.backend.dto.LinkListResponse;
import edu.rice.atlink.backend.dto.LinkResponse;
import edu.rice.atlink.backend.exception.AliasAlreadyExistsException;
import edu.rice.atlink.backend.exception.LinkExpiredException;
import edu.rice.atlink.backend.exception.LinkNotFoundException;
import edu.rice.atlink.backend.model.LinkRecord;
import edu.rice.atlink.backend.repository.LinkPage;
import edu.rice.atlink.backend.repository.LinkRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.net.URI;
import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.List;

@Service
public class LinkService {

    private final LinkRepository linkRepository;
    private final AliasGenerator aliasGenerator;
    private final LinkCacheService linkCacheService;
    private final AppProperties appProperties;

    public LinkService(
            LinkRepository linkRepository,
            AliasGenerator aliasGenerator,
            LinkCacheService linkCacheService,
            AppProperties appProperties
    ) {
        this.linkRepository = linkRepository;
        this.aliasGenerator = aliasGenerator;
        this.linkCacheService = linkCacheService;
        this.appProperties = appProperties;
    }

    public LinkResponse createLink(CreateLinkRequest request) {
        Instant now = Instant.now();
        Instant expiresAt = parseExpiry(request.expiresAt());
        if (expiresAt != null && !expiresAt.isAfter(now)) {
            throw new IllegalArgumentException("expiresAt must be in the future");
        }

        String alias = StringUtils.hasText(request.customAlias())
                ? request.customAlias()
                : generateUniqueAlias();

        LinkRecord record = new LinkRecord(
                alias,
                normalizeUrl(request.longUrl()),
                emptyToNull(request.creatorId()),
                now,
                expiresAt,
                0
        );

        boolean saved = linkRepository.saveIfAbsent(record);
        if (!saved) {
            throw new AliasAlreadyExistsException(alias);
        }

        linkCacheService.putLongUrl(alias, record.longUrl());
        return toResponse(record);
    }

    public LinkResponse getLink(String alias) {
        return toResponse(requireActiveLink(alias));
    }

    public LinkListResponse listLinks(String creatorId, String cursor, int limit) {
        if (!StringUtils.hasText(creatorId)) {
            throw new IllegalArgumentException("creatorId query parameter is required");
        }
        if (limit < 1 || limit > 100) {
            throw new IllegalArgumentException("limit must be between 1 and 100");
        }
        LinkPage page = linkRepository.findPageByCreatorId(creatorId, cursor, limit);
        List<LinkResponse> items = page.items().stream()
                .map(this::toResponse)
                .toList();
        return new LinkListResponse(items, page.nextCursor());
    }

    public String resolveRedirect(String alias) {
        Instant now = Instant.now();
        String cachedLongUrl = linkCacheService.getLongUrl(alias).orElse(null);
        if (cachedLongUrl != null) {
            LinkRecord record = linkRepository.findByAlias(alias)
                    .orElseThrow(() -> new LinkNotFoundException(alias));
            if (record.isExpired(now)) {
                throw new LinkExpiredException(alias);
            }
            incrementClicks(record);
            return cachedLongUrl;
        }

        LinkRecord record = requireActiveLink(alias);
        linkCacheService.putLongUrl(alias, record.longUrl());
        incrementClicks(record);
        return record.longUrl();
    }

    private LinkRecord requireActiveLink(String alias) {
        LinkRecord record = linkRepository.findByAlias(alias)
                .orElseThrow(() -> new LinkNotFoundException(alias));
        if (record.isExpired(Instant.now())) {
            throw new LinkExpiredException(alias);
        }
        return record;
    }

    private void incrementClicks(LinkRecord record) {
        linkRepository.save(record.incrementClicks());
    }

    private LinkResponse toResponse(LinkRecord record) {
        return new LinkResponse(
                record.alias(),
                buildShortUrl(record.alias()),
                record.longUrl(),
                record.creatorId(),
                record.createdAt(),
                record.expiresAt(),
                record.clickCount()
        );
    }

    private String buildShortUrl(String alias) {
        return appProperties.baseUrl().endsWith("/")
                ? appProperties.baseUrl() + "r/" + alias
                : appProperties.baseUrl() + "/r/" + alias;
    }

    private String generateUniqueAlias() {
        for (int attempts = 0; attempts < 10; attempts++) {
            String alias = aliasGenerator.generate();
            if (linkRepository.findByAlias(alias).isEmpty()) {
                return alias;
            }
        }
        throw new IllegalStateException("Unable to generate a unique alias");
    }

    private Instant parseExpiry(String rawValue) {
        if (!StringUtils.hasText(rawValue)) {
            return null;
        }
        try {
            return Instant.parse(rawValue);
        } catch (DateTimeParseException ex) {
            throw new IllegalArgumentException("expiresAt must be ISO-8601, for example 2026-12-31T23:59:59Z");
        }
    }

    private String normalizeUrl(String longUrl) {
        try {
            URI uri = URI.create(longUrl);
            if (!StringUtils.hasText(uri.getScheme()) || !StringUtils.hasText(uri.getHost())) {
                throw new IllegalArgumentException("longUrl must be a valid absolute URL");
            }
            return uri.toString();
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("longUrl must be a valid absolute URL");
        }
    }

    private String emptyToNull(String value) {
        return StringUtils.hasText(value) ? value : null;
    }
}
