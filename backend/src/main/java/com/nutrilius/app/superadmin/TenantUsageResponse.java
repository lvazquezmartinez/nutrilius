package com.nutrilius.app.superadmin;

public class TenantUsageResponse {
  private Long id;
  private String name;
  private boolean active;
  private long users;
  private long patients;
  private long visits;
  private String adminEmail;
  private String planType;
  private java.time.Instant createdAt;
  private java.time.Instant deactivatedAt;

  public TenantUsageResponse(Long id, String name, boolean active, long users, long patients, long visits,
                             String adminEmail, String planType, java.time.Instant createdAt, java.time.Instant deactivatedAt) {
    this.id = id;
    this.name = name;
    this.active = active;
    this.users = users;
    this.patients = patients;
    this.visits = visits;
    this.adminEmail = adminEmail;
    this.planType = planType;
    this.createdAt = createdAt;
    this.deactivatedAt = deactivatedAt;
  }

  public Long getId() { return id; }
  public String getName() { return name; }
  public boolean isActive() { return active; }
  public long getUsers() { return users; }
  public long getPatients() { return patients; }
  public long getVisits() { return visits; }
  public String getAdminEmail() { return adminEmail; }
  public String getPlanType() { return planType; }
  public java.time.Instant getCreatedAt() { return createdAt; }
  public java.time.Instant getDeactivatedAt() { return deactivatedAt; }
}
