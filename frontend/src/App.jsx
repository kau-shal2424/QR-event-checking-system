import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Events from './pages/Events'
import EventDetails from './pages/EventDetails'
import QRScanner from './pages/QRScanner'
import Ticket from './pages/Ticket'
import Register from './pages/Register'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/events" element={<ProtectedRoute><Layout><Events /></Layout></ProtectedRoute>} />
      <Route path="/events/:id" element={<ProtectedRoute><Layout><EventDetails /></Layout></ProtectedRoute>} />
      <Route path="/scan" element={<ProtectedRoute><Layout><QRScanner /></Layout></ProtectedRoute>} />
      <Route path="/ticket/:id" element={<Ticket />} />
    </Routes>
  )
}

export default App
