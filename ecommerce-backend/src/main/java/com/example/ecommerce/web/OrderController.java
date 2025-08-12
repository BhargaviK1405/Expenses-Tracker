package com.example.ecommerce.web;

import com.example.ecommerce.model.CustomerOrder;
import com.example.ecommerce.service.OrderService;
import com.example.ecommerce.web.dto.CreateOrderRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CustomerOrder createOrder(@RequestBody @Valid CreateOrderRequest request) {
        return orderService.createOrder(request);
    }
}