package com.nutrilius.app.settings;

import com.nutrilius.app.security.SecurityUtil;
import com.nutrilius.app.security.UserPrincipal;
import com.nutrilius.app.user.UserRepository;
import java.time.Instant;
import org.springframework.stereotype.Service;

@Service
public class TenantSettingsService {
  private final TenantSettingsRepository repository;
  private final UserRepository userRepository;

  public TenantSettingsService(TenantSettingsRepository repository, UserRepository userRepository) {
    this.repository = repository;
    this.userRepository = userRepository;
  }

  public TenantSettings getOrCreate() {
    UserPrincipal current = SecurityUtil.currentUser();
    return repository.findByTenantId(current.getTenantId())
        .orElseGet(() -> {
          TenantSettings s = new TenantSettings();
          s.setTenant(userRepository.findById(current.getUserId()).orElseThrow().getTenant());
          s.setPublicBookingSlug("turnos-" + s.getTenant().getId());
          return repository.save(s);
        });
  }

  public TenantSettingsResponse get() {
    return new TenantSettingsResponse(getOrCreate());
  }

  public TenantSettingsResponse update(TenantSettingsRequest request) {
    TenantSettings settings = getOrCreate();
    if (request.getNutritionistName() != null) settings.setNutritionistName(request.getNutritionistName());
    if (request.getBusinessName() != null) settings.setBusinessName(request.getBusinessName());
    if (request.getLicenseNumber() != null) settings.setLicenseNumber(request.getLicenseNumber());
    if (request.getPlanType() != null) settings.setPlanType(request.getPlanType());
    if (request.getPublicBookingSlug() != null) settings.setPublicBookingSlug(normalizeSlug(request.getPublicBookingSlug()));
    if (settings.getPublicBookingSlug() == null || settings.getPublicBookingSlug().isBlank()) {
      settings.setPublicBookingSlug(defaultSlug(settings));
    }
    settings.setUpdatedAt(Instant.now());
    return new TenantSettingsResponse(repository.save(settings));
  }

  public void updateLogo(byte[] data, String mime) {
    TenantSettings settings = getOrCreate();
    settings.setLogoBlob(data);
    settings.setLogoMime(mime);
    settings.setUpdatedAt(Instant.now());
    repository.save(settings);
  }

  public TenantSettings findByPublicBookingSlug(String slug) {
    return repository.findByPublicBookingSlugIgnoreCase(normalizeSlug(slug))
        .orElseThrow(() -> new IllegalArgumentException("Link de turnos no encontrado"));
  }

  private String defaultSlug(TenantSettings settings) {
    String base = settings.getBusinessName();
    if (base == null || base.isBlank()) {
      base = settings.getNutritionistName();
    }
    if (base == null || base.isBlank()) {
      base = "turnos-" + settings.getTenant().getId();
    }
    String normalized = normalizeSlug(base);
    return normalized.isBlank() ? "turnos-" + settings.getTenant().getId() : normalized;
  }

  private String normalizeSlug(String value) {
    return value == null ? null : value.trim().toLowerCase()
        .replaceAll("[^a-z0-9]+", "-")
        .replaceAll("(^-|-$)", "");
  }
}
