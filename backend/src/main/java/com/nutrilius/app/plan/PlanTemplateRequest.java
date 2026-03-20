package com.nutrilius.app.plan;

import jakarta.validation.constraints.NotBlank;

public class PlanTemplateRequest {
  @NotBlank
  private String name;

  @NotBlank
  private String contentText;

  public String getName() { return name; }
  public void setName(String name) { this.name = name; }
  public String getContentText() { return contentText; }
  public void setContentText(String contentText) { this.contentText = contentText; }
}
