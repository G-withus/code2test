package com.mdt.telemetryjavamavlinkv2.utils;

import org.springframework.stereotype.Component;

import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;

@Component
public class ZeroTierIPProvider {
    public List<InetAddress> getZeroTierIPs() {
        List<InetAddress> zeroTierIPs = new ArrayList<>();
        try {
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            while (interfaces.hasMoreElements()) {
                NetworkInterface networkInterface = interfaces.nextElement();
                if (networkInterface.getName().contains("zt")) {
                    Enumeration<InetAddress> addresses = networkInterface.getInetAddresses();
                    while (addresses.hasMoreElements()) {
                        InetAddress address = addresses.nextElement();
                        if (address instanceof Inet4Address) {
                            zeroTierIPs.add(address);
                        }
                    }
                }
            }
        } catch (SocketException e) {
            System.err.println("❌ Error getting ZeroTier IPs: " + e.getMessage());
        }
        return zeroTierIPs;
    }
}