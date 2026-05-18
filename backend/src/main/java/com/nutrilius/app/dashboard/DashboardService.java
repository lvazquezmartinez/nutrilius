package com.nutrilius.app.dashboard;

import com.nutrilius.app.security.SecurityUtil;
import com.nutrilius.app.security.UserPrincipal;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import java.time.LocalDateTime;
import java.util.List;
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

    Query pendingPaymentsQ = entityManager.createNativeQuery("""
        select coalesce(sum(amount), 0) from payments
        where tenant_id = :tenantId
          and (
            status = 'OVERDUE'
            or status = 'PENDING'
            or (status = 'PENDING' and due_at is not null and due_at < :now)
          )
        """);
    pendingPaymentsQ.setParameter("tenantId", tenantId);
    pendingPaymentsQ.setParameter("now", LocalDateTime.now());
    double pendingPaymentsTotal = ((Number) pendingPaymentsQ.getSingleResult()).doubleValue();

    Query overduePaymentsQ = entityManager.createNativeQuery("""
        select count(*) from payments
        where tenant_id = :tenantId
          and (
            status = 'OVERDUE'
            or (status = 'PENDING' and due_at is not null and due_at < :now)
          )
        """);
    overduePaymentsQ.setParameter("tenantId", tenantId);
    overduePaymentsQ.setParameter("now", LocalDateTime.now());
    long overduePayments = ((Number) overduePaymentsQ.getSingleResult()).longValue();

    Query upcomingVisitsQ = entityManager.createNativeQuery("""
        select count(*) from visits
        where tenant_id = :tenantId
          and scheduled_at >= :now
          and status in ('SCHEDULED', 'CONFIRMED')
        """);
    upcomingVisitsQ.setParameter("tenantId", tenantId);
    upcomingVisitsQ.setParameter("now", LocalDateTime.now());
    long upcomingVisits = ((Number) upcomingVisitsQ.getSingleResult()).longValue();

    Query nextVisitsQ = entityManager.createNativeQuery("""
        select v.id, p.id, p.full_name, v.scheduled_at, v.status
        from visits v
        join patients p on p.id = v.patient_id
        where v.tenant_id = :tenantId
          and v.scheduled_at >= :now
          and v.status in ('SCHEDULED', 'CONFIRMED')
        order by v.scheduled_at asc
        """);
    nextVisitsQ.setParameter("tenantId", tenantId);
    nextVisitsQ.setParameter("now", LocalDateTime.now());
    nextVisitsQ.setMaxResults(5);
    @SuppressWarnings("unchecked")
    List<Object[]> rows = nextVisitsQ.getResultList();
    List<DashboardResponse.UpcomingVisitItem> nextVisits = rows.stream()
        .map(row -> new DashboardResponse.UpcomingVisitItem(
            ((Number) row[0]).longValue(),
            ((Number) row[1]).longValue(),
            (String) row[2],
            ((java.sql.Timestamp) row[3]).toLocalDateTime(),
            String.valueOf(row[4])
        ))
        .toList();

    return new DashboardResponse(patients, visits, paymentsTotal, pendingPaymentsTotal, overduePayments, upcomingVisits, nextVisits);
  }
}
