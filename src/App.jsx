import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import SignIn from './pages/SignIn'
import MyAccount from './pages/MyAccount'
import BookVisit from './pages/BookVisit'
import SalonDashboard from './pages/SalonDashboard'

function OwnerRoute({ children }) {
  const role = localStorage.getItem('haire_role')
  return role === 'owner' ? children : <Navigate to="/signin" replace />
}

function GuestRoute({ children }) {
  const token = localStorage.getItem('haire_token')
  const role  = localStorage.getItem('haire_role')
  if (!token) return children
  const staffRoles = ['owner', 'supervisor', 'staff']
  return <Navigate to={staffRoles.includes(role) ? '/dashboard' : '/account'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signin" element={<GuestRoute><SignIn /></GuestRoute>} />
      <Route path="/account" element={<MyAccount />} />
      <Route path="/book" element={<BookVisit />} />
      <Route path="/dashboard/*" element={<OwnerRoute><SalonDashboard /></OwnerRoute>} />
    </Routes>
  )
}
