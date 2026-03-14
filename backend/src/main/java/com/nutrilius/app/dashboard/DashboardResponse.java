package com.nutrilius.app.dashboard;

public class DashboardResponse {
  private long patients;
  private long visits;
  private double paymentsTotal;

  public DashboardResponse(long patients, long visits, double paymentsTotal) {
    this.patients = patients;
    this.visits = visits;
    this.paymentsTotal = paymentsTotal;
  }

  public long getPatients() { return patients; }
  public long getVisits() { return visits; }
  public double getPaymentsTotal() { return paymentsTotal; }
}
