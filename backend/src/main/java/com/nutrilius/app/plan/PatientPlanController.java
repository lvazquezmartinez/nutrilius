package com.nutrilius.app.plan;

import com.nutrilius.app.settings.TenantSettingsService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patients/{patientId}/plan")
public class PatientPlanController {
  private final PatientPlanService service;
  private final PlanPdfService planPdfService;
  private final TenantSettingsService settingsService;

  public PatientPlanController(PatientPlanService service, PlanPdfService planPdfService, TenantSettingsService settingsService) {
    this.service = service;
    this.planPdfService = planPdfService;
    this.settingsService = settingsService;
  }

  @GetMapping
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public ResponseEntity<PatientPlanResponse> get(@PathVariable Long patientId) {
    return ResponseEntity.ok(service.get(patientId));
  }

  @PutMapping
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public ResponseEntity<PatientPlanResponse> upsert(@PathVariable Long patientId, @Valid @RequestBody PatientPlanRequest request) {
    return ResponseEntity.ok(service.upsert(patientId, request));
  }

  @GetMapping(value = "/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public ResponseEntity<byte[]> pdf(@PathVariable Long patientId) throws Exception {
    if (!settingsService.get().isPlanEnabled()) {
      return ResponseEntity.badRequest().build();
    }
    byte[] pdf = planPdfService.generate(patientId);
    return ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_PDF)
        .body(pdf);
  }
}
