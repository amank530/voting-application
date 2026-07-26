package com.eci.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "parties")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Party {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    private String abbrev;

    private String presidentName;

    private String presidentMobile;

    private String presidentAadhar;

    private String officialPhone;

    private String officialEmail;

    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    private Boolean approved = false;

    private String registrationNumber;

    private String symbol;

    private String adminId;

    private String password;

    @Column(columnDefinition = "TEXT")
    private String agenda;

    @Column(columnDefinition = "LONGTEXT")
    private String symbolDeclarationFile;
}
