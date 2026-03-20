package com.nutrilius.app.plan;

import com.nutrilius.app.security.SecurityUtil;
import com.nutrilius.app.security.UserPrincipal;
import com.nutrilius.app.settings.TenantSettingsService;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
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
  private final PatientPlanRepository planRepository;
  private final String apiUrl;

  public PatientPlanController(PatientPlanService service, PlanPdfService planPdfService, TenantSettingsService settingsService,
                               PlanAiService planAiService, PatientPlanRepository planRepository,
                               @Value("${app.api-url:http://localhost:8080}") String apiUrl) {
    this.service = service;
    this.planPdfService = planPdfService;
    this.settingsService = settingsService;
    this.planAiService = planAiService;
    this.planRepository = planRepository;
    this.apiUrl = apiUrl;
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

  @PostMapping("/share")
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public ResponseEntity<Map<String, String>> share(@PathVariable Long patientId) {
    UserPrincipal current = SecurityUtil.currentUser();
    PatientPlan plan = planRepository.findByTenantIdAndPatientId(current.getTenantId(), patientId)
        .orElseThrow(() -> new IllegalArgumentException("Plan no encontrado"));
    if (plan.getShareToken() == null || plan.getShareToken().isBlank()) {
      plan.setShareToken(UUID.randomUUID().toString());
    }
    plan.setShareEnabled(true);
    planRepository.save(plan);

    String url = apiUrl + "/public/plan/" + plan.getShareToken() + "/pdf";
    Map<String, String> response = new HashMap<>();
    response.put("url", url);
    return ResponseEntity.ok(response);
  }
}
