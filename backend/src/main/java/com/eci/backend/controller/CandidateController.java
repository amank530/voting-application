package com.eci.backend.controller;

import com.eci.backend.model.Candidate;
import com.eci.backend.model.Code;
import com.eci.backend.repository.CandidateRepository;
import com.eci.backend.repository.CodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/candidates")
@CrossOrigin(origins = "*")
public class CandidateController {

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private CodeRepository codeRepository;

    @GetMapping
    public ResponseEntity<List<Candidate>> listCandidates() {
        return ResponseEntity.ok(candidateRepository.findAll());
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerCandidate(@RequestBody Candidate candidateRequest) {
        if (!Boolean.TRUE.equals(candidateRequest.getIsIndependent()) && !"AWAITING_EC_CONFIRMATION".equalsIgnoreCase(candidateRequest.getStatus())) {
            String authCodeStr = candidateRequest.getAuthCode();
            if (authCodeStr == null || authCodeStr.trim().isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Official Authorization Ticket Code from Political Party is mandatory for non-independent candidates.");
                return ResponseEntity.badRequest().body(error);
            }

            Optional<Code> codeOpt = codeRepository.findByCodeIgnoreCase(authCodeStr.trim());
            if (codeOpt.isEmpty() || Boolean.TRUE.equals(codeOpt.get().getIsUsed())) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Invalid or already used Party Authorization Code.");
                return ResponseEntity.badRequest().body(error);
            }

            // Mark code as used
            Code code = codeOpt.get();
            code.setIsUsed(true);
            code.setCandidateName(candidateRequest.getName());
            codeRepository.save(code);
        }

        candidateRequest.setId("cand-" + UUID.randomUUID().toString().substring(0, 8));
        if (candidateRequest.getStatus() == null) {
            candidateRequest.setStatus(Boolean.TRUE.equals(candidateRequest.getIsIndependent()) ? "PENDING" : "APPROVED");
        }
        candidateRequest.setTicketNumber("TKT-2026-" + (int)(100000 + Math.random() * 900000));

        Candidate saved = candidateRepository.save(candidateRequest);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("candidate", saved);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateCandidateStatus(@PathVariable String id, @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        Optional<Candidate> candidateOpt = candidateRepository.findById(id);
        if (candidateOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Candidate candidate = candidateOpt.get();
        candidate.setStatus(status);
        Candidate updated = candidateRepository.save(candidate);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("candidate", updated);
        return ResponseEntity.ok(response);
    }
}
