package com.eci.backend.controller;

import com.eci.backend.model.Party;
import com.eci.backend.repository.PartyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/party")
@CrossOrigin(origins = "*")
public class PartyController {

    @Autowired
    private PartyRepository partyRepository;

    @GetMapping
    public ResponseEntity<List<Party>> listParties() {
        return ResponseEntity.ok(partyRepository.findAll());
    }

    @PostMapping("/register")
    public ResponseEntity<?> createParty(@RequestBody Party party) {
        if (party.getName() == null || party.getName().trim().isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Party name is required.");
            return ResponseEntity.badRequest().body(error);
        }

        party.setId("party-" + UUID.randomUUID().toString().substring(0, 8));
        party.setStatus("PENDING");
        party.setApproved(false);

        Party saved = partyRepository.save(party);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("party", saved);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateParty(@PathVariable String id, @RequestBody Party partyUpdates) {
        Optional<Party> partyOpt = partyRepository.findById(id);
        if (partyOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Party existing = partyOpt.get();
        if (partyUpdates.getName() != null) existing.setName(partyUpdates.getName());
        if (partyUpdates.getAbbrev() != null) existing.setAbbrev(partyUpdates.getAbbrev());
        if (partyUpdates.getPresidentName() != null) existing.setPresidentName(partyUpdates.getPresidentName());
        if (partyUpdates.getPresidentMobile() != null) existing.setPresidentMobile(partyUpdates.getPresidentMobile());
        if (partyUpdates.getOfficialEmail() != null) existing.setOfficialEmail(partyUpdates.getOfficialEmail());
        if (partyUpdates.getOfficialPhone() != null) existing.setOfficialPhone(partyUpdates.getOfficialPhone());
        if (partyUpdates.getSymbol() != null) existing.setSymbol(partyUpdates.getSymbol());
        if (partyUpdates.getAgenda() != null) existing.setAgenda(partyUpdates.getAgenda());

        Party updated = partyRepository.save(existing);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("party", updated);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteParty(@PathVariable String id) {
        if (!partyRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        partyRepository.deleteById(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        return ResponseEntity.ok(response);
    }
}
