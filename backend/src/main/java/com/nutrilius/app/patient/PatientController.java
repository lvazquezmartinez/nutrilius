package com.nutrilius.app.patient;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patients")
public class PatientController {
  private final PatientService patientService;

  public PatientController(PatientService patientService) {
    this.patientService = patientService;
  }

  @PostMapping
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public ResponseEntity<PatientResponse> create(@Valid @RequestBody PatientCreateRequest request) {
    return ResponseEntity.ok(patientService.create(request));
  }

  @GetMapping
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public ResponseEntity<List<PatientResponse>> list(@RequestParam(required = false) String q) {
    return ResponseEntity.ok(patientService.search(q));
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public ResponseEntity<PatientResponse> get(@PathVariable Long id) {
    return ResponseEntity.ok(patientService.get(id));
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<PatientResponse> update(@PathVariable Long id, @Valid @RequestBody PatientCreateRequest request) {
    return ResponseEntity.ok(patientService.update(id, request));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    patientService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
