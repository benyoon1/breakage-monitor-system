package com.example.demo;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class CounterResetScheduler {

    private final WebSocketHandler webSocketHandler;

    public CounterResetScheduler(WebSocketHandler webSocketHandler) {
        this.webSocketHandler = webSocketHandler;
    }

    @Scheduled(fixedRate = 10000) // Every 10 seconds
    public void resetCounter() {
        webSocketHandler.resetCounter();
    }
}