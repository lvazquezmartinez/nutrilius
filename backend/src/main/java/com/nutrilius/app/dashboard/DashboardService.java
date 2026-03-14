package com.nutrilius.app.dashboard;

import com.nutrilius.app.security.SecurityUtil;
import com.nutrilius.app.security.UserPrincipal;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {
  private final EntityManager entityManager;

  public DashboardService(EntityManager entityManager) {
    this.entityManager = entityManager;
  }

  public DashboardResponse get() {
    UserPrincipal current = SecurityUtil.currentUser();
    Long tenantId = current.getTenantId();

    Query patientsQ = entityManager.createQuery("select count(p) from Patient p where p.tenant.id = :tenantId");
    patientsQ.setParameter("tenantId", tenantId);
    long patients = ((Number) patientsQ.getSingleResult()).longValue();

    Query visitsQ = entityManager.createQuery("select count(v) from Visit v where v.tenant.id = :tenantId");
    visitsQ.setParameter("tenantId", tenantId);
    long visits = ((Number) visitsQ.getSingleResult()).longValue();

    Query paymentsQ = entityManager.createQuery("select coalesce(sum(p.amount),0) from Payment p where p.tenant.id = :tenantId");
    paymentsQ.setParameter("tenantId", tenantId);
    double paymentsTotal = ((Number) paymentsQ.getSingleResult()).doubleValue();

    return new DashboardResponse(patients, visits, paymentsTotal);
  }
}
