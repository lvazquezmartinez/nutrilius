package com.nutrilius.app.booking;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/public/booking")
public class PublicBookingController {
  private final PublicBookingService service;

  public PublicBookingController(PublicBookingService service) {
    this.service = service;
  }

  @GetMapping("/{slug}")
  public ResponseEntity<PublicBookingInfoResponse> getInfo(@PathVariable String slug) {
    return ResponseEntity.ok(service.getInfo(slug));
  }

  @PostMapping("/{slug}")
  public ResponseEntity<PublicBookingResponse> book(@PathVariable String slug, @Valid @RequestBody PublicBookingRequest request) {
    return ResponseEntity.ok(service.book(slug, request));
  }
}
