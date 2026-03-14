package com.nutrilius.app.metrics;

import java.time.LocalDateTime;

public class PatientMetricCreateRequest {
  private LocalDateTime measuredAt;
  private Double weightKg;
  private Double heightM;
  private Double bmi;
  private Double waistCm;
  private Double neckCm;

  public LocalDateTime getMeasuredAt() { return measuredAt; }
  public void setMeasuredAt(LocalDateTime measuredAt) { this.measuredAt = measuredAt; }
  public Double getWeightKg() { return weightKg; }
  public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }
  public Double getHeightM() { return heightM; }
  public void setHeightM(Double heightM) { this.heightM = heightM; }
  public Double getBmi() { return bmi; }
  public void setBmi(Double bmi) { this.bmi = bmi; }
  public Double getWaistCm() { return waistCm; }
  public void setWaistCm(Double waistCm) { this.waistCm = waistCm; }
  public Double getNeckCm() { return neckCm; }
  public void setNeckCm(Double neckCm) { this.neckCm = neckCm; }
}
