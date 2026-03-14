package com.nutrilius.app.plan;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientPlanRepository extends JpaRepository<PatientPlan, Long> {
  Optional<PatientPlan> findByTenantIdAndPatientId(Long tenantId, Long patientId);
}
