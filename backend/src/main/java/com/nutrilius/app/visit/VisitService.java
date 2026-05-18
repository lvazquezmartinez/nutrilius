package com.nutrilius.app.visit;

import com.nutrilius.app.patient.Patient;
import com.nutrilius.app.patient.PatientService;
import com.nutrilius.app.common.VisitStatus;
import com.nutrilius.app.security.SecurityUtil;
import com.nutrilius.app.security.UserPrincipal;
import com.nutrilius.app.user.UserRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
    LocalDateTime scheduledAt = request.getScheduledAt() != null
        ? request.getScheduledAt()
        : (request.getVisitDate() != null
            ? request.getVisitDate().atTime(9, 0)
            : LocalDateTime.now().withSecond(0).withNano(0));
    LocalDate date = scheduledAt.toLocalDate();
    visit.setVisitDate(date);
    visit.setScheduledAt(scheduledAt);
    visit.setDurationMinutes(request.getDurationMinutes() != null ? request.getDurationMinutes() : 45);
    visit.setStatus(request.getStatus() != null ? request.getStatus() : inferVisitStatus(scheduledAt));
    visit.setNotes(request.getNotes());
    if (visit.getStatus() == VisitStatus.COMPLETED && patient.isNew()) {
      patient.setNew(false);
      patientService.save(patient);
    }

    return new VisitResponse(visitRepository.save(visit));
  }

  public List<VisitResponse> list(Long patientId) {
    UserPrincipal current = SecurityUtil.currentUser();
    patientService.getPatientForTenant(patientId);
    return visitRepository.findByTenantIdAndPatientIdOrderByScheduledAtDescIdDesc(current.getTenantId(), patientId)
        .stream()
        .map(VisitResponse::new)
        .collect(Collectors.toList());
  }

  private VisitStatus inferVisitStatus(LocalDateTime scheduledAt) {
    return scheduledAt.isBefore(LocalDateTime.now()) ? VisitStatus.COMPLETED : VisitStatus.SCHEDULED;
  }
}
