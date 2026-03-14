package com.nutrilius.app.anamnesis.template;

import jakarta.validation.constraints.NotBlank;

public class AnamnesisTemplateUpdateRequest {
  @NotBlank
  private String templateJson;

  public String getTemplateJson() { return templateJson; }
  public void setTemplateJson(String templateJson) { this.templateJson = templateJson; }
}
