package com.nutrilius.app.patient;

import com.nutrilius.app.security.SecurityUtil;
import com.nutrilius.app.security.UserPrincipal;
import com.nutrilius.app.user.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class PatientService {
  private final PatientRepository patientRepository;
  private final UserRepository userRepository;
  private final EntityManager entityManager;

  public PatientService(PatientRepository patientRepository, UserRepository userRepository, EntityManager entityManager) {
    this.patientRepository = patientRepository;
    this.userRepository = userRepository;
    this.entityManager = entityManager;
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
    patient.setNew(request.getIsNew() != null ? request.getIsNew() : true);
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
    if (request.getIsNew() != null) {
      patient.setNew(request.getIsNew());
    }
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

  @Transactional
  public void delete(Long id) {
    Patient patient = getPatientForTenant(id);

    entityManager.createNativeQuery("DELETE FROM payments WHERE patient_id = :patientId")
        .setParameter("patientId", patient.getId())
        .executeUpdate();
    entityManager.createNativeQuery("DELETE FROM visits WHERE patient_id = :patientId")
        .setParameter("patientId", patient.getId())
        .executeUpdate();
    entityManager.createNativeQuery("DELETE FROM anamneses WHERE patient_id = :patientId")
        .setParameter("patientId", patient.getId())
        .executeUpdate();
    entityManager.createNativeQuery("DELETE FROM patient_metrics WHERE patient_id = :patientId")
        .setParameter("patientId", patient.getId())
        .executeUpdate();
    entityManager.createNativeQuery("DELETE FROM evolutions WHERE patient_id = :patientId")
        .setParameter("patientId", patient.getId())
        .executeUpdate();
    entityManager.createNativeQuery("DELETE FROM patient_plans WHERE patient_id = :patientId")
        .setParameter("patientId", patient.getId())
        .executeUpdate();

    patientRepository.delete(patient);
  }

  private String buildFullName(String firstName, String lastName) {
    String fn = firstName == null ? "" : firstName.trim();
    String ln = lastName == null ? "" : lastName.trim();
    String full = (fn + " " + ln).trim();
    return full.isEmpty() ? "Sin nombre" : full;
  }

  public java.util.Optional<Patient> findByTenantAndDni(Long tenantId, String dni) {
    if (tenantId == null || dni == null || dni.trim().isEmpty()) {
      return java.util.Optional.empty();
    }
    return patientRepository.findByTenantIdAndDni(tenantId, dni.trim());
  }

  public Patient save(Patient patient) {
    return patientRepository.save(patient);
  }
}
