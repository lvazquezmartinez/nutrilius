import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'

import { LoginPage }          from '@/pages/auth/LoginPage'
import { RegisterPage }       from '@/pages/auth/RegisterPage'
import { ConfirmEmailPage }   from '@/pages/auth/ConfirmEmailPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { ResetPasswordPage }  from '@/pages/auth/ResetPasswordPage'
import { DashboardPage }       from '@/pages/dashboard/DashboardPage'
import { PatientsPage }       from '@/pages/patients/PatientsPage'
import { PatientDetailPage }  from '@/pages/patients/PatientDetailPage'
import { AppShell }           from '@/components/layout/AppShell'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60,
    },
  },
})

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Públicas — solo si no está autenticado */}
          <Route path="/login"    element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
          <Route path="/registro" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

          {/* Públicas siempre */}
          <Route path="/confirmar-email"    element={<ConfirmEmailPage />} />
          <Route path="/recuperar-password" element={<ForgotPasswordPage />} />
          <Route path="/nueva-password"     element={<ResetPasswordPage />} />

          {/* App privada con shell */}
          <Route element={<PrivateRoute><AppShell /></PrivateRoute>}>
            <Route path="/dashboard"         element={<DashboardPage />} />
            <Route path="/pacientes"         element={<PatientsPage />} />
            <Route path="/pacientes/:id"     element={<PatientDetailPage />} />
          </Route>

          {/* Default */}
          <Route path="/"  element={<Navigate to="/dashboard" replace />} />
          <Route path="*"  element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
