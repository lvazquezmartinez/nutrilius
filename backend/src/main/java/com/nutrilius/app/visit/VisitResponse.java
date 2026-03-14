package com.nutrilius.app.visit;

import java.time.Instant;
import java.time.LocalDate;

public class VisitResponse {
  private Long id;
  private LocalDate visitDate;
  private String notes;
  private Instant createdAt;

  public VisitResponse(Visit visit) {
    this.id = visit.getId();
    this.visitDate = visit.getVisitDate();
    this.notes = visit.getNotes();
    this.createdAt = visit.getCreatedAt();
  }

  public Long getId() { return id; }
  public LocalDate getVisitDate() { return visitDate; }
  public String getNotes() { return notes; }
  public Instant getCreatedAt() { return createdAt; }
}
