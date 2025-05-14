package com.mdt.telemetryjavamavlinkv2.controller;

import com.mdt.telemetryjavamavlinkv2.dtos.RegisterIpWithPortsRequest;
import com.mdt.telemetryjavamavlinkv2.dtos.SenderEndPointSimpleResponse;
import com.mdt.telemetryjavamavlinkv2.service.PortManagementService;
import com.mdt.telemetryjavamavlinkv2.utils.PortManagementManager;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/ports")
@RequiredArgsConstructor
@CrossOrigin("*")
public class PortManagementController {

    private final PortManagementService portManagementService;
    private final PortManagementManager portManagementManager;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterIpWithPortsRequest request) {
        try {
            String message = portManagementService.registerIpWithPort(request);
            return ResponseEntity.ok(message);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        }
    }

    @GetMapping("/list")
    public List<SenderEndPointSimpleResponse> getSimpleList() {
        return portManagementService.getAllSimple();
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<String> update(@PathVariable Long id, @RequestBody RegisterIpWithPortsRequest request) {
        try {
            String message = portManagementService.updateIpWithPort(id, request);
            return ResponseEntity.ok(message);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        try {
            String message = portManagementService.deleteSenderEndPoint(id);
            return ResponseEntity.ok(message);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
}