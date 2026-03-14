package com.nutrilius.app.anamnesis.template;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnamnesisTemplateRepository extends JpaRepository<AnamnesisTemplate, Long> {
  Optional<AnamnesisTemplate> findByTenantId(Long tenantId);
}
