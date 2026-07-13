package com.fashionstore.controller;

import com.fashionstore.dto.AuthRequest;
import com.fashionstore.dto.AuthResponse;
import com.fashionstore.dto.RegisterRequest;
import com.fashionstore.service.AuthService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest request) {
        return authService.login(request);
    }

    @PostMapping("/reset-password")
    public void resetPassword(@RequestBody com.fashionstore.dto.ResetPasswordRequest request) {
        authService.resetPasswordByNameAndEmail(request.email(), request.name(), request.newPassword());
    }
}

