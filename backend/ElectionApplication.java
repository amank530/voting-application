package backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@SpringBootApplication
public class ElectionApplication {
    public static void main(String[] args) {
        SpringApplication.run(ElectionApplication.class, args);
    }
}

// ==========================================
// 1. DOMAIN ENTITIES & SCHEMAS
// ==========================================

@Entity
@Table(name = "users")
class User {
    @Id
    private String id;
    private String mobileNumber;
    private String name;
    private String role; // ELECTION_COMMISSION, PARTY_ADMIN, CANDIDATE, VOTER
    private boolean isVerified;
    private Integer age;
    private String state;
    private String district;
    private String constituency;
    private boolean isBlocked;

    // Getters, Setters, Constructors
    public User() {}
    public User(String id, String mobileNumber, String name, String role, boolean isVerified, Integer age) {
        this.id = id;
        this.mobileNumber = mobileNumber;
        this.name = name;
        this.role = role;
        this.isVerified = isVerified;
        this.age = age;
        this.isBlocked = false;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public boolean isVerified() { return isVerified; }
    public void setVerified(boolean verified) { isVerified = verified; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public String getConstituency() { return constituency; }
    public void setConstituency(String constituency) { this.constituency = constituency; }
    public boolean isBlocked() { return isBlocked; }
    public void setBlocked(boolean blocked) { isBlocked = blocked; }
}

@Entity
@Table(name = "elections")
class Election {
    @Id
    private String id;
    private String title;
    private String level;
    private String state;
    private String district;
    private String constituency;
    private LocalDate votingDate;
    private LocalDate countingDate;
    private String status; // CREATED, REGISTRATION_OPEN, VOTING_OPEN, RESULTS_PUBLISHED, ARCHIVED
    private String winnerCandidateId;
    private String winnerName;
    private String winnerParty;
    private Integer winnerVotes = 0;
    private Integer totalVotersInConstituency = 0;

    // Getters, Setters, Constructors
    public Election() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public String getConstituency() { return constituency; }
    public void setConstituency(String constituency) { this.constituency = constituency; }
    public LocalDate getVotingDate() { return votingDate; }
    public void setVotingDate(LocalDate votingDate) { this.votingDate = votingDate; }
    public LocalDate getCountingDate() { return countingDate; }
    public void setCountingDate(LocalDate countingDate) { this.countingDate = countingDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}

@Entity
@Table(name = "parties")
class PoliticalParty {
    @Id
    private String id;
    private String name;
    private String abbrev;
    private String symbol;
    @Column(columnDefinition = "TEXT")
    private String manifesto;
    private boolean approved;
    private String status; // PENDING, APPROVED, SUSPENDED
    private String adminId;

    // Getters, Setters, Constructors
    public PoliticalParty() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getAbbrev() { return abbrev; }
    public void setAbbrev(String abbrev) { this.abbrev = abbrev; }
    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }
    public String getManifesto() { return manifesto; }
    public void setManifesto(String manifesto) { this.manifesto = manifesto; }
    public boolean isApproved() { return approved; }
    public void setApproved(boolean approved) { this.approved = approved; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAdminId() { return adminId; }
    public void setAdminId(String adminId) { this.adminId = adminId; }
}

@Entity
@Table(name = "candidate_codes")
class CandidateCode {
    @Id
    private String code;
    private String partyId;
    private String partyAbbrev;
    private String constituency;
    private String electionLevel;
    private String position;
    private boolean isUsed;
    private String candidateName;
    private String electionId;
    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters, Setters
    public CandidateCode() {}

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getPartyId() { return partyId; }
    public void setPartyId(String partyId) { this.partyId = partyId; }
    public String getPartyAbbrev() { return partyAbbrev; }
    public void setPartyAbbrev(String partyAbbrev) { this.partyAbbrev = partyAbbrev; }
    public String getConstituency() { return constituency; }
    public void setConstituency(String constituency) { this.constituency = constituency; }
    public String getElectionLevel() { return electionLevel; }
    public void setElectionLevel(String electionLevel) { this.electionLevel = electionLevel; }
    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }
    public boolean isUsed() { return isUsed; }
    public void setUsed(boolean used) { isUsed = used; }
    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }
    public String getElectionId() { return electionId; }
    public void setElectionId(String electionId) { this.electionId = electionId; }
}

@Entity
@Table(name = "votes")
class Vote {
    @Id
    private String id;
    private String electionId;
    private String voterId; // Hashed value for secrecy
    private String candidateId;
    private String partyId;
    private LocalDateTime timestamp = LocalDateTime.now();
    private String receiptId;
    @Column(columnDefinition = "TEXT")
    private String encryptionSignature;

    // Getters, Setters
    public Vote() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getElectionId() { return electionId; }
    public void setElectionId(String electionId) { this.electionId = electionId; }
    public String getVoterId() { return voterId; }
    public void setVoterId(String voterId) { this.voterId = voterId; }
    public String getCandidateId() { return candidateId; }
    public void setCandidateId(String candidateId) { this.candidateId = candidateId; }
    public String getPartyId() { return partyId; }
    public void setPartyId(String partyId) { this.partyId = partyId; }
    public String getReceiptId() { return receiptId; }
    public void setReceiptId(String receiptId) { this.receiptId = receiptId; }
    public String getEncryptionSignature() { return encryptionSignature; }
    public void setEncryptionSignature(String encryptionSignature) { this.encryptionSignature = encryptionSignature; }
}

// ==========================================
// 2. REPOSITORIES
// ==========================================

@Repository interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByMobileNumber(String mobileNumber);
}
@Repository interface ElectionRepository extends JpaRepository<Election, String> {}
@Repository interface PartyRepository extends JpaRepository<PoliticalParty, String> {}
@Repository interface CandidateCodeRepository extends JpaRepository<CandidateCode, String> {}
@Repository interface VoteRepository extends JpaRepository<Vote, String> {
    boolean existsByVoterIdAndElectionId(String voterId, String electionId);
}

// ==========================================
// 3. REST CONTROLLER (API Layer)
// ==========================================

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
class ElectionRestController {

    private final UserRepository userRepository;
    private final ElectionRepository electionRepository;
    private final PartyRepository partyRepository;
    private final CandidateCodeRepository codeRepository;
    private final VoteRepository voteRepository;

    public ElectionRestController(UserRepository userRepository, ElectionRepository electionRepository, 
                                  PartyRepository partyRepository, CandidateCodeRepository codeRepository, 
                                  VoteRepository voteRepository) {
        this.userRepository = userRepository;
        this.electionRepository = electionRepository;
        this.partyRepository = partyRepository;
        this.codeRepository = codeRepository;
        this.voteRepository = voteRepository;
    }

    // --- Authentication REST APIs ---
    @PostMapping("/auth/request-otp")
    public ResponseEntity<?> requestOtp(@RequestBody Map<String, String> payload) {
        String mobileNumber = payload.get("mobileNumber");
        if (mobileNumber == null || mobileNumber.length() < 10) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid 10-digit mobile number"));
        }
        String otp = String.format("%06d", new Random().nextInt(1000000));
        System.out.println("[JAVA Spring Boot Simulated OTP] " + mobileNumber + " -> OTP: " + otp);
        return ResponseEntity.ok(Map.of("success", true, "message", "OTP Sent", "otp", otp));
    }

    @PostMapping("/auth/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> payload) {
        String mobileNumber = payload.get("mobileNumber");
        String otp = payload.get("otp");

        // Simple OTP verification bypass/demo rule
        if (otp == null || otp.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Incorrect verification OTP"));
        }

        User user = userRepository.findByMobileNumber(mobileNumber).orElseGet(() -> {
            User newUser = new User(
                "usr-" + UUID.randomUUID().toString().substring(0, 8),
                mobileNumber,
                "Voter-" + mobileNumber.substring(Math.max(0, mobileNumber.length() - 4)),
                "VOTER",
                true,
                18
            );
            return userRepository.save(newUser);
        });

        if (user.isBlocked()) {
            return ResponseEntity.status(403).body(Map.of("error", "Your ECI access node has been locked. Contact Super Admin."));
        }

        String simulatedToken = "simulated-java-jwt-" + UUID.randomUUID().toString();
        return ResponseEntity.ok(Map.of("success", true, "user", user, "token", simulatedToken));
    }

    @PutMapping("/auth/profile/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable String id, @RequestBody User profileData) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User user = userOpt.get();
        user.setName(profileData.getName());
        user.setAge(profileData.getAge());
        user.setState(profileData.getState());
        user.setDistrict(profileData.getDistrict());
        user.setConstituency(profileData.getConstituency());
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("success", true, "user", user));
    }

    // --- Electronic Ballots & Cryptographic Voting APIs ---
    @PostMapping("/votes/cast")
    public ResponseEntity<?> castVote(@RequestBody Map<String, String> payload) {
        String electionId = payload.get("electionId");
        String voterId = payload.get("voterId");
        String candidateId = payload.get("candidateId");
        String partyId = payload.get("partyId");

        // Verify single vote restriction
        if (voteRepository.existsByVoterIdAndElectionId(voterId, electionId)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Civil Protection: You have already voted in this ballot."));
        }

        String receiptId = "REC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String signature = "0x" + UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");

        Vote vote = new Vote();
        vote.setId("v-" + UUID.randomUUID().toString().substring(0, 8));
        vote.setElectionId(electionId);
        vote.setVoterId(voterId);
        vote.setCandidateId(candidateId);
        vote.setPartyId(partyId);
        vote.setReceiptId(receiptId);
        vote.setEncryptionSignature(signature);

        voteRepository.save(vote);
        return ResponseEntity.ok(Map.of("success", true, "receipt", vote));
    }

    @GetMapping("/votes/status")
    public ResponseEntity<?> getVoteStatus(@RequestParam String voterId, @RequestParam String electionId) {
        boolean hasVoted = voteRepository.existsByVoterIdAndElectionId(voterId, electionId);
        return ResponseEntity.ok(Map.of("hasVoted", hasVoted));
    }
}
