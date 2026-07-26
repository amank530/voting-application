package com.eci.backend.config;

import com.eci.backend.model.Election;
import com.eci.backend.model.Party;
import com.eci.backend.model.User;
import com.eci.backend.repository.ElectionRepository;
import com.eci.backend.repository.PartyRepository;
import com.eci.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PartyRepository partyRepository;

    @Autowired
    private ElectionRepository electionRepository;

    @Value("${eci.admin.email:admin@eci.gov.in}")
    private String ecAdminEmail;

    @Value("${eci.admin.password:ECI_Chief_Admin_2026!}")
    private String ecAdminPassword;

    @Override
    public void run(String... args) throws Exception {
        // Seed Super EC Admin Account
        if (userRepository.findByMobileNumber("9876543210").isEmpty()) {
            User ecAdmin = User.builder()
                    .id("usr-ec-admin")
                    .mobileNumber("9876543210")
                    .name("Super Admin (ECI Chief Commissioner)")
                    .role("ELECTION_COMMISSION")
                    .isVerified(true)
                    .password(ecAdminPassword)
                    .state("Delhi")
                    .district("New Delhi")
                    .constituency("Central Delhi")
                    .build();
            userRepository.save(ecAdmin);
            System.out.println("[DatabaseInitializer] EC Admin Account seeded successfully from .env details.");
        }

        // Seed Sample Party
        if (partyRepository.count() == 0) {
            Party bjp = Party.builder()
                    .id("party-bjp")
                    .name("Bharatiya Janata Party")
                    .abbrev("BJP")
                    .presidentName("J.P. Nadda")
                    .status("APPROVED")
                    .approved(true)
                    .registrationNumber("ECI-REG-BJP-4921")
                    .symbol("🪷")
                    .build();

            Party inc = Party.builder()
                    .id("party-inc")
                    .name("Indian National Congress")
                    .abbrev("INC")
                    .presidentName("Mallikarjun Kharge")
                    .status("APPROVED")
                    .approved(true)
                    .registrationNumber("ECI-REG-INC-2931")
                    .symbol("✋")
                    .build();

            partyRepository.save(bjp);
            partyRepository.save(inc);
            System.out.println("[DatabaseInitializer] Sample political parties seeded.");
        }

        // Seed Sample Election
        if (electionRepository.count() == 0) {
            Election election = Election.builder()
                    .id("elec-ls-2026")
                    .title("Lok Sabha General Elections 2026")
                    .level("Lok Sabha (MP)")
                    .votingDate("2026-10-15")
                    .countingDate("2026-10-18")
                    .status("REGISTRATION_OPEN")
                    .candidateCount(0)
                    .voteCount(0)
                    .totalVotersInConstituency(1250000)
                    .build();

            electionRepository.save(election);
            System.out.println("[DatabaseInitializer] Sample election seeded.");
        }
    }
}
