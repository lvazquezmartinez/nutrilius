package com.nutrilius.app.superadmin;

import com.nutrilius.app.settings.TenantSettings;
import com.nutrilius.app.settings.TenantSettingsRepository;
import com.nutrilius.app.tenant.Tenant;
import com.nutrilius.app.tenant.TenantRepository;
import com.nutrilius.app.user.User;
import com.nutrilius.app.user.UserRepository;
import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class SuperAdminService {
  private final TenantRepository tenantRepository;
  private final EntityManager entityManager;
  private final UserRepository userRepository;
  private final TenantSettingsRepository settingsRepository;
  private final PasswordEncoder passwordEncoder;

  public SuperAdminService(TenantRepository tenantRepository, EntityManager entityManager,
                           UserRepository userRepository, TenantSettingsRepository settingsRepository,
                           PasswordEncoder passwordEncoder) {
    this.tenantRepository = tenantRepository;
    this.entityManager = entityManager;
    this.userRepository = userRepository;
    this.settingsRepository = settingsRepository;
    this.passwordEncoder = passwordEncoder;
  }

  public List<TenantUsageResponse> listTenants() {
    List<Tenant> tenants = tenantRepository.findAll();
    return tenants.stream().map(t -> {
      long users = ((Number) entityManager.createQuery(
          "select count(u) from User u where u.tenant.id = :tenantId")
          .setParameter("tenantId", t.getId())
          .getSingleResult()).longValue();
      long patients = ((Number) entityManager.createQuery(
          "select count(p) from Patient p where p.tenant.id = :tenantId")
          .setParameter("tenantId", t.getId())
          .getSingleResult()).longValue();
      long visits = ((Number) entityManager.createQuery(
          "select count(v) from Visit v where v.tenant.id = :tenantId")
          .setParameter("tenantId", t.getId())
          .getSingleResult()).longValue();
      String adminEmail = userRepository.findAdminByTenantId(t.getId())
          .map(User::getEmail).orElse(null);
      TenantSettings settings = settingsRepository.findByTenantId(t.getId()).orElse(null);
      String planType = settings != null ? settings.getPlanType() : null;
      return new TenantUsageResponse(
          t.getId(),
          t.getName(),
          t.isActive(),
          users,
          patients,
          visits,
          adminEmail,
          planType,
          t.getCreatedAt(),
          t.getDeactivatedAt()
      );
    }).collect(Collectors.toList());
  }

  public SuperAdminAnalyticsResponse analytics(int days) {
    Instant since = Instant.now().minus(days, ChronoUnit.DAYS);

    long totalTenants = ((Number) entityManager.createQuery("select count(t) from Tenant t")
        .getSingleResult()).longValue();
    long totalUsers = ((Number) entityManager.createQuery("select count(u) from User u where u.tenant is not null")
        .getSingleResult()).longValue();
    long totalPatients = ((Number) entityManager.createQuery("select count(p) from Patient p")
        .getSingleResult()).longValue();
    long totalVisits = ((Number) entityManager.createQuery("select count(v) from Visit v")
        .getSingleResult()).longValue();
    long totalPayments = ((Number) entityManager.createQuery("select count(p) from Payment p")
        .getSingleResult()).longValue();

    long newUsersLast30Days = ((Number) entityManager.createQuery(
        "select count(u) from User u where u.tenant is not null and u.createdAt >= :since")
        .setParameter("since", since)
        .getSingleResult()).longValue();

    long newTenantsLast30Days = ((Number) entityManager.createQuery(
        "select count(t) from Tenant t where t.createdAt >= :since")
        .setParameter("since", since)
        .getSingleResult()).longValue();

    List<ModuleUsageResponse> modules = new ArrayList<>();
    modules.add(new ModuleUsageResponse("Pacientes", countSince("Patient", "createdAt", since)));
    modules.add(new ModuleUsageResponse("Visitas", countSince("Visit", "createdAt", since)));
    modules.add(new ModuleUsageResponse("Planes", countSince("PatientPlan", "updatedAt", since)));
    modules.add(new ModuleUsageResponse("Plantillas", countSince("PlanTemplate", "createdAt", since)));
    modules.add(new ModuleUsageResponse("Pagos", countSince("Payment", "createdAt", since)));
    modules.add(new ModuleUsageResponse("Métricas", countSince("PatientMetric", "createdAt", since)));

    modules = modules.stream()
        .sorted((a, b) -> Long.compare(b.getCount(), a.getCount()))
        .collect(Collectors.toList());

    return new SuperAdminAnalyticsResponse(
        totalTenants,
        totalUsers,
        totalPatients,
        totalVisits,
        totalPayments,
        newUsersLast30Days,
        newTenantsLast30Days,
        modules
    );
  }

  private long countSince(String entity, String field, Instant since) {
    return ((Number) entityManager.createQuery(
        "select count(e) from " + entity + " e where e." + field + " >= :since")
        .setParameter("since", since)
        .getSingleResult()).longValue();
  }

  public void resetAdminPassword(Long tenantId, String newPassword) {
    User admin = userRepository.findAdminByTenantId(tenantId)
        .orElseThrow(() -> new IllegalArgumentException("Admin no encontrado para el tenant"));
    admin.setPasswordHash(passwordEncoder.encode(newPassword));
    userRepository.save(admin);
  }

  public TenantUsageResponse updatePlan(Long tenantId, String planType) {
    TenantSettings settings = settingsRepository.findByTenantId(tenantId)
        .orElseGet(() -> {
          TenantSettings s = new TenantSettings();
          Tenant tenant = tenantRepository.findById(tenantId).orElseThrow();
          s.setTenant(tenant);
          return s;
        });
    if (planType != null) settings.setPlanType(planType);
    settings.setUpdatedAt(Instant.now());
    settingsRepository.save(settings);
    return listTenants().stream().filter(t -> t.getId().equals(tenantId)).findFirst().orElse(null);
  }

  public TenantUsageResponse toggleTenant(Long tenantId) {
    Tenant tenant = tenantRepository.findById(tenantId).orElseThrow();
    boolean nextActive = !tenant.isActive();
    tenant.setActive(nextActive);
    tenant.setDeactivatedAt(nextActive ? null : Instant.now());
    tenantRepository.save(tenant);
    return listTenants().stream().filter(t -> t.getId().equals(tenantId)).findFirst().orElse(null);
  }
}
