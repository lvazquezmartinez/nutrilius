package com.nutrilius.app.evolution;

import com.nutrilius.app.patient.Patient;
import com.nutrilius.app.patient.PatientService;
import com.nutrilius.app.security.SecurityUtil;
import com.nutrilius.app.security.UserPrincipal;
import com.nutrilius.app.user.UserRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class EvolutionService {
  private final EvolutionRepository evolutionRepository;
  private final PatientService patientService;
  private final UserRepository userRepository;

  public EvolutionService(EvolutionRepository evolutionRepository, PatientService patientService, UserRepository userRepository) {
    this.evolutionRepository = evolutionRepository;
    this.patientService = patientService;
    this.userRepository = userRepository;
  }

  public EvolutionResponse create(Long patientId, EvolutionCreateRequest request) {
    UserPrincipal current = SecurityUtil.currentUser();
    Patient patient = patientService.getPatientForTenant(patientId);

    Evolution evolution = new Evolution();
    evolution.setTenant(patient.getTenant());
    evolution.setPatient(patient);
    evolution.setCreatedBy(userRepository.findById(current.getUserId()).orElseThrow());
    evolution.setNotes(request.getNotes());

    return new EvolutionResponse(evolutionRepository.save(evolution));
  }

  public List<EvolutionResponse> list(Long patientId) {
    UserPrincipal current = SecurityUtil.currentUser();
    patientService.getPatientForTenant(patientId);
    return evolutionRepository.findByTenantIdAndPatientId(current.getTenantId(), patientId)
        .stream()
        .map(EvolutionResponse::new)
        .collect(Collectors.toList());
  }
}
