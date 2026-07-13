package com.fashionstore.service;

import com.fashionstore.dto.ProductRequest;
import com.fashionstore.model.Product;
import com.fashionstore.repository.CategoryRepository;
import com.fashionstore.repository.ProductRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ProductService {
    private final ProductRepository products;
    private final CategoryRepository categories;
    private final com.fashionstore.repository.ReviewRepository reviews;

    public ProductService(ProductRepository products, CategoryRepository categories, com.fashionstore.repository.ReviewRepository reviews) {
        this.products = products;
        this.categories = categories;
        this.reviews = reviews;
    }

    public List<Product> search(String category, String size, BigDecimal min, BigDecimal max) {
        List<Product> list = products.findAll().stream()
                .filter(p -> category == null || p.getCategory().getName().equalsIgnoreCase(category))
                .filter(p -> size == null || (p.getSizes() != null && p.getSizes().toLowerCase().contains(size.toLowerCase())))
                .filter(p -> min == null || p.getPrice().compareTo(min) >= 0)
                .filter(p -> max == null || p.getPrice().compareTo(max) <= 0)
                .toList();
        for (Product p : list) {
            populateReviewStats(p);
        }
        return list;
    }

    public Product getById(Long id) {
        Product p = products.findById(id).orElseThrow();
        populateReviewStats(p);
        return p;
    }

    public Product create(ProductRequest request) {
        Product product = new Product();
        apply(product, request);
        return products.save(product);
    }

    public Product update(Long id, ProductRequest request) {
        Product product = products.findById(id).orElseThrow();
        apply(product, request);
        return products.save(product);
    }

    private void populateReviewStats(Product product) {
        List<com.fashionstore.model.Review> productReviews = reviews.findByProductIdOrderByCreatedAtDesc(product.getId());
        product.setTotalReviews(productReviews.size());
        if (!productReviews.isEmpty()) {
            double avg = productReviews.stream()
                    .mapToInt(com.fashionstore.model.Review::getRating)
                    .average()
                    .orElse(0.0);
            product.setAverageRating(Math.round(avg * 10.0) / 10.0);
        }
    }

    private void apply(Product product, ProductRequest request) {
        product.setName(request.name());
        product.setDescription(request.description());
        product.setImageUrl(request.imageUrl());
        product.setSizes(request.sizes());
        product.setPrice(request.price());
        product.setStock(request.stock());
        product.setCategory(categories.findById(request.categoryId()).orElseThrow());
        product.setBrand(request.brand());
        product.setColors(request.colors());
        product.setImageUrls(request.imageUrls());
        product.setSpecifications(request.specifications());
        product.setDiscountPercentage(request.discountPercentage() == null ? 0 : request.discountPercentage());
        product.setAverageRating(request.averageRating() == null ? 0.0 : request.averageRating());
    }
}

