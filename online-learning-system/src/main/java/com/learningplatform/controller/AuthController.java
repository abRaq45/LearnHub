
package com.learningplatform.controller;

import com.learningplatform.entity.User;
import com.learningplatform.security.JwtService;
import com.learningplatform.service.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;

    public AuthController(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            UserService userService) {

        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userService = userService;
    }

    // LOGIN API
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request) {

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.email().trim().toLowerCase(),
                                request.password()
                        )
                );

        User user = userService.findByEmail(
                authentication.getName()
        );

        String token = jwtService.generateToken(
                authentication.getName()
        );

        return ResponseEntity.ok(
                new LoginResponse(
                        "Login successful",
                        token,
                        user.getEmail(),
                        user.getRole().name()
                )
        );
    }

    // REGISTRATION API
    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(
            @RequestBody RegisterRequest request) {

        User user = new User(
                request.name(),
                request.email(),
                request.password(),
                null
        );

        User savedUser = userService.registerUser(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                new RegisterResponse(
                        "Registration successful",
                        savedUser.getId(),
                        savedUser.getName(),
                        savedUser.getEmail(),
                        savedUser.getRole().name()
                )
        );
    }

    // LOGIN REQUEST
    public record LoginRequest(
            String email,
            String password
    ) {}

    // LOGIN RESPONSE
    public record LoginResponse(
            String message,
            String token,
            String email,
            String role
    ) {}

    // REGISTRATION REQUEST
    public record RegisterRequest(
            String name,
            String email,
            String password
    ) {}

    // REGISTRATION RESPONSE
    public record RegisterResponse(
            String message,
            String id,
            String name,
            String email,
            String role
    ) {}
}
