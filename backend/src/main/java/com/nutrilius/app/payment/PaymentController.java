package com.nutrilius.app.payment;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patients/{patientId}/payments")
public class PaymentController {
  private final PaymentService paymentService;

  public PaymentController(PaymentService paymentService) {
    this.paymentService = paymentService;
  }

  @PostMapping
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public ResponseEntity<PaymentResponse> create(@PathVariable Long patientId, @RequestBody PaymentCreateRequest request) {
    return ResponseEntity.ok(paymentService.create(patientId, request));
  }

  @GetMapping
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public ResponseEntity<List<PaymentResponse>> list(@PathVariable Long patientId) {
    return ResponseEntity.ok(paymentService.list(patientId));
  }
}
