package com.nutrilius.app.patient;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

public class PatientResponse {
  private Long id;
  private String fullName;
  private String firstName;
  private String lastName;
  private String dni;
  private java.time.LocalDate birthDate;
  private String phone;
  private String email;
  private String address;
  private String sex;
  private String notes;
  private boolean isNew;
  private Instant createdAt;

  public PatientResponse(Patient patient) {
    this.id = patient.getId();
    this.fullName = patient.getFullName();
    this.firstName = patient.getFirstName();
    this.lastName = patient.getLastName();
    this.dni = patient.getDni();
    this.birthDate = patient.getBirthDate();
    this.phone = patient.getPhone();
    this.email = patient.getEmail();
    this.address = patient.getAddress();
    this.sex = patient.getSex();
    this.notes = patient.getNotes();
    this.isNew = patient.isNew();
    this.createdAt = patient.getCreatedAt();
  }

  public Long getId() {
    return id;
  }

  public String getFullName() {
    return fullName;
  }

  public String getFirstName() { return firstName; }
  public String getLastName() { return lastName; }
  public String getDni() { return dni; }
  public java.time.LocalDate getBirthDate() { return birthDate; }
  public String getPhone() { return phone; }
  public String getEmail() { return email; }
  public String getAddress() { return address; }
  public String getSex() { return sex; }
  public String getNotes() { return notes; }
  @JsonProperty("isNew")
  public boolean getIsNew() { return isNew; }

  public Instant getCreatedAt() {
    return createdAt;
  }
}
