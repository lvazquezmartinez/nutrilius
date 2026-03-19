package com.nutrilius.app.auth;

public class RegisterResponse {
  private String message;

  public RegisterResponse(String message) {
    this.message = message;
  }

  public String getMessage() {
    return message;
  }
}
