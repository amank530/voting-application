package com.eci.backend.controller;

import com.eci.backend.model.User;
import com.eci.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/voter")
@CrossOrigin(origins = "*")
public class VoterController {

    @Autowired
    private UserRepository userRepository;

    private final Map<String, String> activeOtps = new ConcurrentHashMap<>();

    @PostMapping("/request-otp")
    public ResponseEntity<?> requestOtp(@RequestBody Map<String, String> payload) {
        String mobileNumber = payload.get("mobileNumber");
        if (mobileNumber == null || mobileNumber.trim().length() < 10) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Please enter a valid 10-digit mobile number.");
            return ResponseEntity.badRequest().body(error);
        }

        String generatedOtp = String.valueOf((int) (100000 + Math.random() * 900000));
        activeOtps.put(mobileNumber, generatedOtp);

        System.out.println("[Java VoterController] OTP for " + mobileNumber + " is " + generatedOtp);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "OTP sent successfully (Simulated)");
        response.put("otp", generatedOtp);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> payload) {
        String mobileNumber = payload.get("mobileNumber");
        String otp = payload.get("otp");

        if (mobileNumber == null || otp == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Mobile number and OTP are required.");
            return ResponseEntity.badRequest().body(error);
        }

        String storedOtp = activeOtps.get(mobileNumber);
        if (storedOtp == null || !storedOtp.equals(otp)) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Invalid verification code. Please try again.");
            return ResponseEntity.status(401).body(error);
        }

        Optional<User> userOpt = userRepository.findByMobileNumber(mobileNumber);
        User user;
        if (userOpt.isPresent()) {
            user = userOpt.get();
        } else {
            user = User.builder()
                    .id("usr-" + UUID.randomUUID().toString().substring(0, 8))
                    .mobileNumber(mobileNumber)
                    .name("Voter-" + mobileNumber.substring(Math.max(0, mobileNumber.length() - 4)))
                    .role("VOTER")
                    .isVerified(true)
                    .age(18)
                    .build();
            user = userRepository.save(user);
        }

        activeOtps.remove(mobileNumber);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("user", user);
        response.put("token", "sim-jwt-java-" + user.getId() + "-" + UUID.randomUUID().toString().substring(0, 12));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> citizenSignup(@RequestBody User userRequest) {
        if (userRequest.getAadharNumber() == null || userRequest.getAadharNumber().replaceAll("\\s+", "").length() != 12) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Please enter a valid 12-digit Aadhaar number.");
            return ResponseEntity.badRequest().body(error);
        }

        if (userRequest.getName() == null || userRequest.getName().trim().isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Please enter your full name.");
            return ResponseEntity.badRequest().body(error);
        }

        if (userRequest.getAge() != null && userRequest.getAge() < 18) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Age compliance failed. You must be at least 18 years old to register.");
            return ResponseEntity.badRequest().body(error);
        }

        if (userRequest.getMobileNumber() != null && userRepository.findByMobileNumber(userRequest.getMobileNumber()).isPresent()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Mobile number is already registered.");
            return ResponseEntity.badRequest().body(error);
        }

        userRequest.setId("usr-" + UUID.randomUUID().toString().substring(0, 8));
        userRequest.setIsVerified(true);
        if (userRequest.getRole() == null) {
            userRequest.setRole("VOTER");
        }

        User savedUser = userRepository.save(userRequest);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("user", savedUser);
        response.put("message", "Voter account created and verified via eKYC.");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable String id, @RequestBody User profileUpdates) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User existingUser = userOpt.get();
        if (profileUpdates.getName() != null) existingUser.setName(profileUpdates.getName());
        if (profileUpdates.getGender() != null) existingUser.setGender(profileUpdates.getGender());
        if (profileUpdates.getAge() != null) existingUser.setAge(profileUpdates.getAge());
        if (profileUpdates.getState() != null) existingUser.setState(profileUpdates.getState());
        if (profileUpdates.getDistrict() != null) existingUser.setDistrict(profileUpdates.getDistrict());
        if (profileUpdates.getConstituency() != null) existingUser.setConstituency(profileUpdates.getConstituency());
        if (profileUpdates.getPhoto() != null) existingUser.setPhoto(profileUpdates.getPhoto());

        User updated = userRepository.save(existingUser);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("user", updated);
        return ResponseEntity.ok(response);
    }
}
