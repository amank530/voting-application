package com.eci.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    private String id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String type;

    private String timestamp;
}
