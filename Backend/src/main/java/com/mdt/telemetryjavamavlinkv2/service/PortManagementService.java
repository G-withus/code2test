package com.mdt.telemetryjavamavlinkv2.service;

import com.mdt.telemetryjavamavlinkv2.dtos.RegisterIpWithPortsRequest;
import com.mdt.telemetryjavamavlinkv2.dtos.SenderEndPointSimpleResponse;
import com.mdt.telemetryjavamavlinkv2.entry.MavlinkUdpInputEntry;
import com.mdt.telemetryjavamavlinkv2.model.SenderEndPoint;
import com.mdt.telemetryjavamavlinkv2.repository.SenderEndPointRepository;
import com.mdt.telemetryjavamavlinkv2.utils.PortManagementManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PortManagementService {

    private final SenderEndPointRepository senderEndPointRepository;
    private final PortManagementManager portManagementManager;
    private final MavlinkUdpInputEntry mavlinkUdpInputEntry;

    public String registerIpWithPort(RegisterIpWithPortsRequest request) {
        Integer port = Integer.valueOf(request.getPort());

        Optional<SenderEndPoint> portExists = senderEndPointRepository.findByPort(port);
        if (portExists.isPresent()) {
            throw new IllegalStateException("Port " + port + " is already registered");
        }

        Optional<SenderEndPoint> ipExists = senderEndPointRepository.findByIpAddress(request.getIpAddress());
        if (ipExists.isPresent()) {
            throw new IllegalStateException("IP Address " + request.getIpAddress() + " is already registered");
        }

        SenderEndPoint senderEndPoint = SenderEndPoint.builder()
                .ipAddress(request.getIpAddress())
                .port(port)
                .build();

        senderEndPointRepository.save(senderEndPoint);
        portManagementManager.loadAllowedSenderPortsFromDB();

        mavlinkUdpInputEntry.startListeningOnPorts(List.of(port));

        return "Registered successfully";
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

    public String updateIpWithPort(Long id, RegisterIpWithPortsRequest request) {
        SenderEndPoint existing = senderEndPointRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("SenderEndPoint with id " + id + " not found"));

        Integer newPort = Integer.valueOf(request.getPort());
        String newIp = request.getIpAddress();

        Optional<SenderEndPoint> portExists = senderEndPointRepository.findByPort(newPort);
        if (portExists.isPresent() && !portExists.get().getId().equals(id)) {
            throw new IllegalStateException("Port " + newPort + " is already registered");
        }

        Optional<SenderEndPoint> ipExists = senderEndPointRepository.findByIpAddress(newIp);
        if (ipExists.isPresent() && !ipExists.get().getId().equals(id)) {
            throw new IllegalStateException("IP Address " + newIp + " is already registered");
        }

        existing.setIpAddress(newIp);
        existing.setPort(newPort);

        senderEndPointRepository.save(existing);
        portManagementManager.loadAllowedSenderPortsFromDB();

        return "Updated successfully";
    }

    public String deleteSenderEndPoint(Long id) {
        SenderEndPoint existing = senderEndPointRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("SenderEndPoint with id " + id + " not found"));

        senderEndPointRepository.delete(existing);
        portManagementManager.loadAllowedSenderPortsFromDB();

        mavlinkUdpInputEntry.stopListeningOnPort(existing.getPort());

        return "Deleted successfully";
    }
}