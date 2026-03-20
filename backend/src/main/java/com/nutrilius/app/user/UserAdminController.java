package com.nutrilius.app.user;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserAdminController {
  private final UserAdminService service;

  public UserAdminController(UserAdminService service) {
    this.service = service;
  }

  @GetMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<List<UserAdminResponse>> list() {
    return ResponseEntity.ok(service.list());
  }

  @PostMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<UserAdminResponse> create(@Valid @RequestBody UserCreateRequest request) {
    return ResponseEntity.ok(service.create(request));
  }

  @PostMapping("/{id}/reset-password")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<UserResetResponse> reset(@PathVariable Long id) {
    return ResponseEntity.ok(service.resetPassword(id));
  }

  @PostMapping("/{id}/send-reset")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<com.nutrilius.app.auth.RegisterResponse> sendReset(@PathVariable Long id) {
    return ResponseEntity.ok(service.sendResetEmail(id));
  }

  @PostMapping("/{id}/toggle")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<UserAdminResponse> toggle(@PathVariable Long id) {
    return ResponseEntity.ok(service.toggleActive(id));
  }
}
