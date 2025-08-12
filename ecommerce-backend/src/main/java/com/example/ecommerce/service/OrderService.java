package com.example.ecommerce.service;

import com.example.ecommerce.model.CustomerOrder;
import com.example.ecommerce.model.OrderItem;
import com.example.ecommerce.model.Product;
import com.example.ecommerce.repository.CustomerOrderRepository;
import com.example.ecommerce.repository.ProductRepository;
import com.example.ecommerce.web.dto.CreateOrderItem;
import com.example.ecommerce.web.dto.CreateOrderRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;

@Service
public class OrderService {
    private final CustomerOrderRepository customerOrderRepository;
    private final ProductRepository productRepository;

    public OrderService(CustomerOrderRepository customerOrderRepository, ProductRepository productRepository) {
        this.customerOrderRepository = customerOrderRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public CustomerOrder createOrder(CreateOrderRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item");
        }

        CustomerOrder order = new CustomerOrder(
                request.getCustomerName(),
                request.getCustomerEmail(),
                request.getShippingAddress(),
                Instant.now(),
                BigDecimal.ZERO
        );

        BigDecimal total = BigDecimal.ZERO;

        for (CreateOrderItem requestItem : request.getItems()) {
            Product product = productRepository.findById(requestItem.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + requestItem.getProductId()));

            int quantity = requestItem.getQuantity();
            if (quantity <= 0) {
                throw new IllegalArgumentException("Quantity must be positive for product " + product.getId());
            }
            if (product.getStock() < quantity) {
                throw new IllegalArgumentException("Insufficient stock for product " + product.getId());
            }

            product.setStock(product.getStock() - quantity);
            productRepository.save(product);

            BigDecimal unitPrice = product.getPrice();
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(quantity));

            OrderItem item = new OrderItem(order, product, quantity, unitPrice, lineTotal);
            order.getItems().add(item);

            total = total.add(lineTotal);
        }

        order.setTotal(total);

        return customerOrderRepository.save(order);
    }
}