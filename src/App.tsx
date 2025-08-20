// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import ProductList from './pages/ProductList'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import CartToast from './components/CartToast' // si no querés el toast, también podés quitarlo
import './App.css'

function App() {
  return (
    <div className="App">
      <Header />
      <CartToast />
      <main>
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
export default App
