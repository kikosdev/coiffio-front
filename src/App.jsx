import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import SignIn from './pages/SignIn'
import MyAccount from './pages/MyAccount'
import BookVisit from './pages/BookVisit'
import SalonDashboard from './pages/SalonDashboard'
import ShopHomePage from './pages/shop/ShopHomePage'
import ProductDetailPage from './pages/shop/ProductDetailPage'
import CartPage from './pages/shop/CartPage'
import CheckoutPage from './pages/shop/CheckoutPage'
import OrderConfirmationPage from './pages/shop/OrderConfirmationPage'
import OrderTrackingPage from './pages/shop/OrderTrackingPage'

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

      {/* E-commerce public shop */}
      <Route path="/shop" element={<ShopHomePage />} />
      <Route path="/shop/product/:id" element={<ProductDetailPage />} />
      <Route path="/shop/cart" element={<CartPage />} />
      <Route path="/shop/checkout" element={<CheckoutPage />} />
      <Route path="/shop/order/:orderNumber" element={<OrderConfirmationPage />} />
      <Route path="/shop/track" element={<OrderTrackingPage />} />
    </Routes>
  )
}
