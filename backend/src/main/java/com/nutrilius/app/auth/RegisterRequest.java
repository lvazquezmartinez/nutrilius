package com.nutrilius.app.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {
  @NotBlank
  private String nutritionistName;

  private String businessName;

  @Email
  @NotBlank
  private String email;

  @NotBlank
  @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
  private String password;

  public String getNutritionistName() {
    return nutritionistName;
  }

  public void setNutritionistName(String nutritionistName) {
    this.nutritionistName = nutritionistName;
  }

  public String getBusinessName() {
    return businessName;
  }

  public void setBusinessName(String businessName) {
    this.businessName = businessName;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }
}
