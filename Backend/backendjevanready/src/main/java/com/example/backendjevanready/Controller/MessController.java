package com.example.backendjevanready.Controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.backendjevanready.Entity.MessProfile;
import com.example.backendjevanready.Repository.MessProfileRepository; // Ensure this import points to your repo

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.List;

@RestController
@RequestMapping("/api/mess")
public class MessController {

    private final MessProfileRepository messProfileRepository;

    @Value("${file.upload-dir:uploads/}")
    private String uploadDir;

    // Inject Repository via constructor
    public MessController(MessProfileRepository messProfileRepository) {
        this.messProfileRepository = messProfileRepository;
    }

    // Fetch all messes for student browse page
    @GetMapping
    public ResponseEntity<List<MessProfile>> getAllMesses() {
        return ResponseEntity.ok(messProfileRepository.findAll());
    }

    // Get single mess profile by owner email
@GetMapping("/owner")
public ResponseEntity<?> getMessByOwner(@RequestParam("email") String email) {
    return messProfileRepository.findByOwnerEmail(email)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
}

// Update Mess Profile
@PutMapping("/update/{id}")
public ResponseEntity<?> updateMess(
        @PathVariable Long id,
        @RequestParam("loc") String location,
        @RequestParam("fee") Double monthlyFee,
        @RequestParam(value = "nv", required = false) String nonVegRate,
        @RequestParam(value = "time", required = false) String timings,
        @RequestParam(value = "menu", required = false) String menuHighlights,
        @RequestParam(value = "mess_photo", required = false) MultipartFile file) {

    return messProfileRepository.findById(id).map(mess -> {
        mess.setLocation(location);
        mess.setMonthlyFee(monthlyFee);
        mess.setNonVegRate(nonVegRate);
        mess.setTimings(timings);
        mess.setMenuHighlights(menuHighlights);

        if (file != null && !file.isEmpty()) {
            // Optional: Save file and set image path
        }

        MessProfile updated = messProfileRepository.save(mess);
        return ResponseEntity.ok(updated);
    }).orElse(ResponseEntity.notFound().build());
}

// Delete Mess Profile
@DeleteMapping("/{id}")
public ResponseEntity<?> deleteMess(@PathVariable Long id) {
    if (messProfileRepository.existsById(id)) {
        messProfileRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
    return ResponseEntity.notFound().build();
}

    // Owner setup endpoint with multipart file support
    @PostMapping("/setup")
    public ResponseEntity<?> setupMess(
            @RequestParam("ownerEmail") String ownerEmail,
            @RequestParam("messName") String messName,
            @RequestParam("loc") String location,
            @RequestParam("fee") Double monthlyFee,
            @RequestParam(value = "nv", required = false) String nonVegRate,
            @RequestParam(value = "time", required = false) String timings,
            @RequestParam(value = "menu", required = false) String menuHighlights,
            @RequestParam("mess_photo") MultipartFile file) {

        try {
            // 1. Ensure upload directory exists
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 2. Process file extension and generate unique name
            String originalFilename = file.getOriginalFilename();
            String extension = ".jpg";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String uniqueFilename = System.currentTimeMillis() + "_" + java.util.UUID.randomUUID().toString().substring(0, 8) + extension;
            Path filePath = uploadPath.resolve(uniqueFilename);

            // 3. Save physical file to disk
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // 4. Create and save entity to Database using Repository
            MessProfile messProfile = new MessProfile();
            messProfile.setOwnerEmail(ownerEmail);
            messProfile.setMessName(messName);
            messProfile.setLocation(location);
            messProfile.setMonthlyFee(monthlyFee);
            messProfile.setNonVegRate(nonVegRate);
            messProfile.setTimings(timings);
            messProfile.setMenuHighlights(menuHighlights);
            messProfile.setImagePath("/uploads/" + uniqueFilename);

            MessProfile saved = messProfileRepository.save(messProfile);
            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            e.printStackTrace(); // Prints exact error in Spring Boot terminal
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error saving mess profile: " + e.getMessage());
        }
    }
}