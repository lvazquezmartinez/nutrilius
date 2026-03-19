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
  private final PlanAiService planAiService;

  public PatientPlanController(PatientPlanService service, PlanPdfService planPdfService, TenantSettingsService settingsService, PlanAiService planAiService) {
    this.service = service;
    this.planPdfService = planPdfService;
    this.settingsService = settingsService;
    this.planAiService = planAiService;
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

  @PostMapping("/generate")
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public ResponseEntity<PatientPlanResponse> generate(@PathVariable Long patientId, @RequestBody PlanGenerateRequest request) {
    String planType = settingsService.get().getPlanType();
    if (planType == null || (!planType.equalsIgnoreCase("PRO") && !planType.equalsIgnoreCase("PREMIUM"))) {
      return ResponseEntity.badRequest().build();
    }
    String content = planAiService.generate(patientId, request != null ? request.getNotes() : null);
    PatientPlanRequest payload = new PatientPlanRequest();
    payload.setContentText(content);
    return ResponseEntity.ok(service.upsert(patientId, payload));
  }

  @GetMapping(value = "/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public ResponseEntity<byte[]> pdf(@PathVariable Long patientId) throws Exception {
    String planType = settingsService.get().getPlanType();
    if (planType == null || (!planType.equalsIgnoreCase("PRO") && !planType.equalsIgnoreCase("PREMIUM"))) {
      return ResponseEntity.badRequest().build();
    }
    byte[] pdf = planPdfService.generate(patientId);
    return ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_PDF)
        .body(pdf);
  }
}
