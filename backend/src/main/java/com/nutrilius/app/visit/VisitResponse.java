package com.nutrilius.app.visit;

import com.nutrilius.app.common.VisitStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class VisitResponse {
  private Long id;
  private LocalDate visitDate;
  private LocalDateTime scheduledAt;
  private Integer durationMinutes;
  private VisitStatus status;
  private boolean reminderSent;
  private String notes;
  private Instant createdAt;

  public VisitResponse(Visit visit) {
    this.id = visit.getId();
    this.visitDate = visit.getVisitDate();
    this.scheduledAt = visit.getScheduledAt();
    this.durationMinutes = visit.getDurationMinutes();
    this.status = visit.getStatus();
    this.reminderSent = visit.isReminderSent();
    this.notes = visit.getNotes();
    this.createdAt = visit.getCreatedAt();
  }

  public Long getId() { return id; }
  public LocalDate getVisitDate() { return visitDate; }
  public LocalDateTime getScheduledAt() { return scheduledAt; }
  public Integer getDurationMinutes() { return durationMinutes; }
  public VisitStatus getStatus() { return status; }
  public boolean isReminderSent() { return reminderSent; }
  public String getNotes() { return notes; }
  public Instant getCreatedAt() { return createdAt; }
}
