package com.eci.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "candidates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Candidate {

    @Id
    private String id;

    private String name;

    private String mobileNumber;

    private String aadharNumber;

    private String email;

    private Integer age;

    private String gender;

    private String electionId;

    private String electionTitle;

    private String electionLevel;

    private String state;

    private String district;

    private String constituency;

    private String cityGramNagar;

    private String wardNo;

    private String city;

    private String town;

    private String municipalCorporation;

    private String municipalCouncil;

    private String nagarPanchayat;

    private String block;

    private String gramPanchayat;

    private Boolean isIndependent = false;

    private String partyId;

    private String partyName;

    private String partyAbbrev;

    private String partySymbol;

    private String authCode;

    @Column(columnDefinition = "LONGTEXT")
    private String affidavitFile;

    private String status = "PENDING"; // PENDING, PARTY_APPROVED, APPROVED, REJECTED

    private String officialCandidateId;

    private String ticketNumber;

    private String authorizationCode;
}
