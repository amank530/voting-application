package com.eci.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "codes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Code {

    @Id
    private String code;

    private String partyId;

    private String partyAbbrev;

    private String constituency;

    private String electionLevel;

    private String position;

    private Boolean isUsed = false;

    private String candidateName;

    private String electionId;

    private String createdAt;
}
