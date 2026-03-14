package com.nutrilius.app.plan;

import com.nutrilius.app.patient.Patient;
import com.nutrilius.app.patient.PatientService;
import com.nutrilius.app.security.SecurityUtil;
import com.nutrilius.app.security.UserPrincipal;
import com.nutrilius.app.user.UserRepository;
import java.time.Instant;
import org.springframework.stereotype.Service;

@Service
public class PatientPlanService {
  private final PatientPlanRepository repository;
  private final PatientService patientService;
  private final UserRepository userRepository;

  public PatientPlanService(PatientPlanRepository repository, PatientService patientService, UserRepository userRepository) {
    this.repository = repository;
    this.patientService = patientService;
    this.userRepository = userRepository;
  }

  public PatientPlanResponse get(Long patientId) {
    UserPrincipal current = SecurityUtil.currentUser();
    patientService.getPatientForTenant(patientId);
    return repository.findByTenantIdAndPatientId(current.getTenantId(), patientId)
        .map(PatientPlanResponse::new)
        .orElse(null);
  }

  public PatientPlanResponse upsert(Long patientId, PatientPlanRequest request) {
    UserPrincipal current = SecurityUtil.currentUser();
    Patient patient = patientService.getPatientForTenant(patientId);

    PatientPlan plan = repository.findByTenantIdAndPatientId(current.getTenantId(), patientId)
        .orElseGet(() -> {
          PatientPlan p = new PatientPlan();
          p.setTenant(patient.getTenant());
          p.setPatient(patient);
          p.setCreatedBy(userRepository.findById(current.getUserId()).orElseThrow());
          return p;
        });

    plan.setContentText(request.getContentText());
    plan.setUpdatedAt(Instant.now());
    return new PatientPlanResponse(repository.save(plan));
  }
}
