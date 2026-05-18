package com.nutrilius.app.settings;

import com.nutrilius.app.tenant.Tenant;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;

@Entity
@Table(name = "tenant_settings")
public class TenantSettings {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "tenant_id", nullable = false, unique = true)
  private Tenant tenant;

  private String nutritionistName;
  private String businessName;
  private String licenseNumber;
  @Column(name = "plan_type")
  private String planType;

  @Column(name = "public_booking_slug", unique = true)
  private String publicBookingSlug;

  @Column(name = "logo_mime")
  private String logoMime;

  @Lob
  @JdbcTypeCode(SqlTypes.LONGVARBINARY)
  @Column(name = "logo_blob", columnDefinition = "LONGBLOB")
  private byte[] logoBlob;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt = Instant.now();

  public Long getId() { return id; }
  public Tenant getTenant() { return tenant; }
  public void setTenant(Tenant tenant) { this.tenant = tenant; }
  public String getNutritionistName() { return nutritionistName; }
  public void setNutritionistName(String nutritionistName) { this.nutritionistName = nutritionistName; }
  public String getBusinessName() { return businessName; }
  public void setBusinessName(String businessName) { this.businessName = businessName; }
  public String getLicenseNumber() { return licenseNumber; }
  public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }
  public String getPlanType() { return planType; }
  public void setPlanType(String planType) { this.planType = planType; }
  public String getPublicBookingSlug() { return publicBookingSlug; }
  public void setPublicBookingSlug(String publicBookingSlug) { this.publicBookingSlug = publicBookingSlug; }
  public String getLogoMime() { return logoMime; }
  public void setLogoMime(String logoMime) { this.logoMime = logoMime; }
  public byte[] getLogoBlob() { return logoBlob; }
  public void setLogoBlob(byte[] logoBlob) { this.logoBlob = logoBlob; }
  public Instant getUpdatedAt() { return updatedAt; }
  public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
