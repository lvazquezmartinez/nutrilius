package com.nutrilius.app.patient;

public class PatientCreateRequest {
  private String firstName;
  private String lastName;
  private String dni;
  private java.time.LocalDate birthDate;
  private String phone;
  private String email;
  private String address;
  private String sex;
  private String notes;
  private Boolean isNew;

  public String getFirstName() { return firstName; }
  public void setFirstName(String firstName) { this.firstName = firstName; }
  public String getLastName() { return lastName; }
  public void setLastName(String lastName) { this.lastName = lastName; }
  public String getDni() { return dni; }
  public void setDni(String dni) { this.dni = dni; }
  public java.time.LocalDate getBirthDate() { return birthDate; }
  public void setBirthDate(java.time.LocalDate birthDate) { this.birthDate = birthDate; }
  public String getPhone() { return phone; }
  public void setPhone(String phone) { this.phone = phone; }
  public String getEmail() { return email; }
  public void setEmail(String email) { this.email = email; }
  public String getAddress() { return address; }
  public void setAddress(String address) { this.address = address; }
  public String getSex() { return sex; }
  public void setSex(String sex) { this.sex = sex; }
  public String getNotes() { return notes; }
  public void setNotes(String notes) { this.notes = notes; }
  public Boolean getIsNew() { return isNew; }
  public void setIsNew(Boolean isNew) { this.isNew = isNew; }
}
