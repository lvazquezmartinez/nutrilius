package com.nutrilius.app.metrics;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

public class PatientMetricResponse {
  private Long id;
  private LocalDateTime measuredAt;
  private BigDecimal weightKg;
  private BigDecimal heightM;
  private BigDecimal bmi;
  private BigDecimal waistCm;
  private BigDecimal neckCm;
  private Instant createdAt;

  public PatientMetricResponse(PatientMetric metric) {
    this.id = metric.getId();
    this.measuredAt = metric.getMeasuredAt();
    this.weightKg = metric.getWeightKg();
    this.heightM = metric.getHeightM();
    this.bmi = metric.getBmi();
    this.waistCm = metric.getWaistCm();
    this.neckCm = metric.getNeckCm();
    this.createdAt = metric.getCreatedAt();
  }

  public Long getId() { return id; }
  public LocalDateTime getMeasuredAt() { return measuredAt; }
  public BigDecimal getWeightKg() { return weightKg; }
  public BigDecimal getHeightM() { return heightM; }
  public BigDecimal getBmi() { return bmi; }
  public BigDecimal getWaistCm() { return waistCm; }
  public BigDecimal getNeckCm() { return neckCm; }
  public Instant getCreatedAt() { return createdAt; }
}
