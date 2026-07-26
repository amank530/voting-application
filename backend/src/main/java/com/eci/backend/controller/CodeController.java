package com.eci.backend.controller;

import com.eci.backend.model.Code;
import com.eci.backend.repository.CodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/codes")
@CrossOrigin(origins = "*")
public class CodeController {

    @Autowired
    private CodeRepository codeRepository;

    @GetMapping
    public ResponseEntity<List<Code>> getAllCodes() {
        return ResponseEntity.ok(codeRepository.findAll());
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateCode(@RequestBody Code codeRequest) {
        String randomCode = "ECI-TKT-" + (int)(100000 + Math.random() * 900000);
        codeRequest.setCode(randomCode);
        codeRequest.setIsUsed(false);
        codeRequest.setCreatedAt(Instant.now().toString());

        Code saved = codeRepository.save(codeRequest);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("code", saved);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyCode(@RequestBody Map<String, String> payload) {
        String codeStr = payload.get("code");
        if (codeStr == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Code parameter is required.");
            return ResponseEntity.badRequest().body(error);
        }

        Optional<Code> codeOpt = codeRepository.findByCodeIgnoreCase(codeStr.trim());
        if (codeOpt.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("valid", false);
            error.put("error", "Code not found.");
            return ResponseEntity.status(404).body(error);
        }

        Code code = codeOpt.get();
        Map<String, Object> response = new HashMap<>();
        response.put("valid", !Boolean.TRUE.equals(code.getIsUsed()));
        response.put("codeDetails", code);
        return ResponseEntity.ok(response);
    }
}
