package com.nutrilius.app.booking;

public class PublicBookingResponse {
  private Long patientId;
  private boolean existingPatient;
  private boolean patientNew;
  private Long visitId;

  public PublicBookingResponse(Long patientId, boolean existingPatient, boolean patientNew, Long visitId) {
    this.patientId = patientId;
    this.existingPatient = existingPatient;
    this.patientNew = patientNew;
    this.visitId = visitId;
  }

  public Long getPatientId() { return patientId; }
  public boolean isExistingPatient() { return existingPatient; }
  public boolean isPatientNew() { return patientNew; }
  public Long getVisitId() { return visitId; }
}
