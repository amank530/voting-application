package com.eci.backend.repository;

import com.eci.backend.model.Election;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ElectionRepository extends JpaRepository<Election, String> {
    List<Election> findByStatus(String status);
}
