import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './CartToast.css'

type CartAddedDetail = { qty: number; total: number }

export default function CartToast() {
  const [open, setOpen] = useState(false)
  const [qty, setQty] = useState(0)
  const [total, setTotal] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const onAdded = (e: Event) => {
      const detail = (e as CustomEvent<CartAddedDetail>).detail
      setQty(detail?.qty ?? 0)
      setTotal(detail?.total ?? 0)
      setOpen(true)
      window.clearTimeout((window as any).__cart_toast_timer)
      ;(window as any).__cart_toast_timer = window.setTimeout(() => setOpen(false), 2000)
    }

    window.addEventListener('cart:added', onAdded as EventListener)
    return () => window.removeEventListener('cart:added', onAdded as EventListener)
  }, [])

  if (!open) return null

  return (
    <div className="cart-toast" role="status" aria-live="polite">
      <span className="material-icons cart-toast__icon">check_circle</span>
      <div className="cart-toast__content">
        <strong>Agregado al carrito</strong>
        <span className="l1">
          {qty} {qty === 1 ? 'item' : 'items'} • ${total.toLocaleString('es-CL')}
        </span>
      </div>
      <button
        type="button"
        className="btn btn-secondary cart-toast__btn"
        onClick={() => {
          setOpen(false)       // cierra el toast
          navigate('/cart')    // navegación SPA sin recargar la página
        }}
      >
        Ver carrito
      </button>
    </div>
  )
}
