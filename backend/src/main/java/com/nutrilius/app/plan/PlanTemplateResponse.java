package com.nutrilius.app.plan;

import java.time.Instant;

public class PlanTemplateResponse {
  private Long id;
  private String name;
  private String contentText;
  private Instant createdAt;

  public PlanTemplateResponse(PlanTemplate template) {
    this.id = template.getId();
    this.name = template.getName();
    this.contentText = template.getContentText();
    this.createdAt = template.getCreatedAt();
  }

  public Long getId() { return id; }
  public String getName() { return name; }
  public String getContentText() { return contentText; }
  public Instant getCreatedAt() { return createdAt; }
}
