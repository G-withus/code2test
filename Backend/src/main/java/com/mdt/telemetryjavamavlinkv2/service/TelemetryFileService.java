package com.mdt.telemetryjavamavlinkv2.service;

import org.springframework.stereotype.Service;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;

@Service
public class TelemetryFileService {

    private final SimpleDateFormat timestampsFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    private final SimpleDateFormat filenameTimestampFormat = new SimpleDateFormat("yyyy-MM-dd_HH-mm-ss");
    private final String timestamp = filenameTimestampFormat.format(new Date());

    public void createLogFile(int port, Map<String, Object> telemetryData) {
        File logFile = new File("telemetry_logs", "Received_" + timestamp +"_"+  "_GCSIP_" + telemetryData.get("GCS_IP") +"_SYSID_ "+ telemetryData.get("system_id") + "_t.log");
        try {
            if (logFile.createNewFile()){
                System.out.println(logFile.getAbsolutePath());
            }
        } catch (IOException e) {
            System.out.println(e.getMessage());
        }
    }

    public void logTelemetryData(int port, Map<String, Object> telemetryData){
        File logFile = new File("telemetry_logs", "Received_" + timestamp +  "_GCSIP_" + telemetryData.get("GCS_IP") +"_SYSID_ "+ telemetryData.get("system_id") + "_t.log");
        try(BufferedWriter writer = new BufferedWriter(new FileWriter(logFile, true))){
            writer.write(telemetryData.toString());
            writer.write(System.lineSeparator()); // Adds a new line
        }catch (IOException e){
            System.err.println("Error writing log for port " + port + ": " + e.getMessage());
        }
    }
    public File getLogFile(int port, Map<String, Object> telemetryData) {
        return new File("telemetry_logs", "Received_" + timestamp +"_"+  "_GCSIP_" + telemetryData.get("GCS_IP") +"_SYSID_ "+ telemetryData.get("system_id") + "_t.log");
    }

    public void deleteLogFile(int port,Map<String, Object> telemetryData) {
        File logFile = getLogFile(port,telemetryData);
        if (logFile.exists() && logFile.delete()) {
            System.out.println("Deleted log file for port " + port);
        }
    }
}
