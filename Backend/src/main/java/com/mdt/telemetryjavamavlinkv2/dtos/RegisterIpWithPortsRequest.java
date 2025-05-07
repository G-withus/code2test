package com.mdt.telemetryjavamavlinkv2.dtos;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class RegisterIpWithPortsRequest {

    private String ipAddress;
    private String port;
}
