package com.fashionstore.repository;

import com.fashionstore.model.Review;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);
    Optional<Review> findByUserIdAndProductId(Long userId, Long productId);
    List<Review> findAllByOrderByCreatedAtDesc();
}
