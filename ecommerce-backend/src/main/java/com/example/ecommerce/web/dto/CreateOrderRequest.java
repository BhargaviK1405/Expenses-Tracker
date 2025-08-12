package com.example.ecommerce.web.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class CreateOrderRequest {
    @NotBlank
    private String customerName;

    @Email
    @NotBlank
    private String customerEmail;

    @NotBlank
    private String shippingAddress;

    @NotEmpty
    @Valid
    private List<CreateOrderItem> items;

    public CreateOrderRequest() { }

    public CreateOrderRequest(String customerName, String customerEmail, String shippingAddress, List<CreateOrderItem> items) {
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.shippingAddress = shippingAddress;
        this.items = items;
    }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

    public List<CreateOrderItem> getItems() { return items; }
    public void setItems(List<CreateOrderItem> items) { this.items = items; }
}