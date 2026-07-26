package com.eci.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    private String id;

    private String userId;

    private String userName;

    private String role;

    private String action;

    @Column(columnDefinition = "TEXT")
    private String details;

    private String timestamp;
}
