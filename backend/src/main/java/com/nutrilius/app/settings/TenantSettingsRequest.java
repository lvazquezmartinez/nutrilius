package com.nutrilius.app.settings;

public class TenantSettingsRequest {
  private String nutritionistName;
  private String businessName;
  private String licenseNumber;
  private Boolean planEnabled;

  public String getNutritionistName() { return nutritionistName; }
  public void setNutritionistName(String nutritionistName) { this.nutritionistName = nutritionistName; }
  public String getBusinessName() { return businessName; }
  public void setBusinessName(String businessName) { this.businessName = businessName; }
  public String getLicenseNumber() { return licenseNumber; }
  public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }
  public Boolean getPlanEnabled() { return planEnabled; }
  public void setPlanEnabled(Boolean planEnabled) { this.planEnabled = planEnabled; }
}
