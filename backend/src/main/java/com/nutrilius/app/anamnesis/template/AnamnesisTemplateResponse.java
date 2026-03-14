package com.nutrilius.app.anamnesis.template;

import java.time.Instant;

public class AnamnesisTemplateResponse {
  private String templateJson;
  private Instant updatedAt;

  public AnamnesisTemplateResponse(String templateJson, Instant updatedAt) {
    this.templateJson = templateJson;
    this.updatedAt = updatedAt;
  }

  public String getTemplateJson() { return templateJson; }
  public Instant getUpdatedAt() { return updatedAt; }
}
