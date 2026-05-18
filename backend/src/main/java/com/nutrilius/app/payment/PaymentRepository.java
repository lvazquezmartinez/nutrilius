package com.nutrilius.app.payment;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
  List<Payment> findByTenantIdAndPatientIdOrderByCreatedAtDescIdDesc(Long tenantId, Long patientId);
}
