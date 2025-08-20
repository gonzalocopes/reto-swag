// ... (imports iguales)
import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { products } from '../data/products'
import type { Product } from '../types/Product'
import PricingCalculator from '../components/PricingCalculator'
import { useCart } from '../context/CartContext'
import './ProductDetail.css'

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const { addItem } = useCart()

  useEffect(() => {
    if (id) {
      const foundProduct = products.find(p => p.id === parseInt(id))
      setProduct(foundProduct || null)
      if (foundProduct?.colors?.length) setSelectedColor(foundProduct.colors[0])
      if (foundProduct?.sizes?.length) setSelectedSize(foundProduct.sizes[0])
    }
  }, [id])

  const unitPrice = useMemo(() => {
    if (!product) return 0
    if (!product.priceBreaks?.length) return product.basePrice
    const sorted = [...product.priceBreaks].sort((a, b) => a.minQty - b.minQty)
    let last = sorted[0]
    for (const br of sorted) {
      if (quantity >= br.minQty) last = br
      else break
    }
    return last.price
  }, [product, quantity])

  if (!product) {
    return (
      <div className="container">
        <div className="product-not-found">
          <span className="material-icons">error_outline</span>
          <h2 className="h2">Producto no encontrado</h2>
          <p className="p1">El producto que buscas no existe o ha sido eliminado.</p>
          <Link to="/" className="btn btn-primary cta1">
            <span className="material-icons">arrow_back</span>
            Volver al catálogo
          </Link>
        </div>
      </div>
    )
  }

  const canAddToCart = product.status === 'active' && product.stock > 0

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/" className="breadcrumb-link l1">Catálogo</Link>
          <span className="breadcrumb-separator l1">/</span>
          <span className="breadcrumb-current l1">{product.name}</span>
        </nav>

        <div className="product-detail">
          {/* Imágenes ... (igual que antes) */}
          <div className="product-images">
            <div className="main-image">
              <div className="image-placeholder">
                <span className="material-icons">image</span>
              </div>
            </div>
            <div className="image-thumbnails">
              {[1, 2, 3].map(i => (
                <div key={i} className="thumbnail">
                  <span className="material-icons">image</span>
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="product-details">
            <div className="product-header">
              <h1 className="product-title h2">{product.name}</h1>
              <p className="product-sku p1">SKU: {product.sku}</p>
              <div className="product-status">
                {product.status === 'active' ? (
                  <span className="status-badge status-active l1">✓ Disponible</span>
                ) : product.status === 'pending' ? (
                  <span className="status-badge status-pending l1">⏳ Pendiente</span>
                ) : (
                  <span className="status-badge status-inactive l1">❌ No disponible</span>
                )}
              </div>
            </div>

            {product.description && (
              <div className="product-description">
                <h3 className="p1-medium">Descripción</h3>
                <p className="p1">{product.description}</p>
              </div>
            )}

            {product.features?.length ? (
              <div className="product-features">
                <h3 className="p1-medium">Características</h3>
                <ul className="features-list">
                  {product.features.map((feature, index) => (
                    <li key={index} className="feature-item l1">
                      <span className="material-icons">check_circle</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {product.colors?.length ? (
              <div className="selection-group">
                <h3 className="selection-title p1-medium">Colores disponibles</h3>
                <div className="color-options">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                      onClick={() => setSelectedColor(color)}
                    >
                      <div className="color-preview"></div>
                      <span className="l1">{color}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {product.sizes?.length ? (
              <div className="selection-group">
                <h3 className="selection-title p1-medium">Tallas disponibles</h3>
                <div className="size-options">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      <span className="l1">{size}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Acciones rápidas */}
            <div className="product-actions">
              <div className="quantity-selector">
                <label className="quantity-label l1">Cantidad:</label>
                <div className="quantity-controls">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="quantity-btn">
                    <span className="material-icons">remove</span>
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="quantity-input"
                    min="1"
                  />
                  <button onClick={() => setQuantity(quantity + 1)} className="quantity-btn">
                    <span className="material-icons">add</span>
                  </button>
                </div>
              </div>

              <div className="action-buttons">
                <button
                  className={`btn btn-primary cta1 ${!canAddToCart ? 'disabled' : ''}`}
                  disabled={!canAddToCart}
                  onClick={() => {
                    addItem({
                      product,
                      quantity,
                      selectedColor: selectedColor || undefined,
                      selectedSize: selectedSize || undefined,
                      unitPrice: unitPrice || product.basePrice,
                    })
                    window.dispatchEvent(new CustomEvent('swag:toast', {
                      detail: { message: `Agregado: ${quantity}× ${product.name}` }
                    }))
                  }}
                >
                  <span className="material-icons">shopping_cart</span>
                  {canAddToCart ? 'Agregar al carrito' : 'No disponible'}
                </button>

                <button
                  className="btn btn-secondary cta1"
                  onClick={() => {
                    const subject = `Cotización: ${product.name} (${product.sku}) – ${quantity} u.`
                    const total = (unitPrice || product.basePrice) * quantity
                    const body =
                      `Hola, quisiera una cotización de:\n\n` +
                      `Producto: ${product.name}\nSKU: ${product.sku}\n` +
                      (selectedColor ? `Color: ${selectedColor}\n` : '') +
                      (selectedSize ? `Talla: ${selectedSize}\n` : '') +
                      `Cantidad: ${quantity}\nPrecio unitario: ${unitPrice || product.basePrice}\nTotal: ${total}\n\nGracias.`
                    window.location.href =
                      `mailto:ventas@tuempresa.cl?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
                  }}
                >
                  <span className="material-icons">calculate</span>
                  Solicitar cotización
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Calculadora */}
        <div className="pricing-section">
          <PricingCalculator product={product} />
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
