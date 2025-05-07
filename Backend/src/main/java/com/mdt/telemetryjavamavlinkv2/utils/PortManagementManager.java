package com.mdt.telemetryjavamavlinkv2.utils;

import com.mdt.telemetryjavamavlinkv2.model.SenderEndPoint;
import com.mdt.telemetryjavamavlinkv2.repository.SenderEndPointRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Component
@RequiredArgsConstructor
public class PortManagementManager {

    private final SenderEndPointRepository senderEndPointRepository;

    private final ConcurrentHashMap<Integer, String> allowedSenderPorts = new ConcurrentHashMap<>();

    @PostConstruct
    public void loadAllowedSenderPortsFromDB(){
        List<SenderEndPoint> endPoints = senderEndPointRepository.findAll();

        allowedSenderPorts.clear();

        for (SenderEndPoint endPoint: endPoints){

            allowedSenderPorts.put(endPoint.getPort(), endPoint.getIpAddress());

        }

        System.out.println(allowedSenderPorts);
    }

    public boolean isPortAllowed(int port, String ipAddress) {
        String cleanedIp = cleanIp(ipAddress);
        String allowedIp = allowedSenderPorts.get(port);
        return cleanedIp.equals(allowedIp);
    }

    private String cleanIp(String ipAddress) {
        if (ipAddress == null) return "";
        // Remove leading "/" and trim spaces
        return ipAddress.replace("/", "").trim();
    }

    public ConcurrentMap<Integer, String> getAllowedSenderPorts(){
        return allowedSenderPorts;
    }

    public List<Integer> getAllRegisteredPorts() {
        return allowedSenderPorts.keySet().stream().toList();
    }
}
