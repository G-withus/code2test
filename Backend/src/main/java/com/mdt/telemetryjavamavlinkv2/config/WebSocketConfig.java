package com.mdt.telemetryjavamavlinkv2.config;

import com.mdt.telemetryjavamavlinkv2.service.TelemetryWebSocketService;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new TelemetryWebSocketService(), "/telemetry").setAllowedOrigins("*");
    }
}