package com.nutrilius.app.metrics;

import com.nutrilius.app.patient.Patient;
import com.nutrilius.app.patient.PatientService;
import com.nutrilius.app.security.SecurityUtil;
import com.nutrilius.app.security.UserPrincipal;
import com.nutrilius.app.user.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class PatientMetricService {
  private final PatientMetricRepository patientMetricRepository;
  private final PatientService patientService;
  private final UserRepository userRepository;

  public PatientMetricService(PatientMetricRepository patientMetricRepository, PatientService patientService, UserRepository userRepository) {
    this.patientMetricRepository = patientMetricRepository;
    this.patientService = patientService;
    this.userRepository = userRepository;
  }

  public PatientMetricResponse create(Long patientId, PatientMetricCreateRequest request) {
    UserPrincipal current = SecurityUtil.currentUser();
    Patient patient = patientService.getPatientForTenant(patientId);

    PatientMetric metric = new PatientMetric();
    metric.setTenant(patient.getTenant());
    metric.setPatient(patient);
    metric.setCreatedBy(userRepository.findById(current.getUserId()).orElseThrow());
    metric.setMeasuredAt(request.getMeasuredAt() != null ? request.getMeasuredAt() : LocalDateTime.now());
    metric.setWeightKg(toBigDecimal(request.getWeightKg()));
    metric.setHeightM(toBigDecimal(request.getHeightM()));
    metric.setBmi(toBigDecimal(request.getBmi()));
    metric.setWaistCm(toBigDecimal(request.getWaistCm()));
    metric.setNeckCm(toBigDecimal(request.getNeckCm()));

    return new PatientMetricResponse(patientMetricRepository.save(metric));
  }

  public List<PatientMetricResponse> list(Long patientId) {
    UserPrincipal current = SecurityUtil.currentUser();
    patientService.getPatientForTenant(patientId);
    return patientMetricRepository.findByTenantIdAndPatientIdOrderByMeasuredAtAsc(current.getTenantId(), patientId)
        .stream()
        .map(PatientMetricResponse::new)
        .collect(Collectors.toList());
  }

  private BigDecimal toBigDecimal(Double value) {
    return value == null ? null : BigDecimal.valueOf(value);
  }
}
