import { Link, useLocation } from 'react-router-dom'
import { useMemo } from 'react'
import { useCart } from '../context/CartContext'
import './MobileCartBar.css'

const formatCLP = (n: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n || 0)

export default function MobileCartBar() {
  const { items = [] } = useCart()
  const location = useLocation()

  const { qty, total } = useMemo(() => {
    const q = items.reduce((a: number, it: any) => a + (it?.quantity ?? 0), 0)
    const t = items.reduce((a: number, it: any) => {
      const unit = (it?.unitPrice ?? it?.product?.basePrice ?? it?.basePrice ?? 0)
      return a + unit * (it?.quantity ?? 0)
    }, 0)
    return { qty: q, total: t }
  }, [items])

  // No mostrar en desktop ni si no hay items ni cuando ya estamos en /cart
  if (qty === 0 || location.pathname === '/cart') return null

  return (
    <div className="mobile-cart-bar">
      <div className="info">
        <span className="qty">{qty} {qty === 1 ? 'ítem' : 'ítems'}</span>
        <span className="dot">•</span>
        <span className="total">{formatCLP(total)}</span>
      </div>
      <Link to="/cart" className="btn-go">
        <span className="material-icons">shopping_bag</span>
        Ver carrito
      </Link>
    </div>
  )
}
