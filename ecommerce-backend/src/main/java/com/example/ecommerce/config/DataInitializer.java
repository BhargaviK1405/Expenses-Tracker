package com.example.ecommerce.config;

import com.example.ecommerce.model.Product;
import com.example.ecommerce.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedProducts(ProductRepository productRepository) {
        return args -> {
            if (productRepository.count() > 0) {
                return;
            }
            productRepository.save(new Product(
                    "Wireless Headphones",
                    "Noise-cancelling over-ear headphones with 30h battery",
                    new BigDecimal("129.99"),
                    "https://picsum.photos/seed/headphones/600/400",
                    50
            ));
            productRepository.save(new Product(
                    "Smartwatch",
                    "Water-resistant smartwatch with heart-rate monitor",
                    new BigDecimal("199.00"),
                    "https://picsum.photos/seed/smartwatch/600/400",
                    35
            ));
            productRepository.save(new Product(
                    "Mechanical Keyboard",
                    "RGB backlit mechanical keyboard with blue switches",
                    new BigDecimal("89.50"),
                    "https://picsum.photos/seed/keyboard/600/400",
                    80
            ));
            productRepository.save(new Product(
                    "4K Monitor",
                    "27-inch 4K IPS display with HDR",
                    new BigDecimal("329.99"),
                    "https://picsum.photos/seed/monitor/600/400",
                    20
            ));
        };
    }
}