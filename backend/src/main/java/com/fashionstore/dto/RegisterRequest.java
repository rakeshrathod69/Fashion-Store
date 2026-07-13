package com.fashionstore.dto;

public record RegisterRequest(String name, String email, String password, String phone, String address, String role) {
}

