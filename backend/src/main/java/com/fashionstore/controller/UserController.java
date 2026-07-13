package com.fashionstore.controller;

import com.fashionstore.model.User;
import com.fashionstore.repository.UserRepository;
import com.fashionstore.service.UserService;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserRepository users;
    private final UserService userService;

    public UserController(UserRepository users, UserService userService) {
        this.users = users;
        this.userService = userService;
    }

    @GetMapping("/me")
    public User me() {
        return userService.currentUser();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> all() {
        return users.findAll();
    }
}
