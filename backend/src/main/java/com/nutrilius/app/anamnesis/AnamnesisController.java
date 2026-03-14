package com.nutrilius.app.anamnesis;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patients/{patientId}/anamneses")
public class AnamnesisController {
  private final AnamnesisService anamnesisService;

  public AnamnesisController(AnamnesisService anamnesisService) {
    this.anamnesisService = anamnesisService;
  }

  @PostMapping
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public ResponseEntity<AnamnesisResponse> create(@PathVariable Long patientId, @RequestBody AnamnesisCreateRequest request) {
    return ResponseEntity.ok(anamnesisService.create(patientId, request));
  }

  @GetMapping
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public ResponseEntity<List<AnamnesisResponse>> list(@PathVariable Long patientId) {
    return ResponseEntity.ok(anamnesisService.list(patientId));
  }

  @PutMapping("/{anamnesisId}")
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public ResponseEntity<AnamnesisResponse> update(@PathVariable Long patientId, @PathVariable Long anamnesisId,
                                                  @RequestBody AnamnesisUpdateRequest request) {
    return ResponseEntity.ok(anamnesisService.updateData(patientId, anamnesisId, request.getData()));
  }
}
