package com.nutrilius.app.booking;

public class PublicBookingInfoResponse {
  private String nutritionistName;
  private String businessName;
  private String licenseNumber;
  private String slug;

  public PublicBookingInfoResponse(String nutritionistName, String businessName, String licenseNumber, String slug) {
    this.nutritionistName = nutritionistName;
    this.businessName = businessName;
    this.licenseNumber = licenseNumber;
    this.slug = slug;
  }

  public String getNutritionistName() { return nutritionistName; }
  public String getBusinessName() { return businessName; }
  public String getLicenseNumber() { return licenseNumber; }
  public String getSlug() { return slug; }
}
