package com.eci.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "elections")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Election {

    @Id
    private String id;

    @Column(nullable = false)
    private String title;

    private String level;

    private String votingDate;

    private String countingDate;

    private String status; // REGISTRATION_OPEN, VOTING_OPEN, COUNTING, RESULTS_PUBLISHED

    private Integer candidateCount = 0;

    private Integer voteCount = 0;

    private Integer totalVotersInConstituency = 0;

    private String state;

    private String district;

    private String constituency;

    private String cityGramNagar;

    private String winnerCandidateId;

    private String winnerName;

    private String winnerParty;

    private Integer winnerVotes;
}
