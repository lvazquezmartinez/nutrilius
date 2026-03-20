package com.nutrilius.app.user;

import com.nutrilius.app.auth.RegisterResponse;
import com.nutrilius.app.common.Role;
import com.nutrilius.app.security.SecurityUtil;
import com.nutrilius.app.security.UserPrincipal;
import com.nutrilius.app.mail.MailService;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserAdminService {
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final MailService mailService;
  private final String publicUrl;
  private final SecureRandom random = new SecureRandom();

  public UserAdminService(UserRepository userRepository, PasswordEncoder passwordEncoder, MailService mailService,
                          @org.springframework.beans.factory.annotation.Value("${app.public-url}") String publicUrl) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.mailService = mailService;
    this.publicUrl = publicUrl;
  }

  public List<UserAdminResponse> list() {
    UserPrincipal current = SecurityUtil.currentUser();
    return userRepository.findByTenantIdOrderByCreatedAtDesc(current.getTenantId())
        .stream()
        .map(UserAdminResponse::new)
        .collect(Collectors.toList());
  }

  public UserAdminResponse create(UserCreateRequest request) {
    if (request.getRole() == Role.SUPER_ADMIN) {
      throw new IllegalArgumentException("Rol inválido");
    }
    if (userRepository.findByEmail(request.getEmail()).isPresent()) {
      throw new IllegalArgumentException("El email ya está registrado");
    }
    UserPrincipal current = SecurityUtil.currentUser();
    User admin = userRepository.findById(current.getUserId()).orElseThrow();
    User user = new User();
    user.setTenant(admin.getTenant());
    user.setEmail(request.getEmail());
    user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
    user.setRole(request.getRole());
    user.setActive(true);
    user.setEmailVerified(true);
    return new UserAdminResponse(userRepository.save(user));
  }

  public UserAdminResponse toggleActive(Long id) {
    UserPrincipal current = SecurityUtil.currentUser();
    User user = userRepository.findByTenantIdAndId(current.getTenantId(), id)
        .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
    if (user.getRole() == Role.ADMIN) {
      throw new IllegalArgumentException("No se puede desactivar un administrador");
    }
    user.setActive(!user.isActive());
    return new UserAdminResponse(userRepository.save(user));
  }

  public UserResetResponse resetPassword(Long id) {
    UserPrincipal current = SecurityUtil.currentUser();
    User user = userRepository.findByTenantIdAndId(current.getTenantId(), id)
        .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
    String temp = generateTempPassword();
    user.setPasswordHash(passwordEncoder.encode(temp));
    userRepository.save(user);
    return new UserResetResponse(temp);
  }

  public RegisterResponse sendResetEmail(Long id) {
    UserPrincipal current = SecurityUtil.currentUser();
    User user = userRepository.findByTenantIdAndId(current.getTenantId(), id)
        .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
    user.setResetToken(UUID.randomUUID().toString());
    user.setResetExpires(Instant.now().plus(2, ChronoUnit.HOURS));
    userRepository.save(user);

    String link = publicUrl + "/reset-password?token=" + user.getResetToken();
    String body = "Hola,\n\n"
        + "El administrador solicitó un reinicio de contraseña. Usá este link:\n"
        + link + "\n\n"
        + "Este link vence en 2 horas.\n\n"
        + "Equipo Nutrilius";
    mailService.send(user.getEmail(), "Reiniciar contraseña", body);
    return new RegisterResponse("Email enviado.");
  }

  private String generateTempPassword() {
    String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    StringBuilder sb = new StringBuilder();
    for (int i = 0; i < 10; i++) {
      sb.append(chars.charAt(random.nextInt(chars.length())));
    }
    return sb.toString();
  }
}
