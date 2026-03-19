package com.nutrilius.app.plan;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutrilius.app.anamnesis.Anamnesis;
import com.nutrilius.app.anamnesis.AnamnesisRepository;
import com.nutrilius.app.metrics.PatientMetric;
import com.nutrilius.app.metrics.PatientMetricRepository;
import com.nutrilius.app.patient.Patient;
import com.nutrilius.app.patient.PatientService;
import com.nutrilius.app.security.SecurityUtil;
import com.nutrilius.app.security.UserPrincipal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class PlanAiService {
  private final ObjectMapper objectMapper;
  private final PatientService patientService;
  private final AnamnesisRepository anamnesisRepository;
  private final PatientMetricRepository metricRepository;
  private final HttpClient httpClient;

  @Value("${OPENAI_API_KEY:}")
  private String apiKey;

  public PlanAiService(ObjectMapper objectMapper, PatientService patientService,
                       AnamnesisRepository anamnesisRepository, PatientMetricRepository metricRepository) {
    this.objectMapper = objectMapper;
    this.patientService = patientService;
    this.anamnesisRepository = anamnesisRepository;
    this.metricRepository = metricRepository;
    this.httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(20)).build();
  }

  public String generate(Long patientId, String notes) {
    if (apiKey == null || apiKey.isBlank()) {
      throw new IllegalArgumentException("Falta OPENAI_API_KEY");
    }
    UserPrincipal current = SecurityUtil.currentUser();
    Patient patient = patientService.getPatientForTenant(patientId);

    List<Anamnesis> anamneses = anamnesisRepository.findByTenantIdAndPatientId(current.getTenantId(), patientId);
    Anamnesis latest = anamneses.isEmpty() ? null : anamneses.get(anamneses.size() - 1);

    List<PatientMetric> metrics = metricRepository.findByTenantIdAndPatientIdOrderByMeasuredAtAsc(current.getTenantId(), patientId);
    PatientMetric lastMetric = metrics.isEmpty() ? null : metrics.get(metrics.size() - 1);

    String prompt = buildPrompt(patient, latest, lastMetric, notes);

    try {
      String payload = objectMapper.createObjectNode()
          .put("model", "gpt-5")
          .set("input", objectMapper.createArrayNode()
              .add(objectMapper.createObjectNode().put("role", "system").put("content", SYSTEM_INSTRUCTIONS))
              .add(objectMapper.createObjectNode().put("role", "user").put("content", prompt))
          )
          .toString();

      HttpRequest request = HttpRequest.newBuilder()
          .uri(URI.create("https://api.openai.com/v1/responses"))
          .timeout(Duration.ofSeconds(60))
          .header("Authorization", "Bearer " + apiKey)
          .header("Content-Type", "application/json")
          .POST(HttpRequest.BodyPublishers.ofString(payload))
          .build();

      HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
      if (response.statusCode() >= 300) {
        throw new IllegalArgumentException("Error OpenAI: " + response.body());
      }

      JsonNode root = objectMapper.readTree(response.body());
      JsonNode output = root.get("output_text");
      if (output == null || output.isNull()) {
        return "";
      }
      return output.asText();
    } catch (Exception ex) {
      throw new IllegalArgumentException("Error generando plan con IA");
    }
  }

  private String buildPrompt(Patient patient, Anamnesis latest, PatientMetric lastMetric, String notes) {
    StringBuilder sb = new StringBuilder();
    sb.append("Genera un PLAN ALIMENTARIO en español con este FORMATO.\n\n");
    sb.append("FORMATO (títulos en mayúsculas):\n");
    sb.append("PLAN ALIMENTARIO\nNOMBRE DEL PACIENTE\n\n");
    sb.append("SELECCION ALIMENTARIA Y RECOMENDACIONES\n");
    sb.append("- Frutas y verduras\n- Lácteos y quesos\n- Carnes, pescados y huevos\n- Aceites, frutos secos y semillas\n- Cereales, pan y pasta\n- Legumbres\n- Condimentos\n- Bebidas\n\n");
    sb.append("SUGERENCIAS\n");
    sb.append("DESAYUNO\nMERIENDA\nALMUERZO\nCENAS\n\n");
    sb.append("SUGERENCIAS PARA COLACIONES\n\n");
    sb.append("TIPS MERIENDAS FUERA DE CASA\n\n");
    sb.append("TIPS\n\n");

    sb.append("DATOS DEL PACIENTE:\n");
    sb.append("Nombre: ").append(patient.getFullName()).append("\n");
    if (latest != null && latest.getDataJson() != null) {
      sb.append("Anamnesis JSON: ").append(latest.getDataJson()).append("\n");
    }
    if (lastMetric != null) {
      sb.append("Ultimas métricas: ");
      sb.append("peso=" + lastMetric.getWeightKg() + ", altura=" + lastMetric.getHeightM());
      sb.append(", imc=" + lastMetric.getBmi() + ", cintura=" + lastMetric.getWaistCm());
      sb.append(", cuello=" + lastMetric.getNeckCm());
      sb.append("\n");
    }
    if (notes != null && !notes.isBlank()) {
      sb.append("Notas del profesional: ").append(notes).append("\n");
    }
    sb.append("\nReglas: no inventes diagnósticos. Usá un tono profesional.\n");
    return sb.toString();
  }

  private static final String SYSTEM_INSTRUCTIONS = "Eres un nutricionista clínico. Redacta planes claros y accionables. Mantén el formato solicitado.";
}
