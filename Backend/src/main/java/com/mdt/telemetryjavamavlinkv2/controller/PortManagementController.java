package com.mdt.telemetryjavamavlinkv2.controller;

import com.mdt.telemetryjavamavlinkv2.dtos.RegisterIpWithPortsRequest;
import com.mdt.telemetryjavamavlinkv2.dtos.SenderEndPointSimpleResponse;
import com.mdt.telemetryjavamavlinkv2.service.PortManagementService;
import com.mdt.telemetryjavamavlinkv2.utils.PortManagementManager;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ports")
@RequiredArgsConstructor
@CrossOrigin("*")
public class PortManagementController {

    private final PortManagementService portManagementService;
    private final PortManagementManager portManagementManager;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterIpWithPortsRequest request) {
        return portManagementService.registerIpWithPort(request);
    }

    @GetMapping("/list")
    public List<SenderEndPointSimpleResponse> getSimpleList() {
        return portManagementService.getAllSimple();
    }


    @PutMapping("/update/{id}")
    public ResponseEntity<String> update(@PathVariable Long id, @RequestBody RegisterIpWithPortsRequest request) {
        return portManagementService.updateIpWithPort(id, request);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        return portManagementService.deleteSenderEndPoint(id);
    }
}