package com.nutrilius.app.plan;

import com.nutrilius.app.settings.TenantSettings;
import com.nutrilius.app.settings.TenantSettingsRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/public/plan")
public class PublicPlanController {
  private final PatientPlanRepository planRepository;
  private final TenantSettingsRepository settingsRepository;
  private final PlanPdfService planPdfService;

  public PublicPlanController(PatientPlanRepository planRepository, TenantSettingsRepository settingsRepository, PlanPdfService planPdfService) {
    this.planRepository = planRepository;
    this.settingsRepository = settingsRepository;
    this.planPdfService = planPdfService;
  }

  @GetMapping(value = "/{token}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
  @Transactional
  public ResponseEntity<byte[]> pdf(@PathVariable String token) throws Exception {
    PatientPlan plan = planRepository.findByShareToken(token).orElse(null);
    if (plan == null || !plan.isShareEnabled()) {
      return ResponseEntity.notFound().build();
    }
    TenantSettings settings = settingsRepository.findByTenantId(plan.getTenant().getId()).orElse(new TenantSettings());
    byte[] pdf = planPdfService.generateForPlan(plan.getContentText(), plan.getPatient(), settings);
    return ResponseEntity.ok().contentType(MediaType.APPLICATION_PDF).body(pdf);
  }
}
