import React from 'react'
import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Patients from './pages/Patients.jsx'
import PatientCreate from './pages/PatientCreate.jsx'
import PatientDetail from './pages/PatientDetail.jsx'
import PatientPayments from './pages/PatientPayments.jsx'
import SuperAdmin from './pages/SuperAdmin.jsx'
import Settings from './pages/Settings.jsx'

const getUser = () => {
  const raw = localStorage.getItem('user')
  return raw ? JSON.parse(raw) : null
}

const PrivateRoute = ({ children }) => {
  const user = getUser()
  if (!user) return <Navigate to="/login" replace />
  return children
}

const AppLayout = ({ children }) => {
  const navigate = useNavigate()
  const user = getUser()

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="app-layout">
      <aside className="sidebar bg-white shadow-sm">
        <div className="sidebar-header">Nutrilius</div>
        <nav className="sidebar-nav">
          <NavLink className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} to="/dashboard">Dashboard</NavLink>
          <NavLink className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} to="/patients">Pacientes</NavLink>
          {user?.role === 'ADMIN' && (
            <NavLink className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} to="/settings">Configuración</NavLink>
          )}
          {user?.role === 'SUPER_ADMIN' && (
            <NavLink className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} to="/super">Super Admin</NavLink>
          )}
        </nav>
        <div className="sidebar-footer">
          <button className="btn btn-outline-danger w-100" onClick={logout}>
            Salir
          </button>
        </div>
      </aside>
      <main>
        {children}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/patients"
        element={
          <PrivateRoute>
            <AppLayout>
              <Patients />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/patients/new"
        element={
          <PrivateRoute>
            <AppLayout>
              <PatientCreate />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/patients/:id"
        element={
          <PrivateRoute>
            <AppLayout>
              <PatientDetail />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/patients/:id/payments"
        element={
          <PrivateRoute>
            <AppLayout>
              <PatientPayments />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/super"
        element={
          <PrivateRoute>
            <AppLayout>
              <SuperAdmin />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <AppLayout>
              <Settings />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
