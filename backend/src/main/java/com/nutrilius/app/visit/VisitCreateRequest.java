package com.nutrilius.app.visit;

import java.time.LocalDate;

public class VisitCreateRequest {
  private LocalDate visitDate;
  private String notes;

  public LocalDate getVisitDate() { return visitDate; }
  public void setVisitDate(LocalDate visitDate) { this.visitDate = visitDate; }
  public String getNotes() { return notes; }
  public void setNotes(String notes) { this.notes = notes; }
}
