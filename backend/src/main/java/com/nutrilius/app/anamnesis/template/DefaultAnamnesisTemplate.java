package com.nutrilius.app.anamnesis.template;

public class DefaultAnamnesisTemplate {
  public static final String JSON = """
{
  \"title\": \"Anamnesis Base\",
  \"sections\": [
    {
      \"title\": \"Datos Generales\",
      \"fields\": [
        { \"key\": \"edad\", \"label\": \"Edad\", \"type\": \"text\" },
        { \"key\": \"ocupacion\", \"label\": \"Ocupación\", \"type\": \"text\" },
        { \"key\": \"motivo_consulta\", \"label\": \"Motivo de consulta\", \"type\": \"textarea\" }
      ]
    },
    {
      \"title\": \"Antecedente patológico personal\",
      \"fields\": [
        { \"key\": \"app_medicacion\", \"label\": \"Medicación\", \"type\": \"textarea\" },
        { \"key\": \"app_alcohol\", \"label\": \"Alcohol\", \"type\": \"text\" },
        { \"key\": \"app_tabaco\", \"label\": \"Tabaco\", \"type\": \"text\" },
        { \"key\": \"app_sintomas_gastro\", \"label\": \"Síntomas gástricos/gastrointestinales\", \"type\": \"textarea\" }
      ]
    },
    {
      \"title\": \"Hábitos y Alimentación\",
      \"fields\": [
        { \"key\": \"comidas_por_dia\", \"label\": \"¿Cuántas comidas realizas al día?\", \"type\": \"text\" },
        { \"key\": \"cocina_quien\", \"label\": \"¿Cocina el/ella u otro?\", \"type\": \"text\" },
        { \"key\": \"come_fuera\", \"label\": \"¿Consume alimentos fuera de casa? (frecuencia)\", \"type\": \"text\" },
        { \"key\": \"usa_suplementos\", \"label\": \"¿Utiliza suplementos?\", \"type\": \"text\" },
        { \"key\": \"alergias\", \"label\": \"Alergia a algún alimento\", \"type\": \"text\" },
        { \"key\": \"restricciones\", \"label\": \"Restricciones médicas o culturales\", \"type\": \"text\" },
        { \"key\": \"no_gusta\", \"label\": \"Algo que no le guste\", \"type\": \"text\" },
        { \"key\": \"recordatorio_24hs\", \"label\": \"Recordatorio 24hs\", \"type\": \"textarea\" },
        { \"key\": \"desayuno\", \"label\": \"Desayuno\", \"type\": \"textarea\" },
        { \"key\": \"colacion\", \"label\": \"Colación\", \"type\": \"textarea\" },
        { \"key\": \"almuerzo\", \"label\": \"Almuerzo\", \"type\": \"textarea\" },
        { \"key\": \"merienda\", \"label\": \"Merienda\", \"type\": \"textarea\" },
        { \"key\": \"cena\", \"label\": \"Cena\", \"type\": \"textarea\" },
        { \"key\": \"agua\", \"label\": \"Agua (consumo)\", \"type\": \"text\" },
        { \"key\": \"dulces\", \"label\": \"Dulces\", \"type\": \"text\" },
        { \"key\": \"metodos_coccion\", \"label\": \"Métodos de cocción\", \"type\": \"text\" },
        { \"key\": \"comentarios\", \"label\": \"Comentarios\", \"type\": \"textarea\" }
      ]
    },
    {
      \"title\": \"Actividad Física\",
      \"fields\": [
        { \"key\": \"act_fisica\", \"label\": \"Actividad física\", \"type\": \"textarea\" }
      ]
    },
    {
      \"title\": \"Físico\",
      \"fields\": [
        { \"key\": \"examen_fisico\", \"label\": \"Examen físico\", \"type\": \"textarea\" },
        { \"key\": \"examen_peso\", \"label\": \"Peso\", \"type\": \"text\" },
        { \"key\": \"examen_talla\", \"label\": \"Talla\", \"type\": \"text\" },
        { \"key\": \"examen_medidas\", \"label\": \"Todas las medidas\", \"type\": \"textarea\" },
        { \"key\": \"cintura_cm\", \"label\": \"Circunferencia de cintura (cm)\", \"type\": \"text\" },
        { \"key\": \"cuello_cm\", \"label\": \"Circunferencia de cuello (cm)\", \"type\": \"text\" }
      ]
    },
    {
      \"title\": \"Comentarios finales\",
      \"fields\": [
        { \"key\": \"comentarios_finales\", \"label\": \"Comentarios\", \"type\": \"textarea\" }
      ]
    }
  ]
}
""";
}
