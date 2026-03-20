package com.nutrilius.app.user;

import com.nutrilius.app.common.Role;
import java.time.Instant;

public class UserAdminResponse {
  private Long id;
  private String email;
  private Role role;
  private boolean active;
  private boolean emailVerified;
  private Instant createdAt;

  public UserAdminResponse(User user) {
    this.id = user.getId();
    this.email = user.getEmail();
    this.role = user.getRole();
    this.active = user.isActive();
    this.emailVerified = user.isEmailVerified();
    this.createdAt = user.getCreatedAt();
  }

  public Long getId() { return id; }
  public String getEmail() { return email; }
  public Role getRole() { return role; }
  public boolean isActive() { return active; }
  public boolean isEmailVerified() { return emailVerified; }
  public Instant getCreatedAt() { return createdAt; }
}
