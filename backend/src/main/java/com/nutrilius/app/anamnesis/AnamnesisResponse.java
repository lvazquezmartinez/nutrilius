package com.nutrilius.app.anamnesis;

import java.math.BigDecimal;
import java.time.Instant;

public class AnamnesisResponse {
  private Long id;
  private Instant createdAt;
  private Integer age;
  private String sex;
  private BigDecimal weightKg;
  private BigDecimal heightCm;
  private BigDecimal usualWeightKg;
  private BigDecimal weightLossPct;
  private Boolean smoker;
  private String activityLevel;
  private Integer mealsPerDay;
  private String pathologies;
  private String restrictions;
  private String allergies;
  private String habits;
  private String goal;
  private String dataJson;
  private String createdByEmail;

  public AnamnesisResponse(Anamnesis a, String createdByEmail) {
    this.id = a.getId();
    this.createdAt = a.getCreatedAt();
    this.age = a.getAge();
    this.sex = a.getSex();
    this.weightKg = a.getWeightKg();
    this.heightCm = a.getHeightCm();
    this.usualWeightKg = a.getUsualWeightKg();
    this.weightLossPct = a.getWeightLossPct();
    this.smoker = a.getSmoker();
    this.activityLevel = a.getActivityLevel();
    this.mealsPerDay = a.getMealsPerDay();
    this.pathologies = a.getPathologies();
    this.restrictions = a.getRestrictions();
    this.allergies = a.getAllergies();
    this.habits = a.getHabits();
    this.goal = a.getGoal();
    this.dataJson = a.getDataJson();
    this.createdByEmail = createdByEmail;
  }

  public Long getId() { return id; }
  public Instant getCreatedAt() { return createdAt; }
  public Integer getAge() { return age; }
  public String getSex() { return sex; }
  public BigDecimal getWeightKg() { return weightKg; }
  public BigDecimal getHeightCm() { return heightCm; }
  public BigDecimal getUsualWeightKg() { return usualWeightKg; }
  public BigDecimal getWeightLossPct() { return weightLossPct; }
  public Boolean getSmoker() { return smoker; }
  public String getActivityLevel() { return activityLevel; }
  public Integer getMealsPerDay() { return mealsPerDay; }
  public String getPathologies() { return pathologies; }
  public String getRestrictions() { return restrictions; }
  public String getAllergies() { return allergies; }
  public String getHabits() { return habits; }
  public String getGoal() { return goal; }
  public String getDataJson() { return dataJson; }
  public String getCreatedByEmail() { return createdByEmail; }
}
