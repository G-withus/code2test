package com.mdt.telemetryjavamavlinkv2.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class TelemetryLogUploaderService {

    private final S3Service s3Service;

    @Value("${cloud.aws.s3.bucket-name}")
    private String bucketName;

    public TelemetryLogUploaderService(S3Service s3Service) {
        this.s3Service = s3Service;
    }

    public void compressAndUploadLogFile(File logFile, int port) {
        if (!logFile.exists()) return;

        String timestamp = new SimpleDateFormat("yyyy-MM-dd_HH-mm-ss").format(new Date());
        String zipFileName = logFile.getName() + "-" + timestamp + ".zip";
        File zipFile = new File("telemetry_logs", zipFileName);

        try (FileOutputStream fos = new FileOutputStream(zipFile);
             ZipOutputStream zos = new ZipOutputStream(fos);
             FileInputStream fis = new FileInputStream(logFile)) {

            zos.putNextEntry(new ZipEntry(logFile.getName()));
            byte[] buffer = new byte[1024];
            int length;
            while ((length = fis.read(buffer)) > 0) {
                zos.write(buffer, 0, length);
            }
            zos.closeEntry();

            System.out.println("Compressed log for port " + port + " → " + zipFile.getName());

        } catch (IOException e) {
            System.err.println("Compression failed for port " + port + ": " + e.getMessage());
            return;
        }


        try {
            String url = s3Service.uploadFile(zipFile, bucketName, "telemetry-logs");
            System.out.println("Uploaded to S3: " + url);
        } catch (Exception e) {
            System.err.println(" S3 upload failed for port " + port + ": " + e.getMessage());
        }


        if (zipFile.exists() && zipFile.delete()) {
            System.out.println("Deleted ZIP file for port " + port);
        }
    }
}