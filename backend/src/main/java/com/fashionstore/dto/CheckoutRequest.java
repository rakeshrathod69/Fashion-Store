package com.fashionstore.dto;

import com.fashionstore.model.PaymentMethod;

public record CheckoutRequest(
        String shippingName,
        String shippingPhone,
        String shippingEmail,
        String shippingAddressLine1,
        String shippingAddressLine2,
        String shippingCity,
        String shippingState,
        String shippingCountry,
        String shippingPinCode,
        PaymentMethod paymentMethod
) {
}

