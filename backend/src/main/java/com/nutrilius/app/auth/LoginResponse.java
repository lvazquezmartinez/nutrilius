package com.nutrilius.app.auth;

import com.nutrilius.app.common.Role;

public class LoginResponse {
  private String token;
  private Long userId;
  private Long tenantId;
  private String email;
  private Role role;

  public LoginResponse(String token, Long userId, Long tenantId, String email, Role role) {
    this.token = token;
    this.userId = userId;
    this.tenantId = tenantId;
    this.email = email;
    this.role = role;
  }

  public String getToken() {
    return token;
  }

  public Long getUserId() {
    return userId;
  }

  public Long getTenantId() {
    return tenantId;
  }

  public String getEmail() {
    return email;
  }

  public Role getRole() {
    return role;
  }
}
