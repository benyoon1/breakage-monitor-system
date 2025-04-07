package com.example.demo;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class WebSocketHandler extends TextWebSocketHandler {

    private final AtomicInteger counter = new AtomicInteger(0);
    private final Set<WebSocketSession> sessions = ConcurrentHashMap.newKeySet();

    @Override
    public void afterConnectionEstablished(@NonNull WebSocketSession session) throws Exception {
        sessions.add(session);
        System.out.println("New session added: " + session.getId());
    }

    @Override
    public void handleTextMessage(@NonNull WebSocketSession session, @NonNull TextMessage message) throws Exception {
        String payload = message.getPayload().trim();
        System.out.println("Received payload: \"" + payload + "\"");

        String response;

        switch (payload.toLowerCase()) {
            case "increment":
                int current = counter.incrementAndGet();
                response = "Counter incremented to " + current;
                broadcast(new TextMessage(response));

                if (current > 8) {
                    broadcast(new TextMessage("counterExceeded"));
                    resetCounter();
                }
                break;

            case "get":
                response = "Counter: " + counter.get();
                session.sendMessage(new TextMessage(response));
                break;

            case "lock":
                response = "doorsLocked";
                broadcast(new TextMessage(response));
                break;

            case "unlock":
                response = "doorsUnlocked";
                broadcast(new TextMessage(response));
                break;

            default:
                response = "Unknown command";
                session.sendMessage(new TextMessage(response));
                break;
        }
    }

    public void resetCounter() {
        counter.set(0);
        System.out.println("Counter reset to 0");
        broadcast(new TextMessage("Counter has been reset to 0"));
    }

    @Override
    public void afterConnectionClosed(@NonNull WebSocketSession session, @NonNull CloseStatus status) throws Exception {
        super.afterConnectionClosed(session, status);
        System.out.println("Session removed: " + session.getId());
    }

    private void broadcast(TextMessage message) {
        sessions.forEach(session -> {
            if (session.isOpen()) {
                try {
                    session.sendMessage(message);
                } catch (Exception e) {
                    System.err.println("Failed to send message to session " + session.getId() + ": " + e.getMessage());
                }
            }
        });
    }
}