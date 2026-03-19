package com.nutrilius.app.settings;

public class TenantSettingsResponse {
  private String nutritionistName;
  private String businessName;
  private String licenseNumber;
  private String planType;
  private boolean hasLogo;

  public TenantSettingsResponse(TenantSettings settings) {
    this.nutritionistName = settings.getNutritionistName();
    this.businessName = settings.getBusinessName();
    this.licenseNumber = settings.getLicenseNumber();
    this.planType = settings.getPlanType();
    this.hasLogo = settings.getLogoBlob() != null && settings.getLogoBlob().length > 0;
  }

  public String getNutritionistName() { return nutritionistName; }
  public String getBusinessName() { return businessName; }
  public String getLicenseNumber() { return licenseNumber; }
  public String getPlanType() { return planType; }
  public boolean isHasLogo() { return hasLogo; }
}
