package com.mdt.telemetryjavamavlinkv2.dtos;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SenderEndPointSimpleResponse {
    private Long id;
    private String ipAddress;
    private String port;
}