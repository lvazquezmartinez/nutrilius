package com.nutrilius.app.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URI;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class OriginValidationFilter extends OncePerRequestFilter {
  private final boolean debugEnabled;
  private final Set<String> allowedOrigins;

  public OriginValidationFilter(
      @Value("${app.debug:false}") boolean debugEnabled,
      @Value("${APP_CORS_ORIGINS:http://localhost:5173}") String corsOrigins) {
    this.debugEnabled = debugEnabled;
    this.allowedOrigins = Arrays.stream(corsOrigins.split(","))
        .map(String::trim)
        .filter(s -> !s.isEmpty())
        .map(OriginValidationFilter::normalizeOrigin)
        .collect(Collectors.toCollection(HashSet::new));
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    String path = request.getRequestURI();
    if (debugEnabled
        || "OPTIONS".equalsIgnoreCase(request.getMethod())
        || "/auth/confirm".equals(path)
        || path.startsWith("/public/booking/")
        || path.startsWith("/public/plan/")
        || "/actuator/health".equals(path)) {
      filterChain.doFilter(request, response);
      return;
    }

    String originHeader = request.getHeader("Origin");
    String refererHeader = request.getHeader("Referer");
    String origin = originHeader != null ? originHeader : refererHeader;

    if (origin == null || origin.isBlank()) {
      reject(response);
      return;
    }

    String normalized = normalizeOrigin(origin);
    if (!allowedOrigins.contains(normalized)) {
      reject(response);
      return;
    }

    filterChain.doFilter(request, response);
  }

  private static String normalizeOrigin(String value) {
    try {
      URI uri = URI.create(value);
      if (uri.getScheme() != null && uri.getHost() != null) {
        int port = uri.getPort();
        String base = uri.getScheme() + "://" + uri.getHost();
        if (port != -1) {
          base += ":" + port;
        }
        return base;
      }
    } catch (IllegalArgumentException ignored) {
      // Fall through to manual trim.
    }
    return value.trim().replaceAll("/+$", "");
  }

  private void reject(HttpServletResponse response) throws IOException {
    response.setStatus(HttpStatus.FORBIDDEN.value());
    response.setContentType("application/json");
    response.getWriter().write("{\"error\":\"Origen no permitido\"}");
  }
}
