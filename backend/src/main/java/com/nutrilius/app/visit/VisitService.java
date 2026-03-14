package com.nutrilius.app.visit;

import com.nutrilius.app.patient.Patient;
import com.nutrilius.app.patient.PatientService;
import com.nutrilius.app.security.SecurityUtil;
import com.nutrilius.app.security.UserPrincipal;
import com.nutrilius.app.user.UserRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class VisitService {
  private final VisitRepository visitRepository;
  private final PatientService patientService;
  private final UserRepository userRepository;

  public VisitService(VisitRepository visitRepository, PatientService patientService, UserRepository userRepository) {
    this.visitRepository = visitRepository;
    this.patientService = patientService;
    this.userRepository = userRepository;
  }

  public VisitResponse create(Long patientId, VisitCreateRequest request) {
    UserPrincipal current = SecurityUtil.currentUser();
    Patient patient = patientService.getPatientForTenant(patientId);

    Visit visit = new Visit();
    visit.setTenant(patient.getTenant());
    visit.setPatient(patient);
    visit.setCreatedBy(userRepository.findById(current.getUserId()).orElseThrow());
    LocalDate date = request.getVisitDate() != null ? request.getVisitDate() : LocalDate.now();
    visit.setVisitDate(date);
    visit.setNotes(request.getNotes());

    return new VisitResponse(visitRepository.save(visit));
  }

  public List<VisitResponse> list(Long patientId) {
    UserPrincipal current = SecurityUtil.currentUser();
    patientService.getPatientForTenant(patientId);
    return visitRepository.findByTenantIdAndPatientId(current.getTenantId(), patientId)
        .stream()
        .map(VisitResponse::new)
        .collect(Collectors.toList());
  }
}
