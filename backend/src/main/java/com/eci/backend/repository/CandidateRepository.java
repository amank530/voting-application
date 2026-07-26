package com.eci.backend.repository;

import com.eci.backend.model.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, String> {
    List<Candidate> findByElectionId(String electionId);
    List<Candidate> findByPartyId(String partyId);
    List<Candidate> findByStatus(String status);
}
