import { Link } from 'react-router-dom'
import type { Product } from '../types/Product'
import { buildQuoteMailto } from '../utils/quote'
import './ProductCard.css'

interface ProductCardProps {
  product: Product
}

const formatCLP = (n: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

const ProductCard = ({ product }: ProductCardProps) => {
  const getStatusBadge = (status: Product['status']) => {
    switch (status) {
      case 'active':
        return <span className="status-badge status-active l1">Disponible</span>
      case 'inactive':
        return <span className="status-badge status-inactive l1">No disponible</span>
      case 'pending':
        return <span className="status-badge status-pending l1">Pendiente</span>
      default:
        return null
    }
  }

  // Mejor tier para mostrar “desde X+”
  const bestTier = (() => {
    if (!product.priceBreaks || product.priceBreaks.length === 0) return null
    const sorted = [...product.priceBreaks].sort((a, b) => b.minQty - a.minQty)
    return sorted[0]
  })()

  const getStockStatus = (stock: number) => {
    if (stock === 0) return <span className="stock-status out-of-stock l1">Sin stock</span>
    if (stock < 10) return <span className="stock-status low-stock l1">Stock bajo ({stock})</span>
    return <span className="stock-status in-stock l1">{stock} disponibles</span>
  }

  // Cotizar directo desde la card (si no hay cantidad elegida, usamos 1 o el mínimo de mejor tier)
  const handleQuote = (e: React.MouseEvent) => {
    e.preventDefault()
    const quantity = bestTier?.minQty ?? 1
    const unitPrice = bestTier?.price ?? product.basePrice
    const link = buildQuoteMailto(product, { quantity, unitPrice })
    window.location.href = link
  }

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-link">
        {/* Imagen */}
        <div className="product-image">
          <div className="image-placeholder" aria-label={`Imagen de ${product.name}`}>
            <span className="material-icons">image</span>
          </div>
          <div className="product-status">{getStatusBadge(product.status)}</div>
        </div>

        {/* Info */}
        <div className="product-info">
          <div className="product-header">
            <h3 className="product-name p1-medium">{product.name}</h3>
            <p className="product-sku l1">SKU: {product.sku}</p>
          </div>

          <div className="product-details">
            <div className="product-category">
              <span className="material-icons">category</span>
              <span className="l1">{product.category}</span>
            </div>
            {getStockStatus(product.stock)}
          </div>

          {/* Features (máx 3) */}
          {product.features && product.features.length > 0 && (
            <div className="product-features">
              {product.features.slice(0, 3).map((feature, idx) => (
                <span key={idx} className="feature-tag l1">{feature}</span>
              ))}
              {product.features.length > 3 && (
                <span className="feature-tag l1">+{product.features.length - 3}</span>
              )}
            </div>
          )}

          {/* Colores */}
          {product.colors && product.colors.length > 0 && (
            <div className="product-colors">
              <span className="colors-label l1">{product.colors.length} colores:</span>
              <div className="colors-preview">
                {product.colors.slice(0, 3).map((color, idx) => (
                  <div key={idx} className="color-dot" title={color} />
                ))}
                {product.colors.length > 3 && (
                  <span className="more-colors l1">+{product.colors.length - 3}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </Link>

      {/* Footer */}
      <div className="product-footer">
        <div className="price-section">
          <div className="current-price p1-medium">{formatCLP(product.basePrice)}</div>
          {bestTier && (
            <div className="discount-info">
              <span className="discount-price l1">{formatCLP(bestTier.price)}</span>
              <span className="discount-label l1">desde {bestTier.minQty}+ unidades</span>
            </div>
          )}
        </div>

        <div className="card-actions">
          <button className="btn btn-secondary l1" onClick={handleQuote}>
            <span className="material-icons">calculate</span>
            Cotizar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
