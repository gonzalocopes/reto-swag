import { useMemo, useState } from 'react'
import type { Product } from '../types/Product'
import { useCart } from '../context/CartContext'
import './PricingCalculator.css'

interface PricingCalculatorProps {
  product: Product
}

const formatCLP = (n: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

const PricingCalculator = ({ product }: PricingCalculatorProps) => {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState<number>(1)
  const [selectedBreak, setSelectedBreak] = useState<number>(0)

  const sortedBreaks = useMemo(() => {
    return (product.priceBreaks ?? []).slice().sort((a, b) => a.minQty - b.minQty)
  }, [product.priceBreaks])

  const applicableBreak = useMemo(() => {
    if (sortedBreaks.length === 0) return null
    let last = sortedBreaks[0]
    for (const br of sortedBreaks) {
      if (quantity >= br.minQty) last = br
      else break
    }
    return last
  }, [sortedBreaks, quantity])

  const unit = applicableBreak ? applicableBreak.price : product.basePrice
  const currentPrice = unit * quantity

  const discountPercent = useMemo(() => {
    const baseTotal = product.basePrice * quantity
    if (baseTotal <= 0) return 0
    const diff = baseTotal - currentPrice
    return (diff / baseTotal) * 100
  }, [product.basePrice, quantity, currentPrice])

  const clampQty = (val: number) => {
    const max = Math.max(1, product.stock || 1)
    return Math.min(Math.max(1, val), max)
  }

  return (
    <div className="pricing-calculator">
      <div className="calculator-header">
        <h3 className="calculator-title p1-medium">Calculadora de Precios</h3>
        <p className="calculator-subtitle l1">Calcula el precio según la cantidad que necesitas</p>
      </div>

      <div className="calculator-content">
        {/* Cantidad */}
        <div className="quantity-section">
          <label className="quantity-label p1-medium">Cantidad</label>
          <div className="quantity-input-group">
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(clampQty(parseInt(e.target.value) || 1))}
              className="quantity-input p1"
              min={1}
              max={Math.max(1, product.stock || 1)}
            />
            <span className="quantity-unit l1">unidades</span>
          </div>
        </div>

        {/* Tiers */}
        {sortedBreaks.length > 0 && (
          <div className="price-breaks-section">
            <h4 className="breaks-title p1-medium">Descuentos por volumen</h4>
            <div className="price-breaks">
              {sortedBreaks.map((priceBreak, index) => {
                const isActive = quantity >= priceBreak.minQty
                const isSelected = selectedBreak === index
                return (
                  <div
                    key={index}
                    className={`price-break ${isActive ? 'active' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedBreak(index)
                      setQuantity(clampQty(priceBreak.minQty))
                    }}
                  >
                    <div className="break-quantity l1">{priceBreak.minQty}+ unidades</div>
                    <div className="break-price p1-medium">{formatCLP(priceBreak.price)}</div>
                    {priceBreak.discount && <div className="break-discount l1">-{priceBreak.discount}%</div>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Resumen */}
        <div className="price-summary">
          <div className="summary-row">
            <span className="summary-label p1">Precio unitario:</span>
            <span className="summary-value p1-medium">{formatCLP(unit)}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label p1">Cantidad:</span>
            <span className="summary-value p1-medium">{quantity} unidades</span>
          </div>
          {discountPercent > 0 && (
            <div className="summary-row discount-row">
              <span className="summary-label p1">Descuento:</span>
              <span className="summary-value discount-value p1-medium">-{discountPercent.toFixed(1)}%</span>
            </div>
          )}
          <div className="summary-row total-row">
            <span className="summary-label p1-medium">Total:</span>
            <span className="summary-value total-value h2">{formatCLP(currentPrice)}</span>
          </div>
        </div>

        {/* Acciones */}
        <div className="calculator-actions">
          <button
            className="btn btn-secondary cta1"
            onClick={() => {
              const subject = `Cotización: ${product.name} (${product.sku}) – ${quantity} u.`
              const body = `Hola, quisiera una cotización de ${product.name} (${product.sku}).\nCantidad: ${quantity}\nPrecio unitario: ${formatCLP(unit)}\nTotal: ${formatCLP(currentPrice)}`
              window.location.href = `mailto:ventas@tuempresa.cl?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
            }}
          >
            <span className="material-icons">email</span>
            Solicitar cotización oficial
          </button>

          <button
            className="btn btn-primary cta1"
            onClick={() => {
              addItem({ product, quantity, unitPrice: unit })
              window.dispatchEvent(new CustomEvent('swag:toast', {
                detail: { message: `Agregado: ${quantity}× ${product.name}` }
              }))
            }}
            disabled={product.status !== 'active' || (product.stock ?? 0) <= 0}
          >
            <span className="material-icons">shopping_cart</span>
            Agregar al carrito
          </button>
        </div>

        {/* Info extra */}
        <div className="additional-info">
          <div className="info-item">
            <span className="material-icons">local_shipping</span>
            <div className="info-content">
              <span className="info-title l1">Envío gratis</span>
              <span className="info-detail l1">En pedidos sobre {formatCLP(50000)}</span>
            </div>
          </div>
          <div className="info-item">
            <span className="material-icons">schedule</span>
            <div className="info-content">
              <span className="info-title l1">Tiempo de producción</span>
              <span className="info-detail l1">7-10 días hábiles</span>
            </div>
          </div>
          <div className="info-item">
            <span className="material-icons">verified</span>
            <div className="info-content">
              <span className="info-title l1">Garantía</span>
              <span className="info-detail l1">30 días de garantía</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PricingCalculator
