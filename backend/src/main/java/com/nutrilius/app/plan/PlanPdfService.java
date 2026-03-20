package com.nutrilius.app.plan;

import com.nutrilius.app.patient.Patient;
import com.nutrilius.app.patient.PatientService;
import com.nutrilius.app.settings.TenantSettings;
import com.nutrilius.app.settings.TenantSettingsRepository;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.Arrays;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.pdmodel.graphics.state.PDExtendedGraphicsState;
import org.springframework.stereotype.Service;

@Service
public class PlanPdfService {
  private final PatientPlanService planService;
  private final PatientService patientService;
  private final TenantSettingsRepository settingsRepository;

  public PlanPdfService(PatientPlanService planService, PatientService patientService, TenantSettingsRepository settingsRepository) {
    this.planService = planService;
    this.patientService = patientService;
    this.settingsRepository = settingsRepository;
  }

  public byte[] generate(Long patientId) throws Exception {
    PatientPlanResponse plan = planService.get(patientId);
    Patient patient = patientService.getPatientForTenant(patientId);
    TenantSettings settings = settingsRepository.findByTenantId(patient.getTenant().getId()).orElse(null);
    if (settings == null) {
      settings = new TenantSettings();
    }
    return generateForPlan(plan != null ? plan.getContentText() : "", patient, settings);
  }

  public byte[] generateForPlan(String contentText, Patient patient, TenantSettings settings) throws Exception {
    try (PDDocument doc = new PDDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
      PDPage page = new PDPage(PDRectangle.A4);
      doc.addPage(page);

      try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
        PDRectangle box = page.getMediaBox();
        float margin = 40;
        float y = box.getHeight() - margin;

        // Watermark logo
        if (settings.getLogoBlob() != null && settings.getLogoBlob().length > 0) {
          PDImageXObject image = PDImageXObject.createFromByteArray(doc, settings.getLogoBlob(), "logo");
          PDExtendedGraphicsState gs = new PDExtendedGraphicsState();
          gs.setNonStrokingAlphaConstant(0.08f);
          cs.setGraphicsStateParameters(gs);
          float imgW = box.getWidth() * 0.6f;
          float imgH = imgW * (image.getHeight() / (float) image.getWidth());
          float x = (box.getWidth() - imgW) / 2;
          float yImg = (box.getHeight() - imgH) / 2;
          cs.drawImage(image, x, yImg, imgW, imgH);
          cs.setGraphicsStateParameters(new PDExtendedGraphicsState());
        }

        // Header
        cs.beginText();
        cs.setFont(PDType1Font.HELVETICA_BOLD, 14);
        cs.newLineAtOffset(margin, y);
        cs.showText("Plan alimenticio");
        cs.endText();
        y -= 20;

        cs.beginText();
        cs.setFont(PDType1Font.HELVETICA, 10);
        cs.newLineAtOffset(margin, y);
        cs.showText("Paciente: " + patient.getFullName());
        cs.endText();
        y -= 14;

        String header = String.join(" | ", Arrays.asList(
            settings.getNutritionistName() == null ? "" : settings.getNutritionistName(),
            settings.getBusinessName() == null ? "" : settings.getBusinessName(),
            settings.getLicenseNumber() == null ? "" : "Matricula: " + settings.getLicenseNumber()
        ));
        cs.beginText();
        cs.setFont(PDType1Font.HELVETICA, 10);
        cs.newLineAtOffset(margin, y);
        cs.showText(header.trim());
        cs.endText();
        y -= 24;

        // Content
        String content = contentText != null ? contentText : "";
        cs.setFont(PDType1Font.HELVETICA, 11);
        for (String line : content.split("\\r?\\n")) {
          if (y < margin) {
            break;
          }
          cs.beginText();
          cs.newLineAtOffset(margin, y);
          cs.showText(line);
          cs.endText();
          y -= 14;
        }
      }

      doc.save(out);
      return out.toByteArray();
    }
  }
}
