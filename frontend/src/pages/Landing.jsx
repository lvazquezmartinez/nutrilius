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
              Nutrilius reúne historias clínicas, planes nutricionales, pagos y seguimiento en una experiencia
              simple y potente. Menos planillas, más tiempo con tus pacientes.
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
                  <p className="landing-card-title">Plan Hipocalórico</p>
                  <p className="landing-card-subtitle">Paciente: Marina R.</p>
                </div>
                <span className="landing-status">Listo</span>
              </div>
              <div className="landing-card-row">
                <div>
                  <p className="landing-card-title">Control 30 días</p>
                  <p className="landing-card-subtitle">Paciente: Bruno A.</p>
                </div>
                <span className="landing-status">Pendiente</span>
              </div>
              <div className="landing-card-row">
                <div>
                  <p className="landing-card-title">Plan Vegetariano</p>
                  <p className="landing-card-subtitle">Paciente: Agustina L.</p>
                </div>
                <span className="landing-status">Pago OK</span>
              </div>
            </div>
            <div className="landing-card-footer">
              <div>
                <p className="landing-kpi">87%</p>
                <p className="landing-kpi-label">Adherencia</p>
              </div>
              <div>
                <p className="landing-kpi">12h</p>
                <p className="landing-kpi-label">Ahorro semanal</p>
              </div>
              <div>
                <p className="landing-kpi">4.9</p>
                <p className="landing-kpi-label">Satisfacción</p>
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
            <h3>Pagos y sesiones</h3>
            <p>Controlá estados de pago, renovaciones y vencimientos con alertas claras.</p>
          </div>
          <div className="landing-feature-card">
            <h3>Seguimiento inteligente</h3>
            <p>Visualizá progreso, adherencia y métricas clave para mejorar la retención.</p>
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
              Visualizá evolución por paciente, cohortes y objetivos. Detectá mejoras en minutos, no en semanas.
            </p>
          </div>
          <ul className="landing-highlight-list">
            <li>Reportes de pagos y vencimientos</li>
            <li>Alertas de adherencia por segmento</li>
            <li>Historias clínicas siempre accesibles</li>
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
