package com.nutrilius.app.metrics;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patients/{patientId}/metrics")
public class PatientMetricController {
  private final PatientMetricService patientMetricService;

  public PatientMetricController(PatientMetricService patientMetricService) {
    this.patientMetricService = patientMetricService;
  }

  @PostMapping
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public ResponseEntity<PatientMetricResponse> create(@PathVariable Long patientId, @RequestBody PatientMetricCreateRequest request) {
    return ResponseEntity.ok(patientMetricService.create(patientId, request));
  }

  @GetMapping
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public ResponseEntity<List<PatientMetricResponse>> list(@PathVariable Long patientId) {
    return ResponseEntity.ok(patientMetricService.list(patientId));
  }
}
