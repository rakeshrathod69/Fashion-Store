package com.fashionstore.dto;

public record CartItemRequest(Long productId, String size, Integer quantity, Boolean savedForLater) {
}

