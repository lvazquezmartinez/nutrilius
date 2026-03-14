package com.nutrilius.app.anamnesis;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AnamnesisRepository extends JpaRepository<Anamnesis, Long> {
  @Query("select a from Anamnesis a join fetch a.createdBy where a.tenant.id = :tenantId and a.patient.id = :patientId")
  List<Anamnesis> findByTenantIdAndPatientId(@Param("tenantId") Long tenantId, @Param("patientId") Long patientId);
}
