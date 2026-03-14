package com.nutrilius.app.insurance;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InsuranceRepository extends JpaRepository<Insurance, Long> {
  List<Insurance> findByTenantId(Long tenantId);
}
