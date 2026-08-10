package com.example.backendjevanready.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backendjevanready.Entity.Booking;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByMessNameOrderByBookingDateDesc(String messName);
    List<Booking> findByStudentEmail(String studentEmail);
}