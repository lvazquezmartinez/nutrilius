package com.nutrilius.app.superadmin;

public class ModuleUsageResponse {
  private String module;
  private long count;

  public ModuleUsageResponse(String module, long count) {
    this.module = module;
    this.count = count;
  }

  public String getModule() { return module; }
  public long getCount() { return count; }
}
