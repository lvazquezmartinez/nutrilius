package com.nutrilius.app.evolution;

import java.time.Instant;

public class EvolutionResponse {
  private Long id;
  private String notes;
  private Instant createdAt;
  private String createdByEmail;

  public EvolutionResponse(Evolution evolution) {
    this.id = evolution.getId();
    this.notes = evolution.getNotes();
    this.createdAt = evolution.getCreatedAt();
    this.createdByEmail = evolution.getCreatedBy().getEmail();
  }

  public Long getId() { return id; }
  public String getNotes() { return notes; }
  public Instant getCreatedAt() { return createdAt; }
  public String getCreatedByEmail() { return createdByEmail; }
}
