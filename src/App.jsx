import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Home  from './pages/Home'

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth()
  if (loading) return null
  return currentUser ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { currentUser, loading } = useAuth()
  if (loading) return null
  return currentUser ? <Navigate to="/" replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/"      element={<ProtectedRoute><Home /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  )
}
