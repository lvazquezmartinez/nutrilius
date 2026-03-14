package com.nutrilius.app.insurance;

import jakarta.validation.constraints.NotBlank;

public class InsuranceCreateRequest {
  @NotBlank
  private String name;

  public String getName() { return name; }
  public void setName(String name) { this.name = name; }
}
