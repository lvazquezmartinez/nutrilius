package com.nutrilius.app.plan;

import com.nutrilius.app.patient.Patient;
import com.nutrilius.app.tenant.Tenant;
import com.nutrilius.app.user.User;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "patient_plans")
public class PatientPlan {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "tenant_id", nullable = false)
  private Tenant tenant;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "patient_id", nullable = false)
  private Patient patient;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "created_by", nullable = false)
  private User createdBy;

  @Column(name = "content_text", columnDefinition = "TEXT", nullable = false)
  private String contentText;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt = Instant.now();

  @Column(name = "share_token")
  private String shareToken;

  @Column(name = "share_enabled", nullable = false)
  private boolean shareEnabled = false;

  public Long getId() { return id; }
  public Tenant getTenant() { return tenant; }
  public void setTenant(Tenant tenant) { this.tenant = tenant; }
  public Patient getPatient() { return patient; }
  public void setPatient(Patient patient) { this.patient = patient; }
  public User getCreatedBy() { return createdBy; }
  public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
  public String getContentText() { return contentText; }
  public void setContentText(String contentText) { this.contentText = contentText; }
  public Instant getUpdatedAt() { return updatedAt; }
  public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
  public String getShareToken() { return shareToken; }
  public void setShareToken(String shareToken) { this.shareToken = shareToken; }
  public boolean isShareEnabled() { return shareEnabled; }
  public void setShareEnabled(boolean shareEnabled) { this.shareEnabled = shareEnabled; }
}
