package com.nutrilius.app.settings;

public class TenantSettingsResponse {
  private String nutritionistName;
  private String businessName;
  private String licenseNumber;
  private boolean planEnabled;
  private boolean hasLogo;

  public TenantSettingsResponse(TenantSettings settings) {
    this.nutritionistName = settings.getNutritionistName();
    this.businessName = settings.getBusinessName();
    this.licenseNumber = settings.getLicenseNumber();
    this.planEnabled = settings.isPlanEnabled();
    this.hasLogo = settings.getLogoBlob() != null && settings.getLogoBlob().length > 0;
  }

  public String getNutritionistName() { return nutritionistName; }
  public String getBusinessName() { return businessName; }
  public String getLicenseNumber() { return licenseNumber; }
  public boolean isPlanEnabled() { return planEnabled; }
  public boolean isHasLogo() { return hasLogo; }
}
