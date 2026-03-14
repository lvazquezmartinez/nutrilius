package com.nutrilius.app.evolution;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patients/{patientId}/evolutions")
public class EvolutionController {
  private final EvolutionService evolutionService;

  public EvolutionController(EvolutionService evolutionService) {
    this.evolutionService = evolutionService;
  }

  @PostMapping
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public ResponseEntity<EvolutionResponse> create(@PathVariable Long patientId, @Valid @RequestBody EvolutionCreateRequest request) {
    return ResponseEntity.ok(evolutionService.create(patientId, request));
  }

  @GetMapping
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public ResponseEntity<List<EvolutionResponse>> list(@PathVariable Long patientId) {
    return ResponseEntity.ok(evolutionService.list(patientId));
  }
}
