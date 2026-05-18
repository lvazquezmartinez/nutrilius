import React from 'react'
import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="landing-root">
      <header className="landing-hero">
        <nav className="landing-nav">
          <div className="landing-logo">Nutrilius</div>
          <div className="landing-nav-actions">
            <Link className="landing-link" to="/login">Ingresar</Link>
            <Link className="landing-btn landing-btn-primary" to="/register">Registrate</Link>
          </div>
        </nav>

        <div className="landing-hero-grid">
          <div className="landing-hero-copy">
            <p className="landing-eyebrow">Software para nutricionistas y clínicas</p>
            <h1>Planes claros, pacientes felices y control total en un solo lugar.</h1>
            <p className="landing-subtitle">
              Nutrilius reúne historia clínica, turnos, planes nutricionales, pagos y seguimiento en una sola
              operación. Menos planillas, menos ida y vuelta y más tiempo clínico.
            </p>
            <div className="landing-cta-row">
              <Link className="landing-btn landing-btn-primary" to="/register">Crear cuenta</Link>
              <Link className="landing-btn landing-btn-ghost" to="/login">Ya tengo cuenta</Link>
            </div>
            <div className="landing-microcopy">
              Integración rápida • Datos seguros • Soporte humano
            </div>
          </div>

          <div className="landing-hero-card">
            <div className="landing-card-header">
              <span>Agenda de hoy</span>
              <span className="landing-pill">En vivo</span>
            </div>
            <div className="landing-card-body">
              <div className="landing-card-row">
                <div>
                  <p className="landing-card-title">09:00 · Primera consulta</p>
                  <p className="landing-card-subtitle">Paciente: Marina R.</p>
                </div>
                <span className="landing-status">Confirmado</span>
              </div>
              <div className="landing-card-row">
                <div>
                  <p className="landing-card-title">11:30 · Control 30 días</p>
                  <p className="landing-card-subtitle">Paciente: Bruno A.</p>
                </div>
                <span className="landing-status">Google Calendar</span>
              </div>
              <div className="landing-card-row">
                <div>
                  <p className="landing-card-title">Pago consulta mensual</p>
                  <p className="landing-card-subtitle">Paciente: Agustina L.</p>
                </div>
                <span className="landing-status">Vence hoy</span>
              </div>
            </div>
            <div className="landing-card-footer">
              <div>
                <p className="landing-kpi">6</p>
                <p className="landing-kpi-label">Turnos hoy</p>
              </div>
              <div>
                <p className="landing-kpi">3</p>
                <p className="landing-kpi-label">Pagos pendientes</p>
              </div>
              <div>
                <p className="landing-kpi">24h</p>
                <p className="landing-kpi-label">Vista operativa</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="landing-section">
        <div className="landing-section-header">
          <h2>Todo tu flujo clínico, sin fricción</h2>
          <p>
            Diseñado para equipos pequeños y clínicas en crecimiento. Automatizá lo repetitivo y enfocá la
            consulta en resultados.
          </p>
        </div>
        <div className="landing-feature-grid">
          <div className="landing-feature-card">
            <h3>Planes nutricionales rápidos</h3>
            <p>Crea planes reutilizables, genera PDFs con tu marca y comparte en segundos.</p>
          </div>
          <div className="landing-feature-card">
            <h3>Turnos y calendario</h3>
            <p>Programá consultas, marcá estados del turno y abrí cada visita en Google Calendar en un click.</p>
          </div>
          <div className="landing-feature-card">
            <h3>Pagos con vencimiento</h3>
            <p>Controlá pagos cobrados, pendientes y vencidos con fechas claras por paciente.</p>
          </div>
        </div>
      </section>

      <section className="landing-section landing-accent" id="demo">
        <div className="landing-section-header">
          <h2>Una implementación que no te frena</h2>
          <p>Configuramos tu cuenta, migramos tu base y entrenamos a tu equipo en menos de una semana.</p>
        </div>
        <div className="landing-steps">
          <div className="landing-step">
            <span className="landing-step-number">01</span>
            <h4>Diagnóstico</h4>
            <p>Relevamos tu operación actual y definimos prioridades.</p>
          </div>
          <div className="landing-step">
            <span className="landing-step-number">02</span>
            <h4>Implementación</h4>
            <p>Configuramos planes, usuarios y branding en 48 horas.</p>
          </div>
          <div className="landing-step">
            <span className="landing-step-number">03</span>
            <h4>Onboarding</h4>
            <p>Capacitamos a tu equipo y ajustamos flujos a tu estilo.</p>
          </div>
        </div>
        <div className="landing-cta-row landing-cta-center">
          <Link className="landing-btn landing-btn-primary" to="/register">Empezar ahora</Link>
          <Link className="landing-btn landing-btn-ghost" to="/login">Ingresar ahora</Link>
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-section-header">
          <h2>Hecho para decisiones rápidas</h2>
          <p>Paneles claros, indicadores accionables y reportes que sí sirven para tu negocio.</p>
        </div>
        <div className="landing-highlight">
          <div>
            <h3>Dashboard en tiempo real</h3>
            <p>
              Visualizá próximos turnos, pagos pendientes, vencimientos y actividad clínica desde una sola vista.
            </p>
          </div>
          <ul className="landing-highlight-list">
            <li>Próximas visitas con acceso directo al paciente</li>
            <li>Montos pendientes y pagos vencidos</li>
            <li>Historias clínicas, métricas y planes siempre accesibles</li>
          </ul>
        </div>
      </section>

      <footer className="landing-footer">
        <div>
          <p className="landing-footer-title">Nutrilius</p>
          <p>La plataforma que te ayuda a escalar tu práctica.</p>
        </div>
        <div className="landing-footer-links">
          <Link to="/register">Registrate</Link>
          <Link to="/login">Ingresar</Link>
        </div>
      </footer>
    </div>
  )
}
