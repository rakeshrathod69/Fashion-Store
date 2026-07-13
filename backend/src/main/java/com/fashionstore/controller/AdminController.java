package com.fashionstore.controller;

import com.fashionstore.dto.DashboardStatsResponse;
import com.fashionstore.dto.UserRoleRequest;
import com.fashionstore.model.Order;
import com.fashionstore.model.OrderStatus;
import com.fashionstore.model.Product;
import com.fashionstore.model.Role;
import com.fashionstore.model.User;
import com.fashionstore.repository.OrderRepository;
import com.fashionstore.repository.ProductRepository;
import com.fashionstore.repository.ReviewRepository;
import com.fashionstore.repository.UserRepository;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final OrderRepository orders;
    private final UserRepository users;
    private final ProductRepository products;
    private final ReviewRepository reviews;

    public AdminController(OrderRepository orders, UserRepository users, ProductRepository products, ReviewRepository reviews) {
        this.orders = orders;
        this.users = users;
        this.products = products;
        this.reviews = reviews;
    }

    @GetMapping("/dashboard-stats")
    public DashboardStatsResponse getDashboardStats() {
        // Calculate total sales from non-cancelled orders
        BigDecimal totalSales = orders.findAll().stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalOrders = orders.count();
        long totalUsers = users.count();

        // Calculate low stock count (products with stock < 10)
        long lowStockCount = products.findAll().stream()
                .filter(p -> p.getStock() < 10)
                .count();

        // Calculate category sales breakdown
        Map<String, BigDecimal> categorySales = new HashMap<>();
        orders.findAll().stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .flatMap(o -> o.getItems().stream())
                .forEach(item -> {
                    String categoryName = item.getProduct().getCategory().getName();
                    BigDecimal itemTotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                    categorySales.put(categoryName, categorySales.getOrDefault(categoryName, BigDecimal.ZERO).add(itemTotal));
                });

        return new DashboardStatsResponse(totalSales, totalOrders, totalUsers, lowStockCount, categorySales);
    }

    @GetMapping("/reviews")
    public java.util.List<com.fashionstore.dto.ReviewResponse> getAllReviews() {
        return reviews.findAll().stream()
                .map(r -> new com.fashionstore.dto.ReviewResponse(
                        r.getId(),
                        r.getUser().getId(),
                        r.getUser().getName(),
                        r.getRating(),
                        r.getComment(),
                        r.getCreatedAt(),
                        true
                ))
                .toList();
    }

    @DeleteMapping("/reviews/{id}")
    public void deleteReview(@PathVariable Long id) {
        reviews.deleteById(id);
    }

    @PutMapping("/users/{userId}/role")
    public User updateUserRole(@PathVariable Long userId, @RequestBody UserRoleRequest request) {
        User user = users.findById(userId).orElseThrow();
        user.setRole(Role.valueOf(request.role().toUpperCase()));
        return users.save(user);
    }

    @PutMapping("/orders/{orderId}/refund")
    public Order updateRefundStatus(@PathVariable Long orderId, @RequestBody Map<String, String> request) {
        Order order = orders.findById(orderId).orElseThrow();
        if (request.containsKey("refundStatus")) {
            order.setRefundStatus(request.get("refundStatus"));
        }
        return orders.save(order);
    }
}
