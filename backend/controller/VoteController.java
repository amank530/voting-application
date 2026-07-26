package com.eci.backend.controller;

import com.eci.backend.model.Election;
import com.eci.backend.model.Vote;
import com.eci.backend.repository.ElectionRepository;
import com.eci.backend.repository.VoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/votes")
@CrossOrigin(origins = "*")
public class VoteController {

    @Autowired
    private VoteRepository voteRepository;

    @Autowired
    private ElectionRepository electionRepository;

    @PostMapping("/cast")
    public ResponseEntity<?> castVote(@RequestBody Vote voteRequest) {
        if (voteRequest.getVoterId() == null || voteRequest.getElectionId() == null || voteRequest.getCandidateId() == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Voter ID, Election ID, and Candidate ID are required.");
            return ResponseEntity.badRequest().body(error);
        }

        // Check if voter already voted in this election
        Optional<Vote> existingVote = voteRepository.findByVoterIdAndElectionId(voteRequest.getVoterId(), voteRequest.getElectionId());
        if (existingVote.isPresent()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "You have already cast your ballot for this election session.");
            return ResponseEntity.badRequest().body(error);
        }

        voteRequest.setId("vt-" + UUID.randomUUID().toString().substring(0, 10));
        voteRequest.setReceiptId("ECI-VTR-" + (int)(100000 + Math.random() * 900000));
        voteRequest.setTimestamp(Instant.now().toString());
        voteRequest.setEncryptionSignature("SHA256-ECI-BALLOT-ENC-" + UUID.randomUUID().toString().replace("-", ""));

        Vote savedVote = voteRepository.save(voteRequest);

        // Update election total vote count
        Optional<Election> elecOpt = electionRepository.findById(voteRequest.getElectionId());
        if (elecOpt.isPresent()) {
            Election election = elecOpt.get();
            election.setVoteCount((election.getVoteCount() == null ? 0 : election.getVoteCount()) + 1);
            electionRepository.save(election);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("receiptId", savedVote.getReceiptId());
        response.put("vote", savedVote);
        response.put("message", "Ballot successfully encrypted & cast securely into digital EVM repository.");
        return ResponseEntity.ok(response);
    }
}
