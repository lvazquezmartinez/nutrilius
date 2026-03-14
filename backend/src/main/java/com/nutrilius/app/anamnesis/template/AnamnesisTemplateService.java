package com.nutrilius.app.anamnesis.template;

import com.nutrilius.app.security.SecurityUtil;
import com.nutrilius.app.security.UserPrincipal;
import com.nutrilius.app.user.UserRepository;
import java.time.Instant;
import org.springframework.stereotype.Service;

@Service
public class AnamnesisTemplateService {
  private final AnamnesisTemplateRepository repository;
  private final UserRepository userRepository;

  public AnamnesisTemplateService(AnamnesisTemplateRepository repository, UserRepository userRepository) {
    this.repository = repository;
    this.userRepository = userRepository;
  }

  public AnamnesisTemplateResponse get() {
    UserPrincipal current = SecurityUtil.currentUser();
    if (current == null || current.getTenantId() == null) {
      throw new IllegalArgumentException("Tenant inválido");
    }

    AnamnesisTemplate template = repository.findByTenantId(current.getTenantId())
        .orElseGet(() -> {
          AnamnesisTemplate t = new AnamnesisTemplate();
          t.setTenant(userRepository.findById(current.getUserId()).orElseThrow().getTenant());
          t.setTemplateJson(DefaultAnamnesisTemplate.JSON);
          t.setUpdatedAt(Instant.now());
          return repository.save(t);
        });

    return new AnamnesisTemplateResponse(template.getTemplateJson(), template.getUpdatedAt());
  }

  public AnamnesisTemplateResponse update(AnamnesisTemplateUpdateRequest request) {
    UserPrincipal current = SecurityUtil.currentUser();
    if (current == null || current.getTenantId() == null) {
      throw new IllegalArgumentException("Tenant inválido");
    }

    AnamnesisTemplate template = repository.findByTenantId(current.getTenantId())
        .orElseGet(() -> {
          AnamnesisTemplate t = new AnamnesisTemplate();
          t.setTenant(userRepository.findById(current.getUserId()).orElseThrow().getTenant());
          return t;
        });

    template.setTemplateJson(request.getTemplateJson());
    template.setUpdatedAt(Instant.now());
    AnamnesisTemplate saved = repository.save(template);
    return new AnamnesisTemplateResponse(saved.getTemplateJson(), saved.getUpdatedAt());
  }

  public AnamnesisTemplateResponse resetToDefault() {
    UserPrincipal current = SecurityUtil.currentUser();
    if (current == null || current.getTenantId() == null) {
      throw new IllegalArgumentException("Tenant inválido");
    }

    AnamnesisTemplate template = repository.findByTenantId(current.getTenantId())
        .orElseGet(() -> {
          AnamnesisTemplate t = new AnamnesisTemplate();
          t.setTenant(userRepository.findById(current.getUserId()).orElseThrow().getTenant());
          return t;
        });

    template.setTemplateJson(DefaultAnamnesisTemplate.JSON);
    template.setUpdatedAt(Instant.now());
    AnamnesisTemplate saved = repository.save(template);
    return new AnamnesisTemplateResponse(saved.getTemplateJson(), saved.getUpdatedAt());
  }
}
