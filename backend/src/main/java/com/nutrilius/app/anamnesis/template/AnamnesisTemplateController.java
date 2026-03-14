package com.nutrilius.app.anamnesis.template;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/anamnesis-template")
public class AnamnesisTemplateController {
  private final AnamnesisTemplateService service;

  public AnamnesisTemplateController(AnamnesisTemplateService service) {
    this.service = service;
  }

  @GetMapping
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public ResponseEntity<AnamnesisTemplateResponse> get() {
    return ResponseEntity.ok(service.get());
  }

  @PutMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<AnamnesisTemplateResponse> update(@Valid @RequestBody AnamnesisTemplateUpdateRequest request) {
    return ResponseEntity.ok(service.update(request));
  }

  @PostMapping("/reset")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<AnamnesisTemplateResponse> reset() {
    return ResponseEntity.ok(service.resetToDefault());
  }
}
