package com.fashionstore.service;

import com.fashionstore.dto.CartItemRequest;
import com.fashionstore.model.CartItem;
import com.fashionstore.model.User;
import com.fashionstore.repository.CartItemRepository;
import com.fashionstore.repository.ProductRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class CartService {
    private final CartItemRepository cartItems;
    private final ProductRepository products;
    private final UserService userService;

    public CartService(CartItemRepository cartItems, ProductRepository products, UserService userService) {
        this.cartItems = cartItems;
        this.products = products;
        this.userService = userService;
    }

    public List<CartItem> currentCart() {
        return cartItems.findByUser(userService.currentUser());
    }

    public CartItem add(CartItemRequest request) {
        User user = userService.currentUser();
        List<CartItem> existing = cartItems.findByUserAndSavedForLater(user, false);
        for (CartItem item : existing) {
            if (item.getProduct().getId().equals(request.productId()) && 
                (item.getSize() == null && request.size() == null || 
                 item.getSize() != null && item.getSize().equals(request.size()))) {
                item.setQuantity(item.getQuantity() + (request.quantity() == null ? 1 : request.quantity()));
                return cartItems.save(item);
            }
        }
        CartItem item = new CartItem();
        item.setUser(user);
        item.setProduct(products.findById(request.productId()).orElseThrow());
        item.setSize(request.size());
        item.setQuantity(request.quantity() == null ? 1 : request.quantity());
        item.setSavedForLater(false);
        return cartItems.save(item);
    }

    public CartItem update(Long id, CartItemRequest request) {
        CartItem item = cartItems.findById(id).orElseThrow();
        if (request.quantity() != null) item.setQuantity(request.quantity());
        if (request.size() != null) item.setSize(request.size());
        if (request.savedForLater() != null) item.setSavedForLater(request.savedForLater());
        return cartItems.save(item);
    }

    public void remove(Long id) {
        cartItems.deleteById(id);
    }

    @Transactional
    public void clearActive(User user) {
        cartItems.deleteByUserAndSavedForLater(user, false);
    }
}

