package com.eci.backend.controller;

import com.eci.backend.model.Candidate;
import com.eci.backend.model.Election;
import com.eci.backend.model.Party;
import com.eci.backend.repository.CandidateRepository;
import com.eci.backend.repository.ElectionRepository;
import com.eci.backend.repository.PartyRepository;
import com.eci.backend.repository.VoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class EcAdminController {

    @Autowired
    private PartyRepository partyRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private ElectionRepository electionRepository;

    @Autowired
    private VoteRepository voteRepository;

    @GetMapping("/parties")
    public ResponseEntity<List<Party>> getAllParties() {
        return ResponseEntity.ok(partyRepository.findAll());
    }

    @PutMapping("/parties/{id}/status")
    public ResponseEntity<?> updatePartyStatus(@PathVariable String id, @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        Optional<Party> partyOpt = partyRepository.findById(id);
        if (partyOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Party party = partyOpt.get();
        party.setStatus(status);
        party.setApproved("APPROVED".equalsIgnoreCase(status));
        if ("APPROVED".equalsIgnoreCase(status) && party.getRegistrationNumber() == null) {
            party.setRegistrationNumber("ECI-REG-" + party.getAbbrev() + "-" + (int)(100000 + Math.random() * 900000));
        }

        Party updated = partyRepository.save(party);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/candidates")
    public ResponseEntity<List<Candidate>> getAllCandidates() {
        return ResponseEntity.ok(candidateRepository.findAll());
    }

    @PutMapping("/candidates/{id}/status")
    public ResponseEntity<?> updateCandidateStatus(@PathVariable String id, @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        Optional<Candidate> candidateOpt = candidateRepository.findById(id);
        if (candidateOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Candidate candidate = candidateOpt.get();
        candidate.setStatus(status);
        Candidate updated = candidateRepository.save(candidate);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/elections")
    public ResponseEntity<Election> createElection(@RequestBody Election election) {
        if (election.getId() == null) {
            election.setId("elec-" + (int)(100000 + Math.random() * 900000));
        }
        Election saved = electionRepository.save(election);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/elections/{id}/publish-results")
    public ResponseEntity<?> publishResults(@PathVariable String id) {
        Optional<Election> electionOpt = electionRepository.findById(id);
        if (electionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Election election = electionOpt.get();
        election.setStatus("RESULTS_PUBLISHED");
        Election updated = electionRepository.save(election);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("election", updated);
        response.put("message", "Election results published successfully");
        return ResponseEntity.ok(response);
    }
}
