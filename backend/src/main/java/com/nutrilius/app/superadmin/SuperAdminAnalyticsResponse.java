package com.nutrilius.app.superadmin;

import java.util.List;

public class SuperAdminAnalyticsResponse {
  private long totalTenants;
  private long totalUsers;
  private long totalPatients;
  private long totalVisits;
  private long totalPayments;
  private long newUsersLast30Days;
  private long newTenantsLast30Days;
  private List<ModuleUsageResponse> modulesLast30Days;

  public SuperAdminAnalyticsResponse(long totalTenants, long totalUsers, long totalPatients, long totalVisits,
                                     long totalPayments, long newUsersLast30Days, long newTenantsLast30Days,
                                     List<ModuleUsageResponse> modulesLast30Days) {
    this.totalTenants = totalTenants;
    this.totalUsers = totalUsers;
    this.totalPatients = totalPatients;
    this.totalVisits = totalVisits;
    this.totalPayments = totalPayments;
    this.newUsersLast30Days = newUsersLast30Days;
    this.newTenantsLast30Days = newTenantsLast30Days;
    this.modulesLast30Days = modulesLast30Days;
  }

  public long getTotalTenants() { return totalTenants; }
  public long getTotalUsers() { return totalUsers; }
  public long getTotalPatients() { return totalPatients; }
  public long getTotalVisits() { return totalVisits; }
  public long getTotalPayments() { return totalPayments; }
  public long getNewUsersLast30Days() { return newUsersLast30Days; }
  public long getNewTenantsLast30Days() { return newTenantsLast30Days; }
  public List<ModuleUsageResponse> getModulesLast30Days() { return modulesLast30Days; }
}
