package edu.rice.atlink.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpMethod;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);
    private static final DateTimeFormatter BUCKET_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmm").withZone(ZoneOffset.UTC);

    private final Optional<StringRedisTemplate> redisTemplate;
    private final RateLimitProperties properties;

    public RateLimitFilter(Optional<StringRedisTemplate> redisTemplate, RateLimitProperties properties) {
        this.redisTemplate = redisTemplate;
        this.properties = properties;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        LimitRule rule = ruleFor(request);
        if (!properties.enabled() || rule == null || redisTemplate.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            if (isLimited(rule)) {
                response.setStatus(429);
                response.setContentType("application/json");
                response.getWriter().write("{\"message\":\"Too many requests\"}");
                return;
            }
        } catch (RedisConnectionFailureException ex) {
            log.warn("Redis connection failed during rate limit check for key={}", rule.key());
        } catch (RuntimeException ex) {
            log.warn("Rate limit check failed for key={}", rule.key(), ex);
        }

        filterChain.doFilter(request, response);
    }

    private LimitRule ruleFor(HttpServletRequest request) {
        String method = request.getMethod();
        String path = request.getRequestURI();
        String ip = clientIp(request);

        if (HttpMethod.POST.matches(method) && "/api/auth/register".equals(path)) {
            return hourly("register:ip:" + ip, properties.registerPerHour());
        }
        if (HttpMethod.POST.matches(method) && "/api/auth/login".equals(path)) {
            return minutely("login:ip:" + ip, properties.loginPerMinute());
        }
        if (HttpMethod.POST.matches(method) && "/api/links".equals(path)) {
            return minutely("create:user:" + currentUserOrIp(ip), properties.createLinkPerMinute());
        }
        if (HttpMethod.GET.matches(method) && path.startsWith("/r/")) {
            return minutely("redirect:ip:" + ip, properties.redirectPerMinute());
        }

        return null;
    }

    private boolean isLimited(LimitRule rule) {
        Long count = redisTemplate.get().opsForValue().increment(rule.key());
        if (count != null && count == 1) {
            redisTemplate.get().expire(rule.key(), rule.ttl());
        }
        return count != null && count > rule.limit();
    }

    private LimitRule minutely(String name, long limit) {
        String bucket = BUCKET_FORMAT.format(Instant.now().truncatedTo(ChronoUnit.MINUTES));
        return new LimitRule("rate:" + name + ":" + bucket, limit, Duration.ofMinutes(2));
    }

    private LimitRule hourly(String name, long limit) {
        String bucket = DateTimeFormatter.ofPattern("yyyyMMddHH").withZone(ZoneOffset.UTC).format(Instant.now());
        return new LimitRule("rate:" + name + ":" + bucket, limit, Duration.ofHours(2));
    }

    private String currentUserOrIp(String ip) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && StringUtils.hasText(authentication.getName())) {
            return authentication.getName();
        }
        return "ip:" + ip;
    }

    private String clientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(forwardedFor)) {
            return forwardedFor.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (StringUtils.hasText(realIp)) {
            return realIp;
        }
        return request.getRemoteAddr();
    }

    private record LimitRule(String key, long limit, Duration ttl) {
    }
}
