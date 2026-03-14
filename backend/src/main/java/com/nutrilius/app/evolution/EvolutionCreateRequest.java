package com.nutrilius.app.evolution;

import jakarta.validation.constraints.NotBlank;

public class EvolutionCreateRequest {
  @NotBlank
  private String notes;

  public String getNotes() { return notes; }
  public void setNotes(String notes) { this.notes = notes; }
}
