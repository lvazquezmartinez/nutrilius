package com.nutrilius.app.plan;

import java.time.Instant;

public class PatientPlanResponse {
  private Long id;
  private String contentText;
  private Instant updatedAt;

  public PatientPlanResponse(PatientPlan plan) {
    this.id = plan.getId();
    this.contentText = plan.getContentText();
    this.updatedAt = plan.getUpdatedAt();
  }

  public Long getId() { return id; }
  public String getContentText() { return contentText; }
  public Instant getUpdatedAt() { return updatedAt; }
}
