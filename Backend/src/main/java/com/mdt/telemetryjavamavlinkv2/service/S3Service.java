package com.mdt.telemetryjavamavlinkv2.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Client s3Client;

    @Value("${cloud.aws.region.static}")
    private String region;

    public String uploadFile(File file, String bucketName, String folderName) {
        String key = folderName + "/" + file.getName();

        try (FileInputStream fis = new FileInputStream(file)) {
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(key)
                            .contentType("application/zip")
                            .build(),
                    RequestBody.fromInputStream(fis, file.length())
            );
            return "https://%s.s3.%s.amazonaws.com/%s".formatted(bucketName, region, key);
        } catch (S3Exception e) {
            throw new RuntimeException("Failed to upload file: " + e.awsErrorDetails().errorMessage());
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file: " + e.getMessage());
        }
    }
}
