package com.nutrilius.app.user;

import com.nutrilius.app.common.Role;
import com.nutrilius.app.tenant.Tenant;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;

@Entity
@Table(name = "users")
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "tenant_id")
  private Tenant tenant;

  @Column(nullable = false, unique = true)
  private String email;

  @Column(name = "password_hash", nullable = false)
  private String passwordHash;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.VARCHAR)
  @Column(nullable = false)
  private Role role;

  @Column(nullable = false)
  private boolean active = true;

  @Column(name = "email_verified", nullable = false)
  private boolean emailVerified = false;

  @Column(name = "verification_token")
  private String verificationToken;

  @Column(name = "verification_expires")
  private Instant verificationExpires;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt = Instant.now();

  public Long getId() {
    return id;
  }

  public Tenant getTenant() {
    return tenant;
  }

  public void setTenant(Tenant tenant) {
    this.tenant = tenant;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getPasswordHash() {
    return passwordHash;
  }

  public void setPasswordHash(String passwordHash) {
    this.passwordHash = passwordHash;
  }

  public Role getRole() {
    return role;
  }

  public void setRole(Role role) {
    this.role = role;
  }

  public boolean isActive() {
    return active;
  }

  public void setActive(boolean active) {
    this.active = active;
  }

  public boolean isEmailVerified() {
    return emailVerified;
  }

  public void setEmailVerified(boolean emailVerified) {
    this.emailVerified = emailVerified;
  }

  public String getVerificationToken() {
    return verificationToken;
  }

  public void setVerificationToken(String verificationToken) {
    this.verificationToken = verificationToken;
  }

  public Instant getVerificationExpires() {
    return verificationExpires;
  }

  public void setVerificationExpires(Instant verificationExpires) {
    this.verificationExpires = verificationExpires;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }
}
