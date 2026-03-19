package com.nutrilius.app.user;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByEmail(String email);

  @Query("select u from User u where u.tenant.id = :tenantId and u.role = com.nutrilius.app.common.Role.ADMIN")
  Optional<User> findAdminByTenantId(@Param("tenantId") Long tenantId);
}
