package com.nutrilius.app.metrics;

import com.nutrilius.app.patient.Patient;
import com.nutrilius.app.tenant.Tenant;
import com.nutrilius.app.user.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "patient_metrics")
public class PatientMetric {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "tenant_id", nullable = false)
  private Tenant tenant;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "patient_id", nullable = false)
  private Patient patient;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "created_by", nullable = false)
  private User createdBy;

  @Column(name = "measured_at", nullable = false)
  private LocalDateTime measuredAt;

  @Column(name = "weight_kg", precision = 6, scale = 2)
  private BigDecimal weightKg;

  @Column(name = "height_m", precision = 4, scale = 2)
  private BigDecimal heightM;

  @Column(name = "bmi", precision = 6, scale = 2)
  private BigDecimal bmi;

  @Column(name = "waist_cm", precision = 6, scale = 2)
  private BigDecimal waistCm;

  @Column(name = "neck_cm", precision = 6, scale = 2)
  private BigDecimal neckCm;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt = Instant.now();

  public Long getId() { return id; }
  public Tenant getTenant() { return tenant; }
  public void setTenant(Tenant tenant) { this.tenant = tenant; }
  public Patient getPatient() { return patient; }
  public void setPatient(Patient patient) { this.patient = patient; }
  public User getCreatedBy() { return createdBy; }
  public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
  public LocalDateTime getMeasuredAt() { return measuredAt; }
  public void setMeasuredAt(LocalDateTime measuredAt) { this.measuredAt = measuredAt; }
  public BigDecimal getWeightKg() { return weightKg; }
  public void setWeightKg(BigDecimal weightKg) { this.weightKg = weightKg; }
  public BigDecimal getHeightM() { return heightM; }
  public void setHeightM(BigDecimal heightM) { this.heightM = heightM; }
  public BigDecimal getBmi() { return bmi; }
  public void setBmi(BigDecimal bmi) { this.bmi = bmi; }
  public BigDecimal getWaistCm() { return waistCm; }
  public void setWaistCm(BigDecimal waistCm) { this.waistCm = waistCm; }
  public BigDecimal getNeckCm() { return neckCm; }
  public void setNeckCm(BigDecimal neckCm) { this.neckCm = neckCm; }
  public Instant getCreatedAt() { return createdAt; }
}
