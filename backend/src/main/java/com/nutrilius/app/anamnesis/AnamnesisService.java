package com.nutrilius.app.anamnesis;

import com.nutrilius.app.patient.Patient;
import com.nutrilius.app.patient.PatientService;
import com.nutrilius.app.security.SecurityUtil;
import com.nutrilius.app.security.UserPrincipal;
import com.nutrilius.app.user.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class AnamnesisService {
  private final AnamnesisRepository anamnesisRepository;
  private final PatientService patientService;
  private final UserRepository userRepository;
  private final ObjectMapper objectMapper;

  public AnamnesisService(AnamnesisRepository anamnesisRepository, PatientService patientService, UserRepository userRepository, ObjectMapper objectMapper) {
    this.anamnesisRepository = anamnesisRepository;
    this.patientService = patientService;
    this.userRepository = userRepository;
    this.objectMapper = objectMapper;
  }

  public AnamnesisResponse create(Long patientId, AnamnesisCreateRequest request) {
    UserPrincipal current = SecurityUtil.currentUser();
    Patient patient = patientService.getPatientForTenant(patientId);

    Anamnesis a = new Anamnesis();
    a.setTenant(patient.getTenant());
    a.setPatient(patient);
    a.setCreatedBy(userRepository.findById(current.getUserId()).orElseThrow());
    a.setAge(request.getAge());
    a.setSex(request.getSex());
    a.setWeightKg(toBigDecimal(request.getWeightKg()));
    a.setHeightCm(toBigDecimal(request.getHeightCm()));
    a.setUsualWeightKg(toBigDecimal(request.getUsualWeightKg()));
    a.setWeightLossPct(toBigDecimal(request.getWeightLossPct()));
    a.setSmoker(request.getSmoker());
    a.setActivityLevel(request.getActivityLevel());
    a.setMealsPerDay(request.getMealsPerDay());
    a.setPathologies(request.getPathologies());
    a.setRestrictions(request.getRestrictions());
    a.setAllergies(request.getAllergies());
    a.setHabits(request.getHabits());
    a.setGoal(request.getGoal());
    a.setDataJson(serializeData(request.getData()));

    return new AnamnesisResponse(anamnesisRepository.save(a), a.getCreatedBy().getEmail());
  }

  public List<AnamnesisResponse> list(Long patientId) {
    UserPrincipal current = SecurityUtil.currentUser();
    patientService.getPatientForTenant(patientId);
    return anamnesisRepository.findByTenantIdAndPatientId(current.getTenantId(), patientId)
        .stream()
        .map(a -> new AnamnesisResponse(a, a.getCreatedBy().getEmail()))
        .collect(Collectors.toList());
  }

  public AnamnesisResponse updateData(Long patientId, Long anamnesisId, Object data) {
    UserPrincipal current = SecurityUtil.currentUser();
    patientService.getPatientForTenant(patientId);
    Anamnesis anamnesis = anamnesisRepository.findById(anamnesisId)
        .orElseThrow(() -> new IllegalArgumentException("Anamnesis no encontrada"));
    if (!anamnesis.getTenant().getId().equals(current.getTenantId())) {
      throw new IllegalArgumentException("Sin acceso a esta anamnesis");
    }
    anamnesis.setDataJson(serializeData(data));
    return new AnamnesisResponse(anamnesisRepository.save(anamnesis), anamnesis.getCreatedBy().getEmail());
  }

  public AnamnesisResponse update(Long patientId, Long anamnesisId, AnamnesisUpdateRequest request) {
    UserPrincipal current = SecurityUtil.currentUser();
    patientService.getPatientForTenant(patientId);
    Anamnesis a = anamnesisRepository.findById(anamnesisId)
        .orElseThrow(() -> new IllegalArgumentException("Anamnesis no encontrada"));
    if (!a.getTenant().getId().equals(current.getTenantId())) {
      throw new IllegalArgumentException("Sin acceso a esta anamnesis");
    }
    a.setDataJson(serializeData(request.getData()));
    return new AnamnesisResponse(anamnesisRepository.save(a), a.getCreatedBy().getEmail());
  }

  private BigDecimal toBigDecimal(Double value) {
    return value == null ? null : BigDecimal.valueOf(value);
  }

  private String serializeData(Object data) {
    if (data == null) return null;
    try {
      return objectMapper.writeValueAsString(data);
    } catch (Exception ex) {
      throw new IllegalArgumentException("Datos de anamnesis inválidos");
    }
  }
}
