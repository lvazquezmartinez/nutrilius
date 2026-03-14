package com.nutrilius.app.plan;

import jakarta.validation.constraints.NotBlank;

public class PatientPlanRequest {
  @NotBlank
  private String contentText;

  public String getContentText() { return contentText; }
  public void setContentText(String contentText) { this.contentText = contentText; }
}
