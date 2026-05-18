package com.nutrilius.app.payment;

import com.nutrilius.app.common.PaymentMethod;
import com.nutrilius.app.common.PaymentStatus;
import com.nutrilius.app.insurance.Insurance;
import com.nutrilius.app.insurance.InsuranceRepository;
import com.nutrilius.app.patient.Patient;
import com.nutrilius.app.patient.PatientService;
import com.nutrilius.app.security.SecurityUtil;
import com.nutrilius.app.security.UserPrincipal;
import com.nutrilius.app.visit.Visit;
import com.nutrilius.app.visit.VisitRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {
  private final PaymentRepository paymentRepository;
  private final PatientService patientService;
  private final InsuranceRepository insuranceRepository;
  private final VisitRepository visitRepository;

  public PaymentService(PaymentRepository paymentRepository, PatientService patientService,
                        InsuranceRepository insuranceRepository, VisitRepository visitRepository) {
    this.paymentRepository = paymentRepository;
    this.patientService = patientService;
    this.insuranceRepository = insuranceRepository;
    this.visitRepository = visitRepository;
  }

  public PaymentResponse create(Long patientId, PaymentCreateRequest request) {
    UserPrincipal current = SecurityUtil.currentUser();
    Patient patient = patientService.getPatientForTenant(patientId);

    Payment payment = new Payment();
    payment.setTenant(patient.getTenant());
    payment.setPatient(patient);

    PaymentMethod method = request.getMethod() != null ? request.getMethod() : PaymentMethod.CASH;
    payment.setMethod(method);

    if (method == PaymentMethod.INSURANCE) {
      if (request.getInsuranceId() == null) {
        throw new IllegalArgumentException("Debe indicar obra social");
      }
      Insurance insurance = insuranceRepository.findById(request.getInsuranceId())
          .orElseThrow(() -> new IllegalArgumentException("Obra social no encontrada"));
      if (!insurance.getTenant().getId().equals(current.getTenantId())) {
        throw new IllegalArgumentException("Sin acceso a esta obra social");
      }
      payment.setInsurance(insurance);
    }

    if (request.getVisitId() != null) {
      Visit visit = visitRepository.findById(request.getVisitId())
          .orElseThrow(() -> new IllegalArgumentException("Visita no encontrada"));
      if (!visit.getTenant().getId().equals(current.getTenantId())) {
        throw new IllegalArgumentException("Sin acceso a esta visita");
      }
      payment.setVisit(visit);
    }

    if (request.getAmount() == null) {
      throw new IllegalArgumentException("Monto requerido");
    }
    payment.setAmount(java.math.BigDecimal.valueOf(request.getAmount()));
    payment.setDueAt(request.getDueAt());
    PaymentStatus status = request.getStatus() != null ? request.getStatus() : defaultStatus(request);
    if (status == PaymentStatus.PAID) {
      payment.setPaidAt(request.getPaidAt() != null ? request.getPaidAt() : LocalDateTime.now());
    } else {
      payment.setPaidAt(null);
    }
    payment.setStatus(resolveStatus(status, payment.getDueAt(), payment.getPaidAt()));

    return new PaymentResponse(paymentRepository.save(payment));
  }

  public List<PaymentResponse> list(Long patientId) {
    UserPrincipal current = SecurityUtil.currentUser();
    patientService.getPatientForTenant(patientId);
    return paymentRepository.findByTenantIdAndPatientIdOrderByCreatedAtDescIdDesc(current.getTenantId(), patientId)
        .stream()
        .peek(this::refreshOverdueStatus)
        .map(PaymentResponse::new)
        .collect(Collectors.toList());
  }

  private PaymentStatus defaultStatus(PaymentCreateRequest request) {
    if (request.getPaidAt() != null) {
      return PaymentStatus.PAID;
    }
    if (request.getDueAt() != null && request.getDueAt().isBefore(LocalDateTime.now())) {
      return PaymentStatus.OVERDUE;
    }
    return PaymentStatus.PENDING;
  }

  private PaymentStatus resolveStatus(PaymentStatus requested, LocalDateTime dueAt, LocalDateTime paidAt) {
    if (paidAt != null || requested == PaymentStatus.PAID) {
      return PaymentStatus.PAID;
    }
    if (dueAt != null && dueAt.isBefore(LocalDateTime.now())) {
      return PaymentStatus.OVERDUE;
    }
    return requested != null ? requested : PaymentStatus.PENDING;
  }

  private void refreshOverdueStatus(Payment payment) {
    PaymentStatus resolved = resolveStatus(payment.getStatus(), payment.getDueAt(), payment.getPaidAt());
    if (resolved != payment.getStatus()) {
      payment.setStatus(resolved);
      paymentRepository.save(payment);
    }
  }
}
