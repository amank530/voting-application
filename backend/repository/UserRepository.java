package com.eci.backend.repository;

import com.eci.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByMobileNumber(String mobileNumber);
    Optional<User> findByAadharNumber(String aadharNumber);
}
