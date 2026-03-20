package com.nutrilius.app.user;

public class UserResetResponse {
  private String tempPassword;

  public UserResetResponse(String tempPassword) {
    this.tempPassword = tempPassword;
  }

  public String getTempPassword() {
    return tempPassword;
  }
}
