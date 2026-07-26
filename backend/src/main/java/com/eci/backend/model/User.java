package com.eci.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    private String id;

    @Column(nullable = false, unique = true)
    private String mobileNumber;

    private String name;

    private String role; // VOTER, PARTY_ADMIN, ELECTION_COMMISSION, CANDIDATE

    private Boolean isVerified = false;

    private Integer age;

    private String gender;

    private String state;

    private String district;

    private String constituency;

    @Column(unique = true)
    private String aadharNumber;

    private String password;

    private String partyId;

    private String nominationStatus;

    @Column(columnDefinition = "LONGTEXT")
    private String nominationDetails;

    @Column(columnDefinition = "LONGTEXT")
    private String photo;
}
