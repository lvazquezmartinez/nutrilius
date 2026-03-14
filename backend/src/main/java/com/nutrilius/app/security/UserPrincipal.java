package com.nutrilius.app.security;

import com.nutrilius.app.common.Role;
import java.util.Collection;
import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public class UserPrincipal implements UserDetails {
  private final Long userId;
  private final Long tenantId;
  private final String email;
  private final Role role;

  public UserPrincipal(Long userId, Long tenantId, String email, Role role) {
    this.userId = userId;
    this.tenantId = tenantId;
    this.email = email;
    this.role = role;
  }

  public Long getUserId() {
    return userId;
  }

  public Long getTenantId() {
    return tenantId;
  }

  public Role getRole() {
    return role;
  }

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
  }

  @Override
  public String getPassword() {
    return "";
  }

  @Override
  public String getUsername() {
    return email;
  }

  @Override
  public boolean isAccountNonExpired() {
    return true;
  }

  @Override
  public boolean isAccountNonLocked() {
    return true;
  }

  @Override
  public boolean isCredentialsNonExpired() {
    return true;
  }

  @Override
  public boolean isEnabled() {
    return true;
  }
}
