package com.nutrilius.app.insurance;

import com.nutrilius.app.security.SecurityUtil;
import com.nutrilius.app.security.UserPrincipal;
import com.nutrilius.app.user.UserRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class InsuranceService {
  private final InsuranceRepository insuranceRepository;
  private final UserRepository userRepository;

  public InsuranceService(InsuranceRepository insuranceRepository, UserRepository userRepository) {
    this.insuranceRepository = insuranceRepository;
    this.userRepository = userRepository;
  }

  public InsuranceResponse create(InsuranceCreateRequest request) {
    UserPrincipal current = SecurityUtil.currentUser();
    if (current == null || current.getTenantId() == null) {
      throw new IllegalArgumentException("Tenant inválido");
    }

    Insurance insurance = new Insurance();
    insurance.setName(request.getName());
    insurance.setTenant(userRepository.findById(current.getUserId()).orElseThrow().getTenant());
    return new InsuranceResponse(insuranceRepository.save(insurance));
  }

  public List<InsuranceResponse> list() {
    UserPrincipal current = SecurityUtil.currentUser();
    if (current == null || current.getTenantId() == null) {
      throw new IllegalArgumentException("Tenant inválido");
    }
    return insuranceRepository.findByTenantId(current.getTenantId()).stream()
        .map(InsuranceResponse::new)
        .collect(Collectors.toList());
  }

  public InsuranceResponse update(Long id, InsuranceUpdateRequest request) {
    UserPrincipal current = SecurityUtil.currentUser();
    Insurance insurance = insuranceRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Obra social no encontrada"));
    if (!insurance.getTenant().getId().equals(current.getTenantId())) {
      throw new IllegalArgumentException("Sin acceso a esta obra social");
    }
    if (request.getName() != null) {
      insurance.setName(request.getName());
    }
    if (request.getActive() != null) {
      insurance.setActive(request.getActive());
    }
    return new InsuranceResponse(insuranceRepository.save(insurance));
  }
}
