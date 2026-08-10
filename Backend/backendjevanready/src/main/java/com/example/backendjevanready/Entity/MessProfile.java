package com.example.backendjevanready.Entity;

import org.jspecify.annotations.Nullable;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "mess_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String ownerEmail;
    private String messName;
    private String location;
    private Double monthlyFee;
    private String nonVegRate;
    private String timings;

    @Column(columnDefinition = "TEXT")
    private String menuHighlights;

    private String imagePath;

    public static @Nullable Object findAll() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'findAll'");
    }

    public static MessProfile save(MessProfile messProfile) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'save'");
    }
}