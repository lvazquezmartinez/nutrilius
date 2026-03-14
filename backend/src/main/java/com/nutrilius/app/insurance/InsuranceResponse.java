package com.nutrilius.app.insurance;

import java.time.Instant;

public class InsuranceResponse {
  private Long id;
  private String name;
  private boolean active;
  private Instant createdAt;

  public InsuranceResponse(Insurance insurance) {
    this.id = insurance.getId();
    this.name = insurance.getName();
    this.active = insurance.isActive();
    this.createdAt = insurance.getCreatedAt();
  }

  public Long getId() { return id; }
  public String getName() { return name; }
  public boolean isActive() { return active; }
  public Instant getCreatedAt() { return createdAt; }
}
