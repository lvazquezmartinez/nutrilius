package com.nutrilius.app.superadmin;

public class TenantUsageResponse {
  private Long id;
  private String name;
  private boolean active;
  private long users;
  private long patients;
  private long visits;

  public TenantUsageResponse(Long id, String name, boolean active, long users, long patients, long visits) {
    this.id = id;
    this.name = name;
    this.active = active;
    this.users = users;
    this.patients = patients;
    this.visits = visits;
  }

  public Long getId() { return id; }
  public String getName() { return name; }
  public boolean isActive() { return active; }
  public long getUsers() { return users; }
  public long getPatients() { return patients; }
  public long getVisits() { return visits; }
}
