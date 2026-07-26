package com.eci.backend.controller;

import com.eci.backend.model.Election;
import com.eci.backend.repository.ElectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/elections")
@CrossOrigin(origins = "*")
public class ElectionController {

    @Autowired
    private ElectionRepository electionRepository;

    @GetMapping
    public ResponseEntity<List<Election>> listElections() {
        return ResponseEntity.ok(electionRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createElection(@RequestBody Election election) {
        if (election.getTitle() == null || election.getTitle().trim().isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Election title is required.");
            return ResponseEntity.badRequest().body(error);
        }

        election.setId("elec-" + UUID.randomUUID().toString().substring(0, 8));
        if (election.getStatus() == null) {
            election.setStatus("REGISTRATION_OPEN");
        }

        Election saved = electionRepository.save(election);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("election", saved);
        return ResponseEntity.ok(response);
    }
}
