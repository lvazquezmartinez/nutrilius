package com.nutrilius.app.visit;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class VisitController {
  private final VisitService visitService;

  public VisitController(VisitService visitService) {
    this.visitService = visitService;
  }

  @PostMapping("/patients/{patientId}/visits")
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public ResponseEntity<VisitResponse> create(@PathVariable Long patientId, @RequestBody VisitCreateRequest request) {
    return ResponseEntity.ok(visitService.create(patientId, request));
  }

  @GetMapping("/patients/{patientId}/visits")
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public ResponseEntity<List<VisitResponse>> list(@PathVariable Long patientId) {
    return ResponseEntity.ok(visitService.list(patientId));
  }
}
