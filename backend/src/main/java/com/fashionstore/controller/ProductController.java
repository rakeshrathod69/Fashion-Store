package com.fashionstore.controller;

import com.fashionstore.dto.ProductRequest;
import com.fashionstore.model.Product;
import com.fashionstore.repository.ProductRepository;
import com.fashionstore.service.ProductService;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductRepository products;
    private final ProductService service;

    public ProductController(ProductRepository products, ProductService service) {
        this.products = products;
        this.service = service;
    }

    @GetMapping
    public List<Product> list(@RequestParam(required = false) String category,
                              @RequestParam(required = false) String size,
                              @RequestParam(required = false) BigDecimal min,
                              @RequestParam(required = false) BigDecimal max) {
        return service.search(category, size, min, max);
    }

    @GetMapping("/{id}")
    public Product get(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Product create(@RequestBody ProductRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Product update(@PathVariable Long id, @RequestBody ProductRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        products.deleteById(id);
    }
}

