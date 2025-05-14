package com.mdt.telemetryjavamavlinkv2.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.*;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class SendTelemetryToWebSocketService {

    private final MavlinkMessageHandlerService messageHandlerService;
    private final S3Service s3Service;  // Inject S3Service
    private final long TELEMETRY_TIMEOUT_MS = 5000;
    private final SimpleDateFormat timestampFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    private final Map<Integer, Boolean> portLogStarted = new HashMap<>();

    @Value("${cloud.aws.s3.bucket-name}")
    private String bucketName;

    public SendTelemetryToWebSocketService(MavlinkMessageHandlerService messageHandlerService, S3Service s3Service) {
        this.messageHandlerService = messageHandlerService;
        this.s3Service = s3Service;
    }

   // @Scheduled(fixedRate = 1000)
    public void printAndSendTelemetry() {
        long now = System.currentTimeMillis();
        Set<Integer> activePorts = messageHandlerService.getActivePorts();
        activePorts.removeIf(port -> {
            Long lastUpdate = messageHandlerService.getLastTelemetryUpdate(port);
            return lastUpdate == null || (now - lastUpdate > TELEMETRY_TIMEOUT_MS);
        });

        LinkedHashMap<Integer, LinkedHashMap<String, Object>> telemetryDataMap = messageHandlerService.getTelemetryData();

        for (Integer port : activePorts) {
            Map<String, Object> data = telemetryDataMap.get(port);
            if (data != null) {
                data.put("timestamp", timestampFormat.format(new Date()));
                if (!portLogStarted.containsKey(port)) {
                    createLogFile(port);
                    portLogStarted.put(port, true);
                }
                logTelemetryData(port, data);
            }
        }

        // Disconnect cleanup
        List<Integer> disconnectedPorts = new ArrayList<>();
        for (Integer port : portLogStarted.keySet()) {
            if (!activePorts.contains(port)) {
                compressAndUploadLogFile(port);  // Compress and upload to S3
                deleteLogFile(port);
                disconnectedPorts.add(port);
            }
        }
        disconnectedPorts.forEach(portLogStarted::remove);

        // Send data over WebSocket
        List<Map<String, Object>> telemetryList = new ArrayList<>();
        for (Integer port : activePorts) {
            Map<String, Object> data = telemetryDataMap.get(port);
            if (data != null && !"Unknown".equals(data.get("GCS_IP"))) {
                telemetryList.add(data);
            }
        }

        if (!telemetryList.isEmpty()) {
            Map<String, Object> payload = new HashMap<>();
            payload.put("drones", telemetryList);
            TelemetryWebSocketService.sendTelemetryData(payload);
        }
    }

    private void createLogFile(int port) {
        File logFile = new File("telemetry_logs", "telemetry_" + port + ".log");
        try {
            if (logFile.createNewFile()) {
                System.out.println("Created log file: " + logFile.getAbsolutePath());
            }
        } catch (IOException e) {
            System.err.println(" Error creating log file: " + e.getMessage());
        }
    }

    private void logTelemetryData(int port, Map<String, Object> telemetryData) {
        File logFile = new File("telemetry_logs", "telemetry_" + port + ".log");
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(logFile, true))) {
            writer.write("[" + timestampFormat.format(new Date()) + "] " + telemetryData);
            writer.newLine();
        } catch (IOException e) {
            System.err.println("❌ Error writing log for port " + port + ": " + e.getMessage());
        }
    }

    private void compressAndUploadLogFile(int port) {
        File logFile = new File("telemetry_logs/telemetry_" + port + ".log");

        // Format timestamp: yyyy-MM-dd_HH-mm-ss
        String timestamp = new SimpleDateFormat("yyyy-MM-dd_HH-mm-ss").format(new Date());
        String zipFileName = "telemetry_" + port + ".log-" + timestamp + ".zip";
        File zipFile = new File("telemetry_logs", zipFileName);

        // Step 1: Compress the log file
        try (FileOutputStream fos = new FileOutputStream(zipFile);
             ZipOutputStream zos = new ZipOutputStream(fos);
             FileInputStream fis = new FileInputStream(logFile)) {

            ZipEntry zipEntry = new ZipEntry(logFile.getName());
            zos.putNextEntry(zipEntry);

            byte[] buffer = new byte[1024];
            int length;
            while ((length = fis.read(buffer)) >= 0) {
                zos.write(buffer, 0, length);
            }

            zos.closeEntry();
            System.out.println("📦 Compressed log for port " + port + " → " + zipFileName);

        } catch (IOException e) {
            System.err.println("❌ Compression failed for port " + port + ": " + e.getMessage());
            return;
        }

        // Step 2: Upload to S3
        try {
            String fileUrl = s3Service.uploadFile(zipFile, bucketName, "telemetry-logs");
            System.out.println("✅ Uploaded file to S3: " + fileUrl);
        } catch (Exception e) {
            System.err.println("❌ Upload failed for port " + port + ": " + e.getMessage());
        }

        // Step 3: Delete the ZIP file after upload
        if (zipFile.exists() && zipFile.delete()) {
            System.out.println("🗑️ Deleted ZIP file for port " + port);
        } else {
            System.err.println("⚠️ Failed to delete ZIP file for port " + port);
        }
    }

    private void deleteLogFile(int port) {
        File logFile = new File("telemetry_logs/telemetry_" + port + ".log");
        if (logFile.exists() && logFile.delete()) {
            System.out.println("Deleted log file for port " + port);
        }
    }
}