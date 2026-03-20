package com.nutrilius.app.plan;

import com.nutrilius.app.security.SecurityUtil;
import com.nutrilius.app.security.UserPrincipal;
import com.nutrilius.app.user.UserRepository;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class PlanTemplateService {
  private final PlanTemplateRepository repository;
  private final UserRepository userRepository;

  public PlanTemplateService(PlanTemplateRepository repository, UserRepository userRepository) {
    this.repository = repository;
    this.userRepository = userRepository;
  }

  public List<PlanTemplateResponse> list() {
    UserPrincipal current = SecurityUtil.currentUser();
    return repository.findByTenantIdOrderByCreatedAtDesc(current.getTenantId())
        .stream()
        .map(PlanTemplateResponse::new)
        .collect(Collectors.toList());
  }

  public PlanTemplateResponse create(PlanTemplateRequest request) {
    UserPrincipal current = SecurityUtil.currentUser();
    PlanTemplate template = new PlanTemplate();
    template.setTenant(userRepository.findById(current.getUserId()).orElseThrow().getTenant());
    template.setName(request.getName());
    template.setContentText(request.getContentText());
    template.setCreatedAt(Instant.now());
    return new PlanTemplateResponse(repository.save(template));
  }

  public PlanTemplateResponse update(Long id, PlanTemplateRequest request) {
    UserPrincipal current = SecurityUtil.currentUser();
    PlanTemplate template = repository.findByTenantIdAndId(current.getTenantId(), id)
        .orElseThrow(() -> new IllegalArgumentException("Plantilla no encontrada"));
    template.setName(request.getName());
    template.setContentText(request.getContentText());
    return new PlanTemplateResponse(repository.save(template));
  }

  public void delete(Long id) {
    UserPrincipal current = SecurityUtil.currentUser();
    PlanTemplate template = repository.findByTenantIdAndId(current.getTenantId(), id)
        .orElseThrow(() -> new IllegalArgumentException("Plantilla no encontrada"));
    repository.delete(template);
  }
}
