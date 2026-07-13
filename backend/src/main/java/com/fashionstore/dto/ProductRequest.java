package com.fashionstore.dto;

import java.math.BigDecimal;

public record ProductRequest(
        String name,
        String description,
        String imageUrl,
        String sizes,
        BigDecimal price,
        Integer stock,
        Long categoryId,
        String brand,
        String colors,
        String imageUrls,
        String specifications,
        Integer discountPercentage,
        Double averageRating
) {
}

