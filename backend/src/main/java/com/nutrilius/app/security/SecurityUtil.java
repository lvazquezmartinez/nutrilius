package com.nutrilius.app.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtil {
  private SecurityUtil() {}

  public static UserPrincipal currentUser() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal)) {
      return null;
    }
    return (UserPrincipal) auth.getPrincipal();
  }
}
