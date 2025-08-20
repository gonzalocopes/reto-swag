import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useCart } from '../context/CartContext'
import './Header.css'

const Header = () => {
  const { items = [] } = useCart()

  // Total ítems en carrito
  const totalCount = useMemo(
    () => items.reduce((acc: number, it: any) => acc + (it?.quantity ?? 0), 0),
    [items]
  )

  // Animación bump
  const [bump, setBump] = useState(false)
  useEffect(() => {
    if (totalCount <= 0) return
    setBump(true)
    const t = setTimeout(() => setBump(false), 400)
    return () => clearTimeout(t)
  }, [totalCount])

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="logo">
            <div className="logo-icon">
              <span className="material-icons">store</span>
            </div>
            <span className="logo-text p1-medium">SWAG Challenge</span>
          </Link>

          {/* Navigation (desktop / tablet) */}
          <nav className="nav">
            <Link to="/" className="nav-link l1">
              <span className="material-icons">home</span>
              Catálogo
            </Link>

            <Link to="/cart" className={`btn btn-secondary cta1 cart-btn ${bump ? 'bump' : ''}`}>
              <span className="material-icons">shopping_cart</span>
              Carrito ({totalCount})
            </Link>
          </nav>

          {/* Actions + Cart móvil (iconito con badge) */}
          <div className="header-actions">
            <Link to="/cart" aria-label="Carrito" className={`cart-mobile-btn ${bump ? 'bump' : ''}`}>
              <span className="material-icons">shopping_cart</span>
              {totalCount > 0 && <span className="badge">{totalCount}</span>}
            </Link>

            <button className="btn btn-secondary cta1 login-btn">
              <span className="material-icons">person</span>
              <span className="login-text">Iniciar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
