package com.mdt.telemetryjavamavlinkv2.entry;

import com.mdt.telemetryjavamavlinkv2.service.MavlinkMessageHandlerService;
import com.mdt.telemetryjavamavlinkv2.utils.PortManagementManager;
import com.mdt.telemetryjavamavlinkv2.utils.ZeroTierIPProvider;
import io.dronefleet.mavlink.MavlinkConnection;
import io.dronefleet.mavlink.MavlinkMessage;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.*;
import java.util.List;
import java.util.Map;
import java.util.concurrent.*;

@Component
@RequiredArgsConstructor
public class MavlinkUdpInputEntry {

    private final PortManagementManager portManagementManager;
    private final ZeroTierIPProvider zeroTierIPProvider;
    private final MavlinkMessageHandlerService mavlinkMessageHandlerService;

    private final ExecutorService executorService = Executors.newCachedThreadPool();

    // Track active ports and their threads
    private final Map<Integer, Future<?>> activeListeningPorts = new ConcurrentHashMap<>();



    @PostConstruct
    public void init() {
        List<Integer> existingPorts = portManagementManager.getAllRegisteredPorts();
        startListeningOnPorts(existingPorts);
        createLogDirectory();
    }

    private void createLogDirectory() {
        File logDir = new File("telemetry_logs");
        if (!logDir.exists()) {
            boolean created = logDir.mkdir();
            if (created) {
                System.out.println("📁 Log directory created.");
            }
        }
    }
    public synchronized void startListeningOnPorts(List<Integer> ports) {
        portManagementManager.loadAllowedSenderPortsFromDB();

        for (int port : ports) {
            // Skip if already listening
            if (activeListeningPorts.containsKey(port)) {
                continue;
            }

            List<InetAddress> bindAddresses = zeroTierIPProvider.getZeroTierIPs();

            if (bindAddresses.isEmpty()) {
                try {
                    bindAddresses.add(InetAddress.getByName("0.0.0.0"));
                } catch (UnknownHostException e) {
                    System.err.printf("Error binding to 0.0.0.0 for port %d: %s%n", port, e.getMessage());
                    continue;
                }
            }

            // Start listener thread
            Future<?> future = executorService.submit(() -> {
                for (InetAddress address : bindAddresses) {
                    listenOnPort(address, port);
                }
            });

            activeListeningPorts.put(port, future);
            System.out.println("Started listening on port: " + port);
        }
    }

    // Stop listener on specific port (used on delete)
    public synchronized void stopListeningOnPort(int port) {
        Future<?> future = activeListeningPorts.remove(port);
        if (future != null) {
            future.cancel(true);
            System.out.println("Stopped listening on port: " + port);
        }
    }

    private void listenOnPort(InetAddress bindAddress, int port) {
        try (DatagramSocket udpSocket = new DatagramSocket(new InetSocketAddress(bindAddress, port))) {
            UdpInputStream udpInputStream = new UdpInputStream(udpSocket);
            MavlinkConnection mavlinkConnection = MavlinkConnection.create(udpInputStream, null);

            while (!Thread.currentThread().isInterrupted()) {
                MavlinkMessage<?> message = mavlinkConnection.next();

                if (message != null) {
                    InetAddress senderAddress = udpInputStream.getSenderAddress();
                    int senderPort = udpInputStream.getSenderPort();

                    if (portManagementManager.isPortAllowed(port, String.valueOf(senderAddress))) {
                        mavlinkMessageHandlerService.handleMessage(message, port, udpSocket, senderAddress, senderPort);
                    }
                }
            }

        } catch (IOException e) {
            if (Thread.currentThread().isInterrupted()) {
                System.out.println("Thread interrupted for port: " + port);
            } else {
                throw new RuntimeException(e);
            }
        }
    }

    private static class UdpInputStream extends InputStream {
        private final DatagramSocket socket;
        private final byte[] buffer = new byte[4096];
        private int position = 0, length = 0;

        @Getter
        private InetAddress senderAddress;
        @Getter
        private int senderPort;

        public UdpInputStream(DatagramSocket socket) {
            this.socket = socket;
        }

        @Override
        public int read() throws IOException {
            if (position >= length) {
                DatagramPacket packet = new DatagramPacket(buffer, buffer.length);
                socket.receive(packet);
                length = packet.getLength();
                position = 0;
                senderAddress = packet.getAddress();
                senderPort = packet.getPort();
            }
            return buffer[position++] & 0xFF;
        }
    }
}