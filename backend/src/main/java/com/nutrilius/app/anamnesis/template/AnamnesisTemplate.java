package com.nutrilius.app.anamnesis.template;

import com.nutrilius.app.tenant.Tenant;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "anamnesis_templates")
public class AnamnesisTemplate {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "tenant_id", nullable = false, unique = true)
  private Tenant tenant;

  @Column(name = "template_json", columnDefinition = "TEXT", nullable = false)
  private String templateJson;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt = Instant.now();

  public Long getId() { return id; }
  public Tenant getTenant() { return tenant; }
  public void setTenant(Tenant tenant) { this.tenant = tenant; }
  public String getTemplateJson() { return templateJson; }
  public void setTemplateJson(String templateJson) { this.templateJson = templateJson; }
  public Instant getUpdatedAt() { return updatedAt; }
  public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
