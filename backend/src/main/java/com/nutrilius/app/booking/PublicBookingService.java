package com.nutrilius.app.booking;

import com.nutrilius.app.common.VisitStatus;
import com.nutrilius.app.patient.Patient;
import com.nutrilius.app.patient.PatientService;
import com.nutrilius.app.settings.TenantSettings;
import com.nutrilius.app.settings.TenantSettingsService;
import com.nutrilius.app.user.User;
import com.nutrilius.app.user.UserRepository;
import com.nutrilius.app.visit.Visit;
import com.nutrilius.app.visit.VisitRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class PublicBookingService {
  private final TenantSettingsService settingsService;
  private final PatientService patientService;
  private final UserRepository userRepository;
  private final VisitRepository visitRepository;

  public PublicBookingService(TenantSettingsService settingsService, PatientService patientService,
                              UserRepository userRepository, VisitRepository visitRepository) {
    this.settingsService = settingsService;
    this.patientService = patientService;
    this.userRepository = userRepository;
    this.visitRepository = visitRepository;
  }

  @Transactional
  public PublicBookingInfoResponse getInfo(String slug) {
    TenantSettings settings = settingsService.findByPublicBookingSlug(slug);
    if (!settings.getTenant().isActive()) {
      throw new IllegalArgumentException("Agenda no disponible");
    }
    return new PublicBookingInfoResponse(
        settings.getNutritionistName(),
        settings.getBusinessName(),
        settings.getLicenseNumber(),
        settings.getPublicBookingSlug()
    );
  }

  @Transactional
  public PublicBookingResponse book(String slug, PublicBookingRequest request) {
    TenantSettings settings = settingsService.findByPublicBookingSlug(slug);
    if (!settings.getTenant().isActive()) {
      throw new IllegalArgumentException("Agenda no disponible");
    }

    User admin = userRepository.findAdminByTenantId(settings.getTenant().getId())
        .orElseThrow(() -> new IllegalArgumentException("No hay administrador configurado"));

    String dni = request.getDni().trim();
    Patient patient = patientService.findByTenantAndDni(settings.getTenant().getId(), dni).orElse(null);
    boolean existingPatient = patient != null;

    if (patient == null) {
      patient = new Patient();
      patient.setTenant(settings.getTenant());
      patient.setCreatedBy(admin);
      patient.setFirstName(request.getFirstName());
      patient.setLastName(request.getLastName());
      patient.setFullName(buildFullName(request.getFirstName(), request.getLastName()));
      patient.setDni(dni);
      patient.setPhone(request.getPhone());
      patient.setEmail(request.getEmail());
      patient.setNew(true);
      patient = patientService.save(patient);
    }

    Visit visit = new Visit();
    visit.setTenant(settings.getTenant());
    visit.setPatient(patient);
    visit.setCreatedBy(admin);
    visit.setVisitDate(request.getScheduledAt().toLocalDate());
    visit.setScheduledAt(request.getScheduledAt());
    visit.setDurationMinutes(request.getDurationMinutes() != null ? request.getDurationMinutes() : 45);
    visit.setStatus(VisitStatus.SCHEDULED);
    visit.setNotes(request.getNotes());
    Visit savedVisit = visitRepository.save(visit);

    return new PublicBookingResponse(patient.getId(), existingPatient, patient.isNew(), savedVisit.getId());
  }

  private String buildFullName(String firstName, String lastName) {
    String fn = firstName == null ? "" : firstName.trim();
    String ln = lastName == null ? "" : lastName.trim();
    String full = (fn + " " + ln).trim();
    return full.isEmpty() ? "Sin nombre" : full;
  }
}
