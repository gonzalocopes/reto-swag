import { Link, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { useCart } from '../context/CartContext'
import type { Product } from '../types/Product'
import './Cart.css'

const formatCLP = (n: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n || 0)

/** Normaliza cualquier forma de item para usarla en la UI */
function toViewItem(raw: any) {
  if (!raw) return null
  // { product: {...}, quantity, unitPrice, ... }
  if ('product' in raw && raw.product) {
    const p: Product = raw.product
    return {
      product: p,
      quantity: raw.quantity ?? 1,
      unitPrice: raw.unitPrice ?? p.basePrice ?? 0,
      selectedColor: raw.selectedColor,
      selectedSize: raw.selectedSize,
    }
  }
  // CartItem estilo "Product extendido"
  const p = raw as Product
  return {
    product: p,
    quantity: (raw as any).quantity ?? 1,
    unitPrice: (raw as any).unitPrice ?? p.basePrice ?? 0,
    selectedColor: (raw as any).selectedColor,
    selectedSize: (raw as any).selectedSize,
  }
}

export default function Cart() {
  const navigate = useNavigate()
  // Sacamos solo las funciones que sabemos existen + items
  const { items = [], updateQuantity, removeItem, clearCart: clearCtx } = useCart() as any

  const viewItems = useMemo(() => {
    return (items as any[]).map(toViewItem).filter(Boolean) as Array<{
      product: Product; quantity: number; unitPrice: number; selectedColor?: string; selectedSize?: string
    }>
  }, [items])

  // Totales calculados localmente (no dependemos del contexto)
  const totalCount = useMemo(
    () => viewItems.reduce((acc, it) => acc + (it.quantity || 0), 0),
    [viewItems]
  )
  const grandTotal = useMemo(
    () => viewItems.reduce((acc, it) => acc + (it.unitPrice || 0) * (it.quantity || 0), 0),
    [viewItems]
  )

  const handleQty = (idx: number, newQty: number) => {
    const it = viewItems[idx]
    if (!it) return
    const qty = Math.max(1, newQty || 1)
    updateQuantity?.(it.product.id, qty, it.selectedColor, it.selectedSize)
    window.dispatchEvent(new CustomEvent('swag:toast', {
      detail: { message: `Actualizado: ${qty}× ${it.product.name}` }
    }))
  }

  const handleRemove = (idx: number) => {
    const it = viewItems[idx]
    if (!it) return
    removeItem?.(it.product.id, it.selectedColor, it.selectedSize)
    window.dispatchEvent(new CustomEvent('swag:toast', {
      detail: { message: `Eliminado: ${it.product.name}` }
    }))
  }

  const handleClear = () => {
    if (typeof clearCtx === 'function') {
      clearCtx()
    } else {
      // Fallback si el contexto no provee clearCart:
      for (const it of viewItems) {
        removeItem?.(it.product.id, it.selectedColor, it.selectedSize)
      }
    }
    window.dispatchEvent(new CustomEvent('swag:toast', {
      detail: { message: 'Carrito vacío' }
    }))
    navigate('/')
  }

  const handleCheckout = () => {
    if (viewItems.length === 0) return
    const lines = viewItems.map(it => {
      const color = it.selectedColor ? ` • Color: ${it.selectedColor}` : ''
      const size  = it.selectedSize ? ` • Talla: ${it.selectedSize}` : ''
      return `- ${it.product.name} (${it.product.sku}) • ${it.quantity} u. • PU: ${formatCLP(it.unitPrice)}${color}${size}`
    }).join('\n')
    const subject = `Pedido (${totalCount} ítems) – Total ${formatCLP(grandTotal)}`
    const body =
`Hola, quisiera avanzar con la compra:

${lines}

Total: ${formatCLP(grandTotal)}

Datos de facturación y envío:
- Nombre/Empresa:
- RUT/DNI:
- Dirección:
- Teléfono:

Gracias.`
    window.location.href = `mailto:ventas@tuempresa.cl?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  if (viewItems.length === 0) {
    return (
      <div className="container">
        <div className="cart-empty card">
          <span className="material-icons">remove_shopping_cart</span>
          <h2 className="h2">Tu carrito está vacío</h2>
          <p className="p1">Agrega productos desde el catálogo para verlos aquí.</p>
          <Link to="/" className="btn btn-primary cta1">
            <span className="material-icons">arrow_back</span>
            Volver al catálogo
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="cart-page">
        <div className="cart-header">
          <div className="left">
            <h1 className="h2">Carrito</h1>
            <p className="p1">{totalCount} {totalCount === 1 ? 'ítem' : 'ítems'}</p>
          </div>
          <div className="right">
            <button className="btn btn-secondary cta1" onClick={handleClear}>
              <span className="material-icons">delete_sweep</span>
              Vaciar carrito
            </button>
          </div>
        </div>

        <div className="cart-card card">
          <div className="cart-list">
            <div className="cart-row cart-head">
              <div className="col product">Producto</div>
              <div className="col price">Precio</div>
              <div className="col qty">Cantidad</div>
              <div className="col subtotal">Subtotal</div>
              <div className="col actions">Acciones</div>
            </div>

            {viewItems.map((it, idx) => {
              const lineTotal = (it.unitPrice || 0) * (it.quantity || 0)
              const p = it.product
              return (
                <div className="cart-row" key={`${p?.id}-${it.selectedColor ?? ''}-${it.selectedSize ?? ''}`}>
                  <div className="col product">
                    <div className="prod">
                      <div className="thumb">
                        <span className="material-icons">image</span>
                      </div>
                      <div className="meta">
                        <div className="name p1-medium">{p?.name ?? 'Producto'}</div>
                        <div className="sku l1">SKU: {p?.sku ?? '-'}</div>
                        {(it.selectedColor || it.selectedSize) && (
                          <div className="variants l1">
                            {it.selectedColor && <span>Color: {it.selectedColor}</span>}
                            {it.selectedSize && <span> · Talla: {it.selectedSize}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col price">
                    <div className="p1-medium">{formatCLP(it.unitPrice)}</div>
                    <div className="l1 muted">Unit.</div>
                  </div>

                  <div className="col qty">
                    <div className="qty-ctrl">
                      <button onClick={() => handleQty(idx, (it.quantity || 1) - 1)} className="qty-btn">
                        <span className="material-icons">remove</span>
                      </button>
                      <input
                        type="number"
                        className="qty-input"
                        min={1}
                        value={it.quantity || 1}
                        onChange={(e) => handleQty(idx, parseInt(e.target.value) || 1)}
                      />
                      <button onClick={() => handleQty(idx, (it.quantity || 1) + 1)} className="qty-btn">
                        <span className="material-icons">add</span>
                      </button>
                    </div>
                  </div>

                  <div className="col subtotal">
                    <div className="p1-medium">{formatCLP(lineTotal)}</div>
                  </div>

                  <div className="col actions">
                    <button
                      className="btn btn-secondary small danger"
                      onClick={() => handleRemove(idx)}
                      aria-label="Eliminar"
                    >
                      <span className="material-icons">delete</span>
                      <span className="hide-sm">Eliminar</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="cart-summary">
            <div className="row">
              <span className="l1">Envío</span>
              <span className="l1">A calcular</span>
            </div>
            <div className="row total">
              <span className="p1-medium">Total</span>
              <span className="h2">{formatCLP(grandTotal)}</span>
            </div>

            <button className="btn btn-primary cta1 full" onClick={handleCheckout}>
              <span className="material-icons">shopping_bag</span>
              Finalizar compra
            </button>

            <Link to="/" className="btn btn-secondary cta1 full to-catalog">
              <span className="material-icons">arrow_back</span>
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
