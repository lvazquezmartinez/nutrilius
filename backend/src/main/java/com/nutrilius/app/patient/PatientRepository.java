package com.nutrilius.app.patient;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PatientRepository extends JpaRepository<Patient, Long> {
  List<Patient> findByTenantId(Long tenantId);
  java.util.Optional<Patient> findByTenantIdAndDni(Long tenantId, String dni);

  @Query("""
      select p from Patient p
      where p.tenant.id = :tenantId
        and (
          lower(p.firstName) like lower(concat('%', :q, '%'))
          or lower(p.lastName) like lower(concat('%', :q, '%'))
          or lower(p.dni) like lower(concat('%', :q, '%'))
          or lower(p.fullName) like lower(concat('%', :q, '%'))
        )
      """)
  List<Patient> search(@Param("tenantId") Long tenantId, @Param("q") String q);
}
