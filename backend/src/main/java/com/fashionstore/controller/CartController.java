package com.fashionstore.controller;

import com.fashionstore.dto.CartItemRequest;
import com.fashionstore.model.CartItem;
import com.fashionstore.service.CartService;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {
    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public List<CartItem> list() {
        return cartService.currentCart();
    }

    @PostMapping("/items")
    public CartItem add(@RequestBody CartItemRequest request) {
        return cartService.add(request);
    }

    @PutMapping("/items/{id}")
    public CartItem update(@PathVariable Long id, @RequestBody CartItemRequest request) {
        return cartService.update(id, request);
    }

    @DeleteMapping("/items/{id}")
    public void remove(@PathVariable Long id) {
        cartService.remove(id);
    }
}

