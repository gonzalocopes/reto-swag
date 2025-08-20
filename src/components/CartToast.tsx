import { useEffect, useState } from 'react'
import './CartToast.css'

type ToastData = { message: string }

export default function CartToast() {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<ToastData>({ message: '' })

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ToastData>).detail
      setData(detail)
      setOpen(true)
      const t = setTimeout(() => setOpen(false), 1800)
      return () => clearTimeout(t)
    }
    window.addEventListener('swag:toast', handler as EventListener)
    return () => window.removeEventListener('swag:toast', handler as EventListener)
  }, [])

  return (
    <div className={`cart-toast ${open ? 'show' : ''}`}>
      <span className="material-icons">check_circle</span>
      <span className="toast-text l1">{data.message}</span>
    </div>
  )
}
