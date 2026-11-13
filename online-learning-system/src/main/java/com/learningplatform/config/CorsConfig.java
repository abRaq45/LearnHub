
package com.learningplatform.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        // Allow local and deployed React frontend
        configuration.setAllowedOrigins(
                Arrays.asList(
                        "http://localhost:5173",
                        "https://learn-hub-orcin-mu.vercel.app"
                )
        );

        // Allowed HTTP methods
        configuration.setAllowedMethods(
                Arrays.asList(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        // Allow all request headers (including Authorization)
        configuration.setAllowedHeaders(
                Arrays.asList("*")
        );

        // Allow credentials
        configuration.setAllowCredentials(true);

        // Expose Authorization header if needed
        configuration.setExposedHeaders(
                Arrays.asList("Authorization")
        );

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
