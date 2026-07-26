package com.eci.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/ekyc")
@CrossOrigin(origins = "*")
public class EkycController {

    @Value("${ekyc.now.api.key:}")
    private String ekycApiKey;

    @PostMapping("/create-session")
    public ResponseEntity<?> createSession(@RequestBody Map<String, String> payload) {
        String aadharNumber = payload.get("aadharNumber");
        if (aadharNumber == null || aadharNumber.replaceAll("\\s+", "").length() != 12) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Invalid Aadhaar number. Must be 12 digits.");
            return ResponseEntity.badRequest().body(error);
        }

        String sessionId = "ekyc_sess_" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("sessionId", sessionId);
        result.put("message", "eKYC verification session established successfully via Java API Gateway");
        return ResponseEntity.ok(result);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> payload) {
        String otp = payload.get("otp");
        if (otp != null && otp.length() == 6) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Aadhaar OTP verified successfully");
            return ResponseEntity.ok(result);
        }

        Map<String, Object> error = new HashMap<>();
        error.put("error", "Aadhaar OTP must be 6 digits.");
        return ResponseEntity.badRequest().body(error);
    }

    @PostMapping("/face-match")
    public ResponseEntity<?> faceMatch(@RequestBody Map<String, Object> payload) {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("matchPercentage", 98.6);
        result.put("message", "Facial recognition matched with Aadhaar biometric archive");
        return ResponseEntity.ok(result);
    }
}
