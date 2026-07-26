package com.eci.backend.repository;

import com.eci.backend.model.Code;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CodeRepository extends JpaRepository<Code, String> {
    Optional<Code> findByCodeIgnoreCase(String code);
}
