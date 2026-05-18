package com.nutrilius.app.settings;

public class TenantSettingsRequest {
  private String nutritionistName;
  private String businessName;
  private String licenseNumber;
  private String planType;
  private String publicBookingSlug;

  public String getNutritionistName() { return nutritionistName; }
  public void setNutritionistName(String nutritionistName) { this.nutritionistName = nutritionistName; }
  public String getBusinessName() { return businessName; }
  public void setBusinessName(String businessName) { this.businessName = businessName; }
  public String getLicenseNumber() { return licenseNumber; }
  public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }
  public String getPlanType() { return planType; }
  public void setPlanType(String planType) { this.planType = planType; }
  public String getPublicBookingSlug() { return publicBookingSlug; }
  public void setPublicBookingSlug(String publicBookingSlug) { this.publicBookingSlug = publicBookingSlug; }
}
