package com.nutrilius.app.anamnesis;

public class AnamnesisCreateRequest {
  private Integer age;
  private String sex;
  private Double weightKg;
  private Double heightCm;
  private Double usualWeightKg;
  private Double weightLossPct;
  private Boolean smoker;
  private String activityLevel;
  private Integer mealsPerDay;
  private String pathologies;
  private String restrictions;
  private String allergies;
  private String habits;
  private String goal;
  private Object data;

  public Integer getAge() { return age; }
  public void setAge(Integer age) { this.age = age; }
  public String getSex() { return sex; }
  public void setSex(String sex) { this.sex = sex; }
  public Double getWeightKg() { return weightKg; }
  public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }
  public Double getHeightCm() { return heightCm; }
  public void setHeightCm(Double heightCm) { this.heightCm = heightCm; }
  public Double getUsualWeightKg() { return usualWeightKg; }
  public void setUsualWeightKg(Double usualWeightKg) { this.usualWeightKg = usualWeightKg; }
  public Double getWeightLossPct() { return weightLossPct; }
  public void setWeightLossPct(Double weightLossPct) { this.weightLossPct = weightLossPct; }
  public Boolean getSmoker() { return smoker; }
  public void setSmoker(Boolean smoker) { this.smoker = smoker; }
  public String getActivityLevel() { return activityLevel; }
  public void setActivityLevel(String activityLevel) { this.activityLevel = activityLevel; }
  public Integer getMealsPerDay() { return mealsPerDay; }
  public void setMealsPerDay(Integer mealsPerDay) { this.mealsPerDay = mealsPerDay; }
  public String getPathologies() { return pathologies; }
  public void setPathologies(String pathologies) { this.pathologies = pathologies; }
  public String getRestrictions() { return restrictions; }
  public void setRestrictions(String restrictions) { this.restrictions = restrictions; }
  public String getAllergies() { return allergies; }
  public void setAllergies(String allergies) { this.allergies = allergies; }
  public String getHabits() { return habits; }
  public void setHabits(String habits) { this.habits = habits; }
  public String getGoal() { return goal; }
  public void setGoal(String goal) { this.goal = goal; }
  public Object getData() { return data; }
  public void setData(Object data) { this.data = data; }
}
