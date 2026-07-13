package com.fashionstore.repository;

import com.fashionstore.model.WishlistItem;
import com.fashionstore.model.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {
    List<WishlistItem> findByUser(User user);
    Optional<WishlistItem> findByUserIdAndProductId(Long userId, Long productId);
    void deleteByUserAndProductId(User user, Long productId);
}
