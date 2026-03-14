package com.nutrilius.app.superadmin;

import com.nutrilius.app.tenant.Tenant;
import com.nutrilius.app.tenant.TenantRepository;
import jakarta.persistence.EntityManager;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class SuperAdminService {
  private final TenantRepository tenantRepository;
  private final EntityManager entityManager;

  public SuperAdminService(TenantRepository tenantRepository, EntityManager entityManager) {
    this.tenantRepository = tenantRepository;
    this.entityManager = entityManager;
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
      return new TenantUsageResponse(t.getId(), t.getName(), t.isActive(), users, patients, visits);
    }).collect(Collectors.toList());
  }
}
