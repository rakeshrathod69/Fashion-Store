package com.fashionstore.repository;

import com.fashionstore.model.CartItem;
import com.fashionstore.model.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUser(User user);
    void deleteByUser(User user);
    List<CartItem> findByUserAndSavedForLater(User user, Boolean savedForLater);
    void deleteByUserAndSavedForLater(User user, Boolean savedForLater);
}

