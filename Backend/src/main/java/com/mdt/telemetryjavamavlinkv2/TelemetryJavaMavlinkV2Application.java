package com.mdt.telemetryjavamavlinkv2;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TelemetryJavaMavlinkV2Application {

	public static void main(String[] args) {
		SpringApplication.run(TelemetryJavaMavlinkV2Application.class, args);
	}

}
