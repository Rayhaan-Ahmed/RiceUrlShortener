package edu.rice.atlink.backend.service;

import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class RedisLinkCacheService implements LinkCacheService {

    private static final Logger log = LoggerFactory.getLogger(RedisLinkCacheService.class);

    private final Optional<StringRedisTemplate> redisTemplate;

    public RedisLinkCacheService(Optional<StringRedisTemplate> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public Optional<String> getLongUrl(String alias) {
        if (redisTemplate.isEmpty()) {
            log.debug("Redis unavailable in application context; skipping cache lookup for alias={}", alias);
            return Optional.empty();
        }
        try {
            String cachedValue = redisTemplate.get().opsForValue().get(cacheKey(alias));
            if (cachedValue == null) {
                log.debug("Redis cache miss for alias={}", alias);
            } else {
                log.debug("Redis cache hit for alias={}", alias);
            }
            return Optional.ofNullable(cachedValue);
        } catch (RedisConnectionFailureException ex) {
            log.warn("Redis connection failed during lookup for alias={}", alias);
            return Optional.empty();
        }
    }

    @Override
    public void putLongUrl(String alias, String longUrl) {
        if (redisTemplate.isEmpty()) {
            log.debug("Redis unavailable in application context; skipping cache write for alias={}", alias);
            return;
        }
        try {
            redisTemplate.get().opsForValue().set(cacheKey(alias), longUrl);
            log.debug("Redis cache populated for alias={}", alias);
        } catch (RedisConnectionFailureException ignored) {
            log.warn("Redis connection failed during cache write for alias={}", alias);
        }
    }

    private String cacheKey(String alias) {
        return "atlink:url:" + alias;
    }
}
