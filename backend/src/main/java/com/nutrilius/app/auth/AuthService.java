package com.nutrilius.app.auth;

import com.nutrilius.app.security.JwtService;
import com.nutrilius.app.user.User;
import com.nutrilius.app.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
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
    Long tenantId = user.getTenant() != null ? user.getTenant().getId() : null;
    String token = jwtService.generateToken(user.getId(), tenantId, user.getEmail(), user.getRole());
    return new LoginResponse(token, user.getId(), tenantId, user.getEmail(), user.getRole());
  }
}
