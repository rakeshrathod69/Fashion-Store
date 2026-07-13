package com.fashionstore.repository;

import com.fashionstore.model.Product;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategoryNameIgnoreCase(String category);
    List<Product> findByPriceBetween(BigDecimal min, BigDecimal max);
}

