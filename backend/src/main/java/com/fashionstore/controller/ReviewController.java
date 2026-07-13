package com.fashionstore.controller;

import com.fashionstore.dto.ReviewRequest;
import com.fashionstore.dto.ReviewResponse;
import com.fashionstore.model.Product;
import com.fashionstore.model.Review;
import com.fashionstore.model.User;
import com.fashionstore.repository.OrderRepository;
import com.fashionstore.repository.ProductRepository;
import com.fashionstore.repository.ReviewRepository;
import com.fashionstore.service.UserService;
import java.util.List;
import java.util.Optional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    private final ReviewRepository reviews;
    private final OrderRepository orders;
    private final ProductRepository products;
    private final UserService userService;

    public ReviewController(ReviewRepository reviews, OrderRepository orders, ProductRepository products, UserService userService) {
        this.reviews = reviews;
        this.orders = orders;
        this.products = products;
        this.userService = userService;
    }

    @GetMapping("/product/{productId}")
    public List<ReviewResponse> list(@PathVariable Long productId) {
        User user = null;
        try {
            user = userService.currentUser();
        } catch (Exception e) {
            // User not logged in, which is fine for reading reviews
        }
        final User currentUser = user;
        
        return reviews.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(r -> new ReviewResponse(
                        r.getId(),
                        r.getUser().getId(),
                        r.getUser().getName(),
                        r.getRating(),
                        r.getComment(),
                        r.getCreatedAt(),
                        currentUser != null && r.getUser().getId().equals(currentUser.getId())
                ))
                .toList();
    }

    @GetMapping("/product/{productId}/eligible")
    public boolean checkEligibility(@PathVariable Long productId) {
        try {
            User user = userService.currentUser();
            // Check if user purchased the product
            boolean purchased = orders.hasUserPurchasedProduct(user.getId(), productId);
            if (!purchased) return false;
            
            // Check if user already reviewed
            Optional<Review> existing = reviews.findByUserIdAndProductId(user.getId(), productId);
            return existing.isEmpty();
        } catch (Exception e) {
            return false;
        }
    }

    @PostMapping("/product/{productId}")
    public ReviewResponse submit(@PathVariable Long productId, @RequestBody ReviewRequest request) {
        User user = userService.currentUser();
        Product product = products.findById(productId).orElseThrow();
        
        // Verify eligibility
        boolean purchased = orders.hasUserPurchasedProduct(user.getId(), productId);
        if (!purchased) {
            throw new IllegalStateException("Only customers who purchased this product can review it.");
        }
        
        Optional<Review> existing = reviews.findByUserIdAndProductId(user.getId(), productId);
        Review review;
        if (existing.isPresent()) {
            review = existing.get();
        } else {
            review = new Review();
            review.setUser(user);
            review.setProduct(product);
        }
        review.setRating(request.rating());
        review.setComment(request.comment());
        Review saved = reviews.save(review);
        
        return new ReviewResponse(
                saved.getId(),
                saved.getUser().getId(),
                saved.getUser().getName(),
                saved.getRating(),
                saved.getComment(),
                saved.getCreatedAt(),
                true
        );
    }

    @PutMapping("/{id}")
    public ReviewResponse update(@PathVariable Long id, @RequestBody ReviewRequest request) {
        User user = userService.currentUser();
        Review review = reviews.findById(id).orElseThrow();
        if (!review.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Unauthorized to edit this review");
        }
        review.setRating(request.rating());
        review.setComment(request.comment());
        Review saved = reviews.save(review);
        
        return new ReviewResponse(
                saved.getId(),
                saved.getUser().getId(),
                saved.getUser().getName(),
                saved.getRating(),
                saved.getComment(),
                saved.getCreatedAt(),
                true
        );
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        User user = userService.currentUser();
        Review review = reviews.findById(id).orElseThrow();
        if (!review.getUser().getId().equals(user.getId()) && !user.getRole().name().equals("ADMIN")) {
            throw new IllegalArgumentException("Unauthorized to delete this review");
        }
        reviews.delete(review);
    }
}
