package com.fashionstore.controller;

import com.fashionstore.dto.CheckoutRequest;
import com.fashionstore.dto.StatusRequest;
import com.fashionstore.model.Order;
import com.fashionstore.repository.OrderRepository;
import com.fashionstore.service.OrderService;
import com.fashionstore.service.UserService;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;
    private final OrderRepository orders;
    private final UserService userService;

    public OrderController(OrderService orderService, OrderRepository orders, UserService userService) {
        this.orderService = orderService;
        this.orders = orders;
        this.userService = userService;
    }

    @GetMapping
    public List<Order> mine() {
        return orderService.myOrders();
    }

    @GetMapping("/{id}")
    public Order get(@PathVariable Long id) {
        Order order = orders.findById(id).orElseThrow();
        com.fashionstore.model.User currentUser = userService.currentUser();
        if (!order.getUser().getId().equals(currentUser.getId()) && currentUser.getRole() != com.fashionstore.model.Role.ADMIN) {
            throw new IllegalArgumentException("Unauthorized");
        }
        return order;
    }

    @PostMapping("/checkout")
    public Order checkout(@RequestBody CheckoutRequest request) {
        return orderService.checkout(request);
    }

    @PutMapping("/{id}/cancel")
    public Order cancel(@PathVariable Long id) {
        return orderService.cancel(id);
    }

    @PutMapping("/{id}/return")
    public Order requestReturn(@PathVariable Long id) {
        return orderService.requestReturn(id);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Order> all() {
        return orders.findAll();
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public Order updateStatus(@PathVariable Long id, @RequestBody StatusRequest request) {
        Order order = orders.findById(id).orElseThrow();
        order.setStatus(request.status());
        return orders.save(order);
    }
}

