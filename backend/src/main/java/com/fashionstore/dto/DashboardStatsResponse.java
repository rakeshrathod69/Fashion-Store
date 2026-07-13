package com.fashionstore.dto;

import java.math.BigDecimal;
import java.util.Map;

public record DashboardStatsResponse(
    BigDecimal totalSales,
    Long totalOrders,
    Long totalUsers,
    Long lowStockCount,
    Map<String, BigDecimal> categorySales
) {
}
