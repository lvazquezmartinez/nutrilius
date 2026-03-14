package com.nutrilius.app.patient;

import com.nutrilius.app.security.SecurityUtil;
import com.nutrilius.app.security.UserPrincipal;
import com.nutrilius.app.user.UserRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class PatientService {
  private final PatientRepository patientRepository;
  private final UserRepository userRepository;

  public PatientService(PatientRepository patientRepository, UserRepository userRepository) {
    this.patientRepository = patientRepository;
    this.userRepository = userRepository;
  }

  public PatientResponse create(PatientCreateRequest request) {
    UserPrincipal current = SecurityUtil.currentUser();
    if (current == null || current.getTenantId() == null) {
      throw new IllegalArgumentException("Tenant inválido");
    }

    Patient patient = new Patient();
    patient.setFirstName(request.getFirstName());
    patient.setLastName(request.getLastName());
    patient.setFullName(buildFullName(request.getFirstName(), request.getLastName()));
    patient.setDni(request.getDni());
    patient.setBirthDate(request.getBirthDate());
    patient.setPhone(request.getPhone());
    patient.setEmail(request.getEmail());
    patient.setAddress(request.getAddress());
    patient.setSex(request.getSex());
    patient.setNotes(request.getNotes());
    patient.setTenant(userRepository.findById(current.getUserId()).orElseThrow().getTenant());
    patient.setCreatedBy(userRepository.findById(current.getUserId()).orElseThrow());

    Patient saved = patientRepository.save(patient);
    return new PatientResponse(saved);
  }

  public List<PatientResponse> list() {
    UserPrincipal current = SecurityUtil.currentUser();
    if (current == null || current.getTenantId() == null) {
      throw new IllegalArgumentException("Tenant inválido");
    }
    return patientRepository.findByTenantId(current.getTenantId()).stream()
        .map(PatientResponse::new)
        .collect(Collectors.toList());
  }

  public List<PatientResponse> search(String q) {
    UserPrincipal current = SecurityUtil.currentUser();
    if (current == null || current.getTenantId() == null) {
      throw new IllegalArgumentException("Tenant inválido");
    }
    if (q == null || q.trim().isEmpty()) {
      return list();
    }
    return patientRepository.search(current.getTenantId(), q.trim()).stream()
        .map(PatientResponse::new)
        .collect(Collectors.toList());
  }

  public PatientResponse update(Long id, PatientCreateRequest request) {
    UserPrincipal current = SecurityUtil.currentUser();
    if (current == null || current.getTenantId() == null) {
      throw new IllegalArgumentException("Tenant inválido");
    }
    Patient patient = patientRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Paciente no encontrado"));
    if (!patient.getTenant().getId().equals(current.getTenantId())) {
      throw new IllegalArgumentException("Sin acceso a este paciente");
    }
    patient.setFirstName(request.getFirstName());
    patient.setLastName(request.getLastName());
    patient.setFullName(buildFullName(request.getFirstName(), request.getLastName()));
    patient.setDni(request.getDni());
    patient.setBirthDate(request.getBirthDate());
    patient.setPhone(request.getPhone());
    patient.setEmail(request.getEmail());
    patient.setAddress(request.getAddress());
    patient.setSex(request.getSex());
    patient.setNotes(request.getNotes());
    Patient saved = patientRepository.save(patient);
    return new PatientResponse(saved);
  }

  public Patient getPatientForTenant(Long patientId) {
    UserPrincipal current = SecurityUtil.currentUser();
    if (current == null || current.getTenantId() == null) {
      throw new IllegalArgumentException("Tenant inválido");
    }
    Patient patient = patientRepository.findById(patientId)
        .orElseThrow(() -> new IllegalArgumentException("Paciente no encontrado"));
    if (!patient.getTenant().getId().equals(current.getTenantId())) {
      throw new IllegalArgumentException("Sin acceso a este paciente");
    }
    return patient;
  }

  public PatientResponse get(Long id) {
    return new PatientResponse(getPatientForTenant(id));
  }

  private String buildFullName(String firstName, String lastName) {
    String fn = firstName == null ? "" : firstName.trim();
    String ln = lastName == null ? "" : lastName.trim();
    String full = (fn + " " + ln).trim();
    return full.isEmpty() ? "Sin nombre" : full;
  }
}
