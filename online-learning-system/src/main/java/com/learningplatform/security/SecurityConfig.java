
package com.learningplatform.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            CorsConfigurationSource corsConfigurationSource)
            throws Exception {

        http
                // Disable CSRF
                .csrf(csrf -> csrf.disable())

                // Enable CORS using CorsConfig.java
                .cors(cors ->
                        cors.configurationSource(corsConfigurationSource)
                )

                // Disable default authentication mechanisms
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())

                // Stateless JWT authentication
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // Authorization rules
                .authorizeHttpRequests(auth -> auth

                        // Public authentication endpoints
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/auth/login",
                                "/api/auth/register",
                                "/api/users/register"
                        ).permitAll()

                        // User profile endpoints
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/users/me"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/users/me"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/users/me/password"
                        ).authenticated()

                        // Admin user management
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/users",
                                "/api/users/search"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                "/api/users/learners/**"
                        ).hasRole("ADMIN")

                        // Admin course management
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/courses"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/courses/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/courses/**"
                        ).hasRole("ADMIN")

                        // Public course browsing
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/courses",
                                "/api/courses/search",
                                "/api/courses/categories",
                                "/api/courses/*"
                        ).permitAll()

                        // Admin lesson management
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/courses/*/lessons"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/lessons/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/lessons/**"
                        ).hasRole("ADMIN")

                        // Authenticated lesson access
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/courses/*/lessons",
                                "/api/lessons/**"
                        ).authenticated()

                        // Admin enrollment management
                        .requestMatchers(
                                "/api/enrollments/admin",
                                "/api/enrollments/admin/**"
                        ).hasRole("ADMIN")

                        // Learner enrollment management
                        .requestMatchers(
                                "/api/enrollments/**"
                        ).hasRole("LEARNER")

                        // Learner progress management
                        .requestMatchers(
                                "/api/progress/**"
                        ).hasRole("LEARNER")

                        // Learner dashboard
                        .requestMatchers(
                                "/api/dashboard/learner/**"
                        ).hasRole("LEARNER")

                        // Certificate generation and download
                        .requestMatchers(
                                "/api/certificates/**"
                        ).hasRole("LEARNER")

                        // All remaining endpoints require authentication
                        .anyRequest().authenticated()
                )

                // Add JWT filter
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    // Password encoder
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Authentication manager
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }
}
