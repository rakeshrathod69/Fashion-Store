package com.fashionstore.service;

import com.fashionstore.dto.AuthRequest;
import com.fashionstore.dto.AuthResponse;
import com.fashionstore.dto.RegisterRequest;
import com.fashionstore.model.Role;
import com.fashionstore.model.User;
import com.fashionstore.repository.UserRepository;
import com.fashionstore.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authManager;
    private final JwtService jwtService;



    public AuthService(UserRepository users, PasswordEncoder encoder, AuthenticationManager authManager, JwtService jwtService) {
        this.users = users;
        this.encoder = encoder;
        this.authManager = authManager;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (users.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already registered");
        }
        User user = new User();
        user.setName(request.name());
        user.setUsername(request.email());
        user.setEmail(request.email());
        user.setPassword(encoder.encode(request.password()));
        user.setPhone(request.phone());
        user.setAddress(request.address());
        
        Role userRole = Role.USER;
        if (request.role() != null && request.role().trim().equalsIgnoreCase("ADMIN")) {
            userRole = Role.ADMIN;
        }
        user.setRole(userRole);
        
        users.save(user);
        return response(user);
    }

    public AuthResponse login(AuthRequest request) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        User user = users.findByEmail(request.email()).orElseThrow();
        return response(user);
    }

    private AuthResponse response(User user) {
        return new AuthResponse(jwtService.generate(user), user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }

    public void resetPasswordByNameAndEmail(String email, String name, String newPassword) {
        User user = users.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with this email"));
        
        if (!user.getName().trim().equalsIgnoreCase(name.trim())) {
            throw new IllegalArgumentException("Incorrect name for this email address");
        }
        
        user.setPassword(encoder.encode(newPassword));
        users.save(user);
    }
}
