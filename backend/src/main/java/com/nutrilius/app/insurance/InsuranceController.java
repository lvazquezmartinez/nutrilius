package com.nutrilius.app.insurance;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/insurances")
public class InsuranceController {
  private final InsuranceService insuranceService;

  public InsuranceController(InsuranceService insuranceService) {
    this.insuranceService = insuranceService;
  }

  @GetMapping
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public ResponseEntity<List<InsuranceResponse>> list() {
    return ResponseEntity.ok(insuranceService.list());
  }

  @PostMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<InsuranceResponse> create(@Valid @RequestBody InsuranceCreateRequest request) {
    return ResponseEntity.ok(insuranceService.create(request));
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<InsuranceResponse> update(@PathVariable Long id, @RequestBody InsuranceUpdateRequest request) {
    return ResponseEntity.ok(insuranceService.update(id, request));
  }
}
