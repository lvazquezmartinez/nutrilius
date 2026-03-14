package com.nutrilius.app.anamnesis;

import com.nutrilius.app.patient.Patient;
import com.nutrilius.app.tenant.Tenant;
import com.nutrilius.app.user.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "anamneses")
public class Anamnesis {
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

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt = Instant.now();

  private Integer age;
  private String sex;

  @Column(name = "weight_kg", precision = 6, scale = 2)
  private BigDecimal weightKg;

  @Column(name = "height_cm", precision = 6, scale = 2)
  private BigDecimal heightCm;

  @Column(name = "usual_weight_kg", precision = 6, scale = 2)
  private BigDecimal usualWeightKg;

  @Column(name = "weight_loss_pct", precision = 6, scale = 2)
  private BigDecimal weightLossPct;

  private Boolean smoker;

  @Column(name = "activity_level")
  private String activityLevel;

  @Column(name = "meals_per_day")
  private Integer mealsPerDay;

  @Column(columnDefinition = "TEXT")
  private String pathologies;

  @Column(columnDefinition = "TEXT")
  private String restrictions;

  @Column(columnDefinition = "TEXT")
  private String allergies;

  @Column(columnDefinition = "TEXT")
  private String habits;

  @Column(columnDefinition = "TEXT")
  private String goal;

  @Column(name = "data_json", columnDefinition = "TEXT")
  private String dataJson;

  public Long getId() {
    return id;
  }

  public Tenant getTenant() {
    return tenant;
  }

  public void setTenant(Tenant tenant) {
    this.tenant = tenant;
  }

  public Patient getPatient() {
    return patient;
  }

  public void setPatient(Patient patient) {
    this.patient = patient;
  }

  public User getCreatedBy() {
    return createdBy;
  }

  public void setCreatedBy(User createdBy) {
    this.createdBy = createdBy;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public Integer getAge() {
    return age;
  }

  public void setAge(Integer age) {
    this.age = age;
  }

  public String getSex() {
    return sex;
  }

  public void setSex(String sex) {
    this.sex = sex;
  }

  public BigDecimal getWeightKg() {
    return weightKg;
  }

  public void setWeightKg(BigDecimal weightKg) {
    this.weightKg = weightKg;
  }

  public BigDecimal getHeightCm() {
    return heightCm;
  }

  public void setHeightCm(BigDecimal heightCm) {
    this.heightCm = heightCm;
  }

  public BigDecimal getUsualWeightKg() {
    return usualWeightKg;
  }

  public void setUsualWeightKg(BigDecimal usualWeightKg) {
    this.usualWeightKg = usualWeightKg;
  }

  public BigDecimal getWeightLossPct() {
    return weightLossPct;
  }

  public void setWeightLossPct(BigDecimal weightLossPct) {
    this.weightLossPct = weightLossPct;
  }

  public Boolean getSmoker() {
    return smoker;
  }

  public void setSmoker(Boolean smoker) {
    this.smoker = smoker;
  }

  public String getActivityLevel() {
    return activityLevel;
  }

  public void setActivityLevel(String activityLevel) {
    this.activityLevel = activityLevel;
  }

  public Integer getMealsPerDay() {
    return mealsPerDay;
  }

  public void setMealsPerDay(Integer mealsPerDay) {
    this.mealsPerDay = mealsPerDay;
  }

  public String getPathologies() {
    return pathologies;
  }

  public void setPathologies(String pathologies) {
    this.pathologies = pathologies;
  }

  public String getRestrictions() {
    return restrictions;
  }

  public void setRestrictions(String restrictions) {
    this.restrictions = restrictions;
  }

  public String getAllergies() {
    return allergies;
  }

  public void setAllergies(String allergies) {
    this.allergies = allergies;
  }

  public String getHabits() {
    return habits;
  }

  public void setHabits(String habits) {
    this.habits = habits;
  }

  public String getGoal() {
    return goal;
  }

  public void setGoal(String goal) {
    this.goal = goal;
  }

  public String getDataJson() {
    return dataJson;
  }

  public void setDataJson(String dataJson) {
    this.dataJson = dataJson;
  }
}
