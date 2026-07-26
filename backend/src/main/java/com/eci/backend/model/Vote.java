package com.eci.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "votes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vote {

    @Id
    private String id;

    private String electionId;

    private String voterId;

    private String candidateId;

    private String partyId;

    private String timestamp;

    private String receiptId;

    private String encryptionSignature;
}
