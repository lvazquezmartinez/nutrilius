package com.nutrilius.app.visit;

import com.nutrilius.app.common.VisitStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class VisitCreateRequest {
  private LocalDate visitDate;
  private LocalDateTime scheduledAt;
  private Integer durationMinutes;
  private VisitStatus status;
  private String notes;

  public LocalDate getVisitDate() { return visitDate; }
  public void setVisitDate(LocalDate visitDate) { this.visitDate = visitDate; }
  public LocalDateTime getScheduledAt() { return scheduledAt; }
  public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }
  public Integer getDurationMinutes() { return durationMinutes; }
  public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
  public VisitStatus getStatus() { return status; }
  public void setStatus(VisitStatus status) { this.status = status; }
  public String getNotes() { return notes; }
  public void setNotes(String notes) { this.notes = notes; }
}
