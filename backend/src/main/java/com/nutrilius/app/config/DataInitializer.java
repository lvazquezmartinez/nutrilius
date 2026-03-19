package com.nutrilius.app.config;

import com.nutrilius.app.common.Role;
import com.nutrilius.app.tenant.Tenant;
import com.nutrilius.app.tenant.TenantRepository;
import com.nutrilius.app.user.User;
import com.nutrilius.app.user.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
  private final UserRepository userRepository;
  private final TenantRepository tenantRepository;
  private final PasswordEncoder passwordEncoder;

  @Value("${app.seed.enabled}")
  private boolean seedEnabled;

  @Value("${app.env:prod}")
  private String appEnv;

  @Value("${app.seed.super-admin-email}")
  private String superAdminEmail;

  @Value("${app.seed.super-admin-password}")
  private String superAdminPassword;

  @Value("${app.seed.demo-tenant-name}")
  private String demoTenantName;

  @Value("${app.seed.demo-admin-email}")
  private String demoAdminEmail;

  @Value("${app.seed.demo-admin-password}")
  private String demoAdminPassword;

  @Value("${app.seed.demo-user-email}")
  private String demoUserEmail;

  @Value("${app.seed.demo-user-password}")
  private String demoUserPassword;

  public DataInitializer(UserRepository userRepository, TenantRepository tenantRepository, PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.tenantRepository = tenantRepository;
    this.passwordEncoder = passwordEncoder;
  }

  @Override
  public void run(String... args) {
    if (!seedEnabled || !"dev".equalsIgnoreCase(appEnv)) {
      return;
    }

    if (userRepository.findByEmail(superAdminEmail).isEmpty()) {
      User superAdmin = new User();
      superAdmin.setEmail(superAdminEmail);
      superAdmin.setPasswordHash(passwordEncoder.encode(superAdminPassword));
      superAdmin.setRole(Role.SUPER_ADMIN);
      superAdmin.setActive(true);
      superAdmin.setEmailVerified(true);
      superAdmin.setTenant(null);
      userRepository.save(superAdmin);
    }

    Tenant demoTenant = tenantRepository.findAll().stream()
        .filter(t -> t.getName().equalsIgnoreCase(demoTenantName))
        .findFirst()
        .orElseGet(() -> {
          Tenant t = new Tenant();
          t.setName(demoTenantName);
          t.setActive(true);
          return tenantRepository.save(t);
        });

    if (userRepository.findByEmail(demoAdminEmail).isEmpty()) {
      User admin = new User();
      admin.setEmail(demoAdminEmail);
      admin.setPasswordHash(passwordEncoder.encode(demoAdminPassword));
      admin.setRole(Role.ADMIN);
      admin.setActive(true);
      admin.setEmailVerified(true);
      admin.setTenant(demoTenant);
      userRepository.save(admin);
    }

    if (userRepository.findByEmail(demoUserEmail).isEmpty()) {
      User user = new User();
      user.setEmail(demoUserEmail);
      user.setPasswordHash(passwordEncoder.encode(demoUserPassword));
      user.setRole(Role.USER);
      user.setActive(true);
      user.setEmailVerified(true);
      user.setTenant(demoTenant);
      userRepository.save(user);
    }
  }
}
