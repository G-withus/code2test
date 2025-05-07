package com.mdt.telemetryjavamavlinkv2.service;

import com.mdt.telemetryjavamavlinkv2.dtos.RegisterIpWithPortsRequest;
import com.mdt.telemetryjavamavlinkv2.dtos.SenderEndPointSimpleResponse;
import com.mdt.telemetryjavamavlinkv2.entry.MavlinkUdpInputEntry;
import com.mdt.telemetryjavamavlinkv2.model.SenderEndPoint;
import com.mdt.telemetryjavamavlinkv2.repository.SenderEndPointRepository;
import com.mdt.telemetryjavamavlinkv2.utils.PortManagementManager;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PortManagementService {

    private final SenderEndPointRepository senderEndPointRepository;
    private final PortManagementManager portManagementManager;
    private final MavlinkUdpInputEntry mavlinkUdpInputEntry;

    public ResponseEntity<String> registerIpWithPort(RegisterIpWithPortsRequest request) {
        Integer port = Integer.valueOf(request.getPort());

        Optional<SenderEndPoint> portExists = senderEndPointRepository.findByPort(port);
        if (portExists.isPresent()) {
            return ResponseEntity.status(409).body("Port " + port + " is already registered");
        }

        Optional<SenderEndPoint> ipExists = senderEndPointRepository.findByIpAddress(request.getIpAddress());
        if (ipExists.isPresent()) {
            return ResponseEntity.status(409).body("IP Address " + request.getIpAddress() + " is already registered");
        }

        SenderEndPoint senderEndPoint = SenderEndPoint.builder()
                .ipAddress(request.getIpAddress())
                .port(port)
                .build();

        senderEndPointRepository.save(senderEndPoint);
        portManagementManager.loadAllowedSenderPortsFromDB();

        mavlinkUdpInputEntry.startListeningOnPorts(List.of(port));

        return ResponseEntity.ok("Registered successfully");
    }

    public List<SenderEndPointSimpleResponse> getAllSimple() {
        List<SenderEndPoint> endpoints = senderEndPointRepository.findAll();

        return endpoints.stream()
                .map(endpoint -> SenderEndPointSimpleResponse.builder()
                        .id(endpoint.getId())
                        .ipAddress(endpoint.getIpAddress())
                        .port(String.valueOf(endpoint.getPort()))
                        .build()
                )
                .collect(Collectors.toList());
    }



    public ResponseEntity<String> updateIpWithPort(Long id, RegisterIpWithPortsRequest request) {
        SenderEndPoint existing = senderEndPointRepository.findById(id)
                .orElse(null);

        if (existing == null) {
            return ResponseEntity.status(404).body("SenderEndPoint with id " + id + " not found");
        }

        Integer newPort = Integer.valueOf(request.getPort());
        String newIp = request.getIpAddress();

        Optional<SenderEndPoint> portExists = senderEndPointRepository.findByPort(newPort);
        if (portExists.isPresent() && !portExists.get().getId().equals(id)) {
            return ResponseEntity.status(409).body("Port " + newPort + " is already registered");
        }

        Optional<SenderEndPoint> ipExists = senderEndPointRepository.findByIpAddress(newIp);
        if (ipExists.isPresent() && !ipExists.get().getId().equals(id)) {
            return ResponseEntity.status(409).body("IP Address " + newIp + " is already registered");
        }

        existing.setIpAddress(newIp);
        existing.setPort(newPort);

        senderEndPointRepository.save(existing);
        portManagementManager.loadAllowedSenderPortsFromDB();

        return ResponseEntity.ok("Updated successfully");
    }

    public ResponseEntity<String> deleteSenderEndPoint(Long id) {
        SenderEndPoint existing = senderEndPointRepository.findById(id)
                .orElse(null);

        if (existing == null) {
            return ResponseEntity.status(404).body("SenderEndPoint with id " + id + " not found");
        }

        senderEndPointRepository.delete(existing);
        portManagementManager.loadAllowedSenderPortsFromDB();

        mavlinkUdpInputEntry.stopListeningOnPort(existing.getPort());

        return ResponseEntity.ok("Deleted successfully");
    }
}