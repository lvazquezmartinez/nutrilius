package com.nutrilius.app.settings;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TenantSettingsRepository extends JpaRepository<TenantSettings, Long> {
  Optional<TenantSettings> findByTenantId(Long tenantId);
  Optional<TenantSettings> findByPublicBookingSlugIgnoreCase(String publicBookingSlug);
}
