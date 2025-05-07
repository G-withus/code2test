package com.mdt.telemetryjavamavlinkv2.repository;

import com.mdt.telemetryjavamavlinkv2.model.SenderEndPoint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SenderEndPointRepository extends JpaRepository<SenderEndPoint, Long> {

    Optional<SenderEndPoint> findByPort(Integer port);

    Optional<SenderEndPoint> findByIpAddress(String ipAddress);
}
