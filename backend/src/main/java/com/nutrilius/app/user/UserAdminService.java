package com.nutrilius.app.user;

import com.nutrilius.app.common.Role;
import com.nutrilius.app.security.SecurityUtil;
import com.nutrilius.app.security.UserPrincipal;
import java.security.SecureRandom;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserAdminService {
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final SecureRandom random = new SecureRandom();

  public UserAdminService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
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

  private String generateTempPassword() {
    String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    StringBuilder sb = new StringBuilder();
    for (int i = 0; i < 10; i++) {
      sb.append(chars.charAt(random.nextInt(chars.length())));
    }
    return sb.toString();
  }
}
