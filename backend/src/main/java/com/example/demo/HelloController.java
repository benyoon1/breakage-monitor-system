package com.example.demo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/")
public class HelloController {

    @GetMapping("/health")
    public String sayHello() {
        return "Hello, World!";
    }

    @GetMapping("/")
    public String root() {
        return "Welcome to the API";
    }
}