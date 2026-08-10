package com.example.backendjevanready.Controller;

import com.example.backendjevanready.Entity.Booking;
import com.example.backendjevanready.Repository.BookingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingRepository bookingRepository;

    public BookingController(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    // Student creates booking
    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody Booking booking) {
        Booking saved = bookingRepository.save(booking);
        return ResponseEntity.ok(saved);
    }

    // Student fetches booking history
    @GetMapping("/student")
    public ResponseEntity<List<Booking>> getStudentBookings(@RequestParam String email) {
        return ResponseEntity.ok(bookingRepository.findByStudentEmail(email));
    }

    // Owner dashboard: Fetches bookings and calculates total earnings
    @GetMapping("/owner")
    public ResponseEntity<Map<String, Object>> getOwnerDashboard(@RequestParam String messName) {
        List<Booking> bookings = bookingRepository.findByMessNameOrderByBookingDateDesc(messName);
        double totalEarnings = bookings.stream().mapToDouble(Booking::getPrice).sum();

        Map<String, Object> response = new HashMap<>();
        response.put("bookings", bookings);
        response.put("totalEarnings", totalEarnings);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id) {
        if (bookingRepository.existsById(id)) {
            bookingRepository.deleteById(id);
            return ResponseEntity.ok().body("Booking cancelled successfully.");
        }
        return ResponseEntity.notFound().build();
    }
}