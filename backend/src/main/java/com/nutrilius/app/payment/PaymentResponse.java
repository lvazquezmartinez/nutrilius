package com.nutrilius.app.payment;

import com.nutrilius.app.common.PaymentMethod;
import com.nutrilius.app.common.PaymentStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

public class PaymentResponse {
  private Long id;
  private PaymentMethod method;
  private PaymentStatus status;
  private Long insuranceId;
  private BigDecimal amount;
  private LocalDateTime paidAt;
  private LocalDateTime dueAt;
  private Instant createdAt;

  public PaymentResponse(Payment payment) {
    this.id = payment.getId();
    this.method = payment.getMethod();
    this.status = payment.getStatus();
    this.insuranceId = payment.getInsurance() != null ? payment.getInsurance().getId() : null;
    this.amount = payment.getAmount();
    this.paidAt = payment.getPaidAt();
    this.dueAt = payment.getDueAt();
    this.createdAt = payment.getCreatedAt();
  }

  public Long getId() { return id; }
  public PaymentMethod getMethod() { return method; }
  public PaymentStatus getStatus() { return status; }
  public Long getInsuranceId() { return insuranceId; }
  public BigDecimal getAmount() { return amount; }
  public LocalDateTime getPaidAt() { return paidAt; }
  public LocalDateTime getDueAt() { return dueAt; }
  public Instant getCreatedAt() { return createdAt; }
}
