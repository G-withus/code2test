package com.mdt.telemetryjavamavlinkv2.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class TelemetrySchedulerService {

    private final MavlinkMessageHandlerService messageHandlerService;
    private final TelemetryFileService telemetryFileService;
    private final TelemetryLogUploaderService uploaderService;
    private final SimpleDateFormat timestampFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    private final long TELEMETRY_TIMEOUT_MS = 5000;
    private final Map<Integer, Boolean> portLogStarted = new HashMap<>();

    public TelemetrySchedulerService(
            MavlinkMessageHandlerService messageHandlerService,
            TelemetryFileService telemetryFileService,
            TelemetryLogUploaderService uploaderService) {
        this.messageHandlerService = messageHandlerService;
        this.telemetryFileService = telemetryFileService;
        this.uploaderService = uploaderService;
    }

    @Scheduled(fixedRate = 1000)
    public void printAndSendTelemetry() {
        long now = System.currentTimeMillis();

        Set<Integer> activePorts = messageHandlerService.getActivePorts();
        activePorts.removeIf(port -> {
            Long lastUpdate = messageHandlerService.getLastTelemetryUpdate(port);
            return lastUpdate == null || (now - lastUpdate > TELEMETRY_TIMEOUT_MS);
        });

        LinkedHashMap<Integer, LinkedHashMap<String, Object>> telemetryDataMap = messageHandlerService.getTelemetryData();
        List<Map<String, Object>> telemetryList = new ArrayList<>();

        for (Integer port : activePorts) {
            Map<String, Object> data = telemetryDataMap.get(port);
            if (data != null) {
                data.put("timestamp", timestampFormat.format(new Date()));

                if (!portLogStarted.containsKey(port)) {
                    telemetryFileService.createLogFile(port);
                    portLogStarted.put(port, true);
                }

                telemetryFileService.logTelemetryData(port, data);

                if (!"Unknown".equals(data.get("GCS_IP"))) {
                    telemetryList.add(data);
                }
            }
        }

        // Handle disconnections
        List<Integer> disconnectedPorts = new ArrayList<>();
        for (Integer port : portLogStarted.keySet()) {
            if (!activePorts.contains(port)) {
                File logFile = telemetryFileService.getLogFile(port);
                uploaderService.compressAndUploadLogFile(logFile, port);
                telemetryFileService.deleteLogFile(port);
                disconnectedPorts.add(port);
            }
        }
        disconnectedPorts.forEach(portLogStarted::remove);

        // WebSocket transmission
        if (!telemetryList.isEmpty()) {
            Map<String, Object> payload = new HashMap<>();
            payload.put("drones", telemetryList);
            TelemetryWebSocketService.sendTelemetryData(payload);
        }
    }
}