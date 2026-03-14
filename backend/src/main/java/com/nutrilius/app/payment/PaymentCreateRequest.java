package com.nutrilius.app.payment;

import com.nutrilius.app.common.PaymentMethod;
import java.time.LocalDateTime;

public class PaymentCreateRequest {
  private PaymentMethod method;
  private Long insuranceId;
  private Double amount;
  private LocalDateTime paidAt;
  private Long visitId;

  public PaymentMethod getMethod() { return method; }
  public void setMethod(PaymentMethod method) { this.method = method; }
  public Long getInsuranceId() { return insuranceId; }
  public void setInsuranceId(Long insuranceId) { this.insuranceId = insuranceId; }
  public Double getAmount() { return amount; }
  public void setAmount(Double amount) { this.amount = amount; }
  public LocalDateTime getPaidAt() { return paidAt; }
  public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }
  public Long getVisitId() { return visitId; }
  public void setVisitId(Long visitId) { this.visitId = visitId; }
}
