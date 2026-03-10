package edu.rice.atlink.backend.service;

import edu.rice.atlink.backend.config.AppProperties;
import edu.rice.atlink.backend.dto.CreateLinkRequest;
import edu.rice.atlink.backend.dto.LinkListResponse;
import edu.rice.atlink.backend.dto.LinkResponse;
import edu.rice.atlink.backend.exception.LinkExpiredException;
import edu.rice.atlink.backend.repository.InMemoryLinkRepository;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LinkServiceTest {

    private final LinkService linkService = new LinkService(
            new InMemoryLinkRepository(),
            new AliasGenerator(),
            new TestCacheService(),
            new AppProperties("http://localhost:8080")
    );

    @Test
    void generatedAliasProducesShortUrl() {
        LinkResponse response = linkService.createLink(new CreateLinkRequest(
                "https://www.example.com/page",
                null,
                "creator-1",
                null
        ));

        assertEquals(7, response.alias().length());
        assertTrue(response.shortUrl().endsWith("/r/" + response.alias()));
    }

    @Test
    void expiredLinkCannotRedirect() {
        LinkResponse response = linkService.createLink(new CreateLinkRequest(
                "https://www.example.com",
                "future1",
                "creator-1",
                Instant.now().plus(1, ChronoUnit.SECONDS).toString()
        ));

        assertEquals("future1", response.alias());

        sleep(1100);

        assertThrows(LinkExpiredException.class, () -> linkService.resolveRedirect("future1"));
    }

    @Test
    void listLinksReturnsNextCursorWhenTruncated() {
        linkService.createLink(new CreateLinkRequest("https://a.example", "alias-1", "creator-2", null));
        linkService.createLink(new CreateLinkRequest("https://b.example", "alias-2", "creator-2", null));

        LinkListResponse page = linkService.listLinks("creator-2", null, 1);

        assertEquals(1, page.items().size());
        assertTrue(page.nextCursor() != null && !page.nextCursor().isBlank());
    }

    private void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new AssertionError(ex);
        }
    }

    private static class TestCacheService implements LinkCacheService {
        @Override
        public Optional<String> getLongUrl(String alias) {
            return Optional.empty();
        }

        @Override
        public void putLongUrl(String alias, String longUrl) {
        }
    }
}
