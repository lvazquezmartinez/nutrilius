package com.nutrilius.app.settings;

import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/settings")
public class TenantSettingsController {
  private final TenantSettingsService service;

  public TenantSettingsController(TenantSettingsService service) {
    this.service = service;
  }

  @GetMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<TenantSettingsResponse> get() {
    return ResponseEntity.ok(service.get());
  }

  @PutMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<TenantSettingsResponse> update(@Valid @RequestBody TenantSettingsRequest request) {
    return ResponseEntity.ok(service.update(request));
  }

  @PostMapping(value = "/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Void> uploadLogo(@RequestPart("file") MultipartFile file) throws Exception {
    service.updateLogo(file.getBytes(), file.getContentType());
    return ResponseEntity.ok().build();
  }
}
