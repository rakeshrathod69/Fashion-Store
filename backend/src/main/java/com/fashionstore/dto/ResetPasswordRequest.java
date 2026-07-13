package com.fashionstore.dto;

public record ResetPasswordRequest(String email, String name, String newPassword) {
}
