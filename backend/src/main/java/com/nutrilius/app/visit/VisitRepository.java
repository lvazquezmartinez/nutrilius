package com.nutrilius.app.visit;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VisitRepository extends JpaRepository<Visit, Long> {
  List<Visit> findByTenantIdAndPatientIdOrderByScheduledAtDescIdDesc(Long tenantId, Long patientId);
}
