package com.nutrilius.app.metrics;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientMetricRepository extends JpaRepository<PatientMetric, Long> {
  List<PatientMetric> findByTenantIdAndPatientIdOrderByMeasuredAtAsc(Long tenantId, Long patientId);
}
