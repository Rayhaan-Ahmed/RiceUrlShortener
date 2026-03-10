package edu.rice.atlink.backend.service;

import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;

@Service
public class RedisLinkCacheService implements LinkCacheService {

    private static final Duration CACHE_TTL = Duration.ofHours(1);

    private final Optional<StringRedisTemplate> redisTemplate;

    public RedisLinkCacheService(Optional<StringRedisTemplate> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public Optional<String> getLongUrl(String alias) {
        if (redisTemplate.isEmpty()) {
            return Optional.empty();
        }
        try {
            return Optional.ofNullable(redisTemplate.get().opsForValue().get(cacheKey(alias)));
        } catch (RedisConnectionFailureException ex) {
            return Optional.empty();
        }
    }

    @Override
    public void putLongUrl(String alias, String longUrl) {
        if (redisTemplate.isEmpty()) {
            return;
        }
        try {
            redisTemplate.get().opsForValue().set(cacheKey(alias), longUrl, CACHE_TTL);
        } catch (RedisConnectionFailureException ignored) {
        }
    }

    private String cacheKey(String alias) {
        return "atlink:url:" + alias;
    }
}
