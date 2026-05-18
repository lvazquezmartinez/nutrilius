package com.nutrilius.app.dashboard;

import java.time.LocalDateTime;
import java.util.List;

public class DashboardResponse {
  private long patients;
  private long visits;
  private double paymentsTotal;
  private double pendingPaymentsTotal;
  private long overduePayments;
  private long upcomingVisits;
  private List<UpcomingVisitItem> nextVisits;

  public DashboardResponse(long patients, long visits, double paymentsTotal, double pendingPaymentsTotal,
                           long overduePayments, long upcomingVisits, List<UpcomingVisitItem> nextVisits) {
    this.patients = patients;
    this.visits = visits;
    this.paymentsTotal = paymentsTotal;
    this.pendingPaymentsTotal = pendingPaymentsTotal;
    this.overduePayments = overduePayments;
    this.upcomingVisits = upcomingVisits;
    this.nextVisits = nextVisits;
  }

  public long getPatients() { return patients; }
  public long getVisits() { return visits; }
  public double getPaymentsTotal() { return paymentsTotal; }
  public double getPendingPaymentsTotal() { return pendingPaymentsTotal; }
  public long getOverduePayments() { return overduePayments; }
  public long getUpcomingVisits() { return upcomingVisits; }
  public List<UpcomingVisitItem> getNextVisits() { return nextVisits; }

  public static class UpcomingVisitItem {
    private Long id;
    private Long patientId;
    private String patientName;
    private LocalDateTime scheduledAt;
    private String status;

    public UpcomingVisitItem(Long id, Long patientId, String patientName, LocalDateTime scheduledAt, String status) {
      this.id = id;
      this.patientId = patientId;
      this.patientName = patientName;
      this.scheduledAt = scheduledAt;
      this.status = status;
    }

    public Long getId() { return id; }
    public Long getPatientId() { return patientId; }
    public String getPatientName() { return patientName; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public String getStatus() { return status; }
  }
}
