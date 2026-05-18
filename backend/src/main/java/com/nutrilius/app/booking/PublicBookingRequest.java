package com.nutrilius.app.booking;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class PublicBookingRequest {
  @NotBlank
  private String dni;
  @NotBlank
  private String firstName;
  private String lastName;
  private String phone;
  private String email;
  @NotNull
  private LocalDateTime scheduledAt;
  private Integer durationMinutes;
  private String notes;

  public String getDni() { return dni; }
  public void setDni(String dni) { this.dni = dni; }
  public String getFirstName() { return firstName; }
  public void setFirstName(String firstName) { this.firstName = firstName; }
  public String getLastName() { return lastName; }
  public void setLastName(String lastName) { this.lastName = lastName; }
  public String getPhone() { return phone; }
  public void setPhone(String phone) { this.phone = phone; }
  public String getEmail() { return email; }
  public void setEmail(String email) { this.email = email; }
  public LocalDateTime getScheduledAt() { return scheduledAt; }
  public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }
  public Integer getDurationMinutes() { return durationMinutes; }
  public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
  public String getNotes() { return notes; }
  public void setNotes(String notes) { this.notes = notes; }
}
