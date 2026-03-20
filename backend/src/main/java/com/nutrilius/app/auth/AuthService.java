package com.nutrilius.app.auth;

import com.nutrilius.app.common.Role;
import com.nutrilius.app.mail.MailService;
import com.nutrilius.app.security.JwtService;
import com.nutrilius.app.settings.TenantSettings;
import com.nutrilius.app.settings.TenantSettingsRepository;
import com.nutrilius.app.tenant.Tenant;
import com.nutrilius.app.tenant.TenantRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import com.nutrilius.app.user.User;
import com.nutrilius.app.user.UserRepository;
import java.util.Locale;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.view.RedirectView;

@Service
public class AuthService {
  private final UserRepository userRepository;
  private final TenantRepository tenantRepository;
  private final TenantSettingsRepository tenantSettingsRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final MailService mailService;
  private final String publicUrl;
  private final String apiUrl;

  public AuthService(UserRepository userRepository, TenantRepository tenantRepository,
                     TenantSettingsRepository tenantSettingsRepository,
                     PasswordEncoder passwordEncoder, JwtService jwtService,
                     MailService mailService,
                     @org.springframework.beans.factory.annotation.Value("${app.public-url}") String publicUrl,
                     @org.springframework.beans.factory.annotation.Value("${app.api-url}") String apiUrl) {
    this.userRepository = userRepository;
    this.tenantRepository = tenantRepository;
    this.tenantSettingsRepository = tenantSettingsRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
    this.mailService = mailService;
    this.publicUrl = publicUrl;
    this.apiUrl = apiUrl;
  }

  public LoginResponse login(LoginRequest request) {
    User user = userRepository.findByEmail(request.getEmail())
        .orElseThrow(() -> new IllegalArgumentException("Credenciales inválidas"));
    if (!user.isActive()) {
      throw new IllegalArgumentException("Usuario inactivo");
    }
    if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
      throw new IllegalArgumentException("Credenciales inválidas");
    }
    if (!user.isEmailVerified()) {
      throw new IllegalArgumentException("Debes confirmar tu email");
    }
    Long tenantId = user.getTenant() != null ? user.getTenant().getId() : null;
    String token = jwtService.generateToken(user.getId(), tenantId, user.getEmail(), user.getRole());
    return new LoginResponse(token, user.getId(), tenantId, user.getEmail(), user.getRole());
  }

  public RegisterResponse register(RegisterRequest request) {
    if (userRepository.findByEmail(request.getEmail()).isPresent()) {
      throw new IllegalArgumentException("El email ya está registrado");
    }

    String tenantName = buildTenantName(request);
    Tenant tenant = new Tenant();
    tenant.setName(tenantName);
    tenant.setActive(true);
    tenant = tenantRepository.save(tenant);

    TenantSettings settings = new TenantSettings();
    settings.setTenant(tenant);
    settings.setNutritionistName(request.getNutritionistName());
    settings.setBusinessName(blankToNull(request.getBusinessName()));
    settings.setPlanType("BASIC");
    tenantSettingsRepository.save(settings);

    User admin = new User();
    admin.setEmail(request.getEmail());
    admin.setPasswordHash(passwordEncoder.encode(request.getPassword()));
    admin.setRole(Role.ADMIN);
    admin.setActive(true);
    admin.setEmailVerified(false);
    admin.setVerificationToken(UUID.randomUUID().toString());
    admin.setVerificationExpires(Instant.now().plus(24, ChronoUnit.HOURS));
    admin.setTenant(tenant);
    admin = userRepository.save(admin);

    String link = apiUrl + "/auth/confirm?token=" + admin.getVerificationToken();
    String body = "Hola " + request.getNutritionistName() + ",\n\n"
        + "Confirmá tu email para activar tu cuenta:\n"
        + link + "\n\n"
        + "Este link vence en 24 horas.\n\n"
        + "Equipo Nutrilius";
    mailService.send(admin.getEmail(), "Confirmá tu cuenta de Nutrilius", body);

    return new RegisterResponse("Te enviamos un email de confirmación.");
  }

  public RedirectView confirm(String token) {
    User user = userRepository.findByVerificationToken(token)
        .orElseThrow(() -> new IllegalArgumentException("Token inválido"));
    if (user.getVerificationExpires() != null && user.getVerificationExpires().isBefore(Instant.now())) {
      throw new IllegalArgumentException("El token expiró");
    }
    user.setEmailVerified(true);
    user.setVerificationToken(null);
    user.setVerificationExpires(null);
    userRepository.save(user);

    return new RedirectView(publicUrl + "/login?confirmed=1");
  }

  private String buildTenantName(RegisterRequest request) {
    String business = blankToNull(request.getBusinessName());
    if (business != null) {
      return business;
    }
    String name = request.getNutritionistName() != null ? request.getNutritionistName().trim() : "";
    if (!name.isEmpty()) {
      return name;
    }
    String email = request.getEmail();
    int at = email != null ? email.indexOf('@') : -1;
    return at > 0 ? email.substring(0, at).toLowerCase(Locale.ROOT) : "Nutrilius";
  }

  private String blankToNull(String value) {
    if (value == null) {
      return null;
    }
    String trimmed = value.trim();
    return trimmed.isEmpty() ? null : trimmed;
  }
}
