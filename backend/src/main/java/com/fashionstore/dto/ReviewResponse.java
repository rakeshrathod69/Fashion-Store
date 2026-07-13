package com.fashionstore.dto;

import java.time.Instant;

public record ReviewResponse(
    Long id,
    Long userId,
    String userName,
    Integer rating,
    String comment,
    Instant createdAt,
    Boolean mine
) {
}
