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
    if (request.getPlanEnabled() != null) settings.setPlanEnabled(request.getPlanEnabled());
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
}
