package com.nutrilius.app.evolution;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EvolutionRepository extends JpaRepository<Evolution, Long> {
  @Query("select e from Evolution e join fetch e.createdBy where e.tenant.id = :tenantId and e.patient.id = :patientId order by e.createdAt desc")
  List<Evolution> findByTenantIdAndPatientId(@Param("tenantId") Long tenantId, @Param("patientId") Long patientId);
}
