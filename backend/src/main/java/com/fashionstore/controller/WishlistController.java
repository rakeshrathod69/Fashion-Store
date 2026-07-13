package com.fashionstore.controller;

import com.fashionstore.dto.CartItemRequest;
import com.fashionstore.model.Product;
import com.fashionstore.model.User;
import com.fashionstore.model.WishlistItem;
import com.fashionstore.repository.ProductRepository;
import com.fashionstore.repository.WishlistItemRepository;
import com.fashionstore.service.CartService;
import com.fashionstore.service.UserService;
import java.util.List;
import java.util.Optional;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {
    private final WishlistItemRepository wishlistItems;
    private final ProductRepository products;
    private final UserService userService;
    private final CartService cartService;

    public WishlistController(WishlistItemRepository wishlistItems, ProductRepository products, UserService userService, CartService cartService) {
        this.wishlistItems = wishlistItems;
        this.products = products;
        this.userService = userService;
        this.cartService = cartService;
    }

    @GetMapping
    public List<Product> list() {
        User user = userService.currentUser();
        return wishlistItems.findByUser(user).stream()
                .map(WishlistItem::getProduct)
                .toList();
    }

    @PostMapping("/{productId}")
    public void add(@PathVariable Long productId) {
        User user = userService.currentUser();
        Product product = products.findById(productId).orElseThrow();
        
        Optional<WishlistItem> existing = wishlistItems.findByUserIdAndProductId(user.getId(), productId);
        if (existing.isEmpty()) {
            WishlistItem item = new WishlistItem();
            item.setUser(user);
            item.setProduct(product);
            wishlistItems.save(item);
        }
    }

    @DeleteMapping("/{productId}")
    @Transactional
    public void remove(@PathVariable Long productId) {
        User user = userService.currentUser();
        wishlistItems.deleteByUserAndProductId(user, productId);
    }

    @PostMapping("/{productId}/move-to-cart")
    @Transactional
    public void moveToCart(@PathVariable Long productId, @RequestParam(required = false) String size) {
        User user = userService.currentUser();
        Product product = products.findById(productId).orElseThrow();
        
        // Remove from wishlist
        wishlistItems.deleteByUserAndProductId(user, productId);
        
        // Choose size: if none, use first available size, otherwise "M"
        String finalSize = size;
        if (finalSize == null || finalSize.trim().isEmpty()) {
            if (product.getSizes() != null && !product.getSizes().isEmpty()) {
                finalSize = product.getSizes().split(",")[0];
            } else {
                finalSize = "M";
            }
        }
        
        // Add to active cart
        cartService.add(new CartItemRequest(productId, finalSize, 1, false));
    }
}
