package com.fashionstore.service;

import com.fashionstore.dto.CheckoutRequest;
import com.fashionstore.model.*;
import com.fashionstore.repository.CartItemRepository;
import com.fashionstore.repository.OrderRepository;
import com.fashionstore.repository.ProductRepository;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class OrderService {
    private final OrderRepository orders;
    private final CartItemRepository cartItems;
    private final UserService userService;
    private final CartService cartService;
    private final ProductRepository products;

    public OrderService(OrderRepository orders, CartItemRepository cartItems, UserService userService, CartService cartService, ProductRepository products) {
        this.orders = orders;
        this.cartItems = cartItems;
        this.userService = userService;
        this.cartService = cartService;
        this.products = products;
    }

    public List<Order> myOrders() {
        return orders.findByUserOrderByCreatedAtDesc(userService.currentUser());
    }

    @Transactional
    public Order checkout(CheckoutRequest request) {
        User user = userService.currentUser();
        List<CartItem> cart = cartItems.findByUserAndSavedForLater(user, false);
        if (cart.isEmpty()) {
            throw new IllegalStateException("Cart is empty");
        }
        Order order = new Order();
        order.setUser(user);
        
        // Detailed Address Mapping
        order.setShippingName(request.shippingName());
        order.setShippingPhone(request.shippingPhone());
        order.setShippingEmail(request.shippingEmail());
        order.setShippingAddressLine1(request.shippingAddressLine1());
        order.setShippingAddressLine2(request.shippingAddressLine2());
        order.setShippingCity(request.shippingCity());
        order.setShippingState(request.shippingState());
        order.setShippingCountry(request.shippingCountry());
        order.setShippingPinCode(request.shippingPinCode());
        order.setRefundStatus("NO_REFUND");
        
        String formattedAddress = String.format("%s, %s, %s, %s, %s, %s, %s - PIN: %s. Phone: %s, Email: %s",
            request.shippingName(), request.shippingAddressLine1(),
            (request.shippingAddressLine2() != null && !request.shippingAddressLine2().trim().isEmpty()) ? request.shippingAddressLine2() : "N/A",
            request.shippingCity(), request.shippingState(), request.shippingCountry(),
            request.shippingPinCode(), request.shippingPhone(), request.shippingEmail());
        order.setShippingAddress(formattedAddress);
        
        order.setStatus(OrderStatus.PLACED);
        
        BigDecimal subtotal = BigDecimal.ZERO;
        for (CartItem cartItem : cart) {
            Product product = cartItem.getProduct();
            if (product.getStock() < cartItem.getQuantity()) {
                throw new IllegalStateException("Insufficient stock for product: " + product.getName());
            }
            product.setStock(product.getStock() - cartItem.getQuantity());
            products.save(product);

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(product);
            item.setProductName(product.getName());
            item.setSize(cartItem.getSize());
            item.setQuantity(cartItem.getQuantity());
            
            BigDecimal basePrice = product.getPrice();
            int discountPercent = product.getDiscountPercentage() != null ? product.getDiscountPercentage() : 0;
            BigDecimal finalPrice = basePrice;
            if (discountPercent > 0) {
                BigDecimal discountAmt = basePrice.multiply(BigDecimal.valueOf(discountPercent)).divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
                finalPrice = basePrice.subtract(discountAmt);
            }
            
            item.setPrice(finalPrice);
            order.getItems().add(item);
            subtotal = subtotal.add(finalPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        }
        
        order.setSubtotalAmount(subtotal);
        
        // Calculate Discount: 10% off above 2500, 15% off above 5000
        BigDecimal discount = BigDecimal.ZERO;
        if (subtotal.compareTo(BigDecimal.valueOf(5000)) > 0) {
            discount = subtotal.multiply(BigDecimal.valueOf(0.15));
        } else if (subtotal.compareTo(BigDecimal.valueOf(2500)) > 0) {
            discount = subtotal.multiply(BigDecimal.valueOf(0.10));
        }
        // Round to 2 decimal places
        discount = discount.setScale(2, java.math.RoundingMode.HALF_UP);
        order.setDiscountAmount(discount);
        
        // Calculate Shipping: Free above 1500 (after discount or before? Let's say before discount subtotal), else 99
        BigDecimal shipping = BigDecimal.ZERO;
        if (subtotal.compareTo(BigDecimal.valueOf(1500)) < 0) {
            shipping = BigDecimal.valueOf(99);
        }
        order.setShippingCharge(shipping);
        
        BigDecimal total = subtotal.subtract(discount).add(shipping);
        order.setTotalAmount(total);
        
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setMethod(request.paymentMethod());
        payment.setStatus(request.paymentMethod() == PaymentMethod.CASH_ON_DELIVERY ? "PENDING" : "PAID");
        payment.setTransactionRef(UUID.randomUUID().toString());
        payment.setPaidAt(request.paymentMethod() == PaymentMethod.CASH_ON_DELIVERY ? null : Instant.now());
        order.setPayment(payment);
        
        Order saved = orders.save(order);
        cartService.clearActive(user);
        return saved;
    }

    @Transactional
    public Order cancel(Long orderId) {
        User user = userService.currentUser();
        Order order = orders.findById(orderId).orElseThrow();
        // Check owner (Admins can also cancel, but here we check owner or admin)
        if (!order.getUser().getId().equals(user.getId()) && !user.getRole().name().equals("ADMIN")) {
            throw new IllegalArgumentException("Unauthorized");
        }
        if (order.getStatus() != OrderStatus.PLACED && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new IllegalStateException("Order cannot be cancelled at this stage");
        }
        order.setStatus(OrderStatus.CANCELLED);
        if (order.getPayment() != null && !order.getPayment().getMethod().equals("CASH_ON_DELIVERY")) {
            order.setRefundStatus("PENDING");
            if (order.getPayment().getStatus().equals("PAID")) {
                order.getPayment().setStatus("REFUND_PENDING");
            }
        }
        
        // Restore stock
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            if (product != null) {
                product.setStock(product.getStock() + item.getQuantity());
                products.save(product);
            }
        }

        return orders.save(order);
    }

    @Transactional
    public Order requestReturn(Long orderId) {
        User user = userService.currentUser();
        Order order = orders.findById(orderId).orElseThrow();
        if (!order.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Unauthorized");
        }
        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new IllegalStateException("Only delivered orders can be returned");
        }
        order.setStatus(OrderStatus.RETURN_REQUESTED);
        order.setRefundStatus("PENDING");
        return orders.save(order);
    }
}

