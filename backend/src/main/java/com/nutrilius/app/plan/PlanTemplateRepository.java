package com.nutrilius.app.plan;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlanTemplateRepository extends JpaRepository<PlanTemplate, Long> {
  List<PlanTemplate> findByTenantIdOrderByCreatedAtDesc(Long tenantId);
  Optional<PlanTemplate> findByTenantIdAndId(Long tenantId, Long id);
}
