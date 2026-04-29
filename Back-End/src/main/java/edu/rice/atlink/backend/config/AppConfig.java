package edu.rice.atlink.backend.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({
        AppProperties.class,
        BigtableProperties.class,
        AuthProperties.class,
        RateLimitProperties.class
})
public class AppConfig {
}
