package com.nutrilius.app.payment;

import com.nutrilius.app.common.PaymentMethod;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

public class PaymentResponse {
  private Long id;
  private PaymentMethod method;
  private Long insuranceId;
  private BigDecimal amount;
  private LocalDateTime paidAt;
  private Instant createdAt;

  public PaymentResponse(Payment payment) {
    this.id = payment.getId();
    this.method = payment.getMethod();
    this.insuranceId = payment.getInsurance() != null ? payment.getInsurance().getId() : null;
    this.amount = payment.getAmount();
    this.paidAt = payment.getPaidAt();
    this.createdAt = payment.getCreatedAt();
  }

  public Long getId() { return id; }
  public PaymentMethod getMethod() { return method; }
  public Long getInsuranceId() { return insuranceId; }
  public BigDecimal getAmount() { return amount; }
  public LocalDateTime getPaidAt() { return paidAt; }
  public Instant getCreatedAt() { return createdAt; }
}
