import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import AuthPage from './pages/AuthPage'
import TasksPage from './pages/TasksPage'

function ProtectedRoute({ children }) {
  const accessToken = useSelector((s) => s.auth.accessToken)
  return accessToken ? children : <Navigate to="/login" replace />
}

function GuestRoute({ children }) {
  const accessToken = useSelector((s) => s.auth.accessToken)
  return accessToken ? <Navigate to="/tasks" replace /> : children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <AuthPage />
            </GuestRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TasksPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
