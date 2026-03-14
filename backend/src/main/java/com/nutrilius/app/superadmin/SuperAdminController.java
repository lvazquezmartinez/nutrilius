package com.nutrilius.app.superadmin;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/super")
public class SuperAdminController {
  private final SuperAdminService superAdminService;

  public SuperAdminController(SuperAdminService superAdminService) {
    this.superAdminService = superAdminService;
  }

  @GetMapping("/tenants")
  @PreAuthorize("hasRole('SUPER_ADMIN')")
  public ResponseEntity<List<TenantUsageResponse>> listTenants() {
    return ResponseEntity.ok(superAdminService.listTenants());
  }
}
