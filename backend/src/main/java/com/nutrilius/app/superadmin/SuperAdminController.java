package com.nutrilius.app.superadmin;

import java.util.List;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

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

  @PostMapping("/tenants/{tenantId}/reset-password")
  @PreAuthorize("hasRole('SUPER_ADMIN')")
  public ResponseEntity<Void> resetPassword(@PathVariable Long tenantId, @Valid @RequestBody ResetPasswordRequest request) {
    superAdminService.resetAdminPassword(tenantId, request.getNewPassword());
    return ResponseEntity.ok().build();
  }

  @PutMapping("/tenants/{tenantId}/plan")
  @PreAuthorize("hasRole('SUPER_ADMIN')")
  public ResponseEntity<TenantUsageResponse> updatePlan(@PathVariable Long tenantId, @RequestBody UpdatePlanRequest request) {
    return ResponseEntity.ok(superAdminService.updatePlan(tenantId, request.getPlanType()));
  }
}
