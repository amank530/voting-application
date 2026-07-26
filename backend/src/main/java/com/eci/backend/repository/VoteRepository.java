package com.eci.backend.repository;

import com.eci.backend.model.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<Vote, String> {
    Optional<Vote> findByVoterIdAndElectionId(String voterId, String electionId);
    List<Vote> findByElectionId(String electionId);
}
