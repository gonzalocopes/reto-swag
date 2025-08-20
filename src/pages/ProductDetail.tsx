// src/pages/ProductDetail.tsx
import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { products } from '../data/products'
import { Product } from '../types/Product'
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
    if (!id) return
    const found = products.find(p => p.id === Number(id)) || null
    setProduct(found)
    if (found?.colors?.length) setSelectedColor(found.colors[0])
    if (found?.sizes?.length) setSelectedSize(found.sizes[0])
    setQuantity(1)
  }, [id])

  // precio unitario según breaks y cantidad
  const unitPrice = useMemo(() => {
    if (!product) return 0
    if (!product.priceBreaks || product.priceBreaks.length === 0) return product.basePrice
    let price = product.basePrice
    for (const br of product.priceBreaks) {
      if (quantity >= br.minQty) price = br.price
    }
    return price
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

  const handleAddToCart = () => {
    if (!canAddToCart) return

    // ⬇️ Enviamos el AddItemInput que espera el contexto
    addItem({
      product,
      quantity,
      selectedColor: selectedColor || product.colors?.[0],
      selectedSize: selectedSize || product.sizes?.[0],
      unitPrice,
    })

    // dispara toast/animación
    window.dispatchEvent(
      new CustomEvent('cart:added', {
        detail: { qty: quantity, total: unitPrice * quantity },
      })
    )
  }

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
          {/* Product Images */}
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

          {/* Product Info */}
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
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="feature-item l1">
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

            {/* Quick Actions */}
            <div className="product-actions">
              <div className="quantity-selector">
                <label className="quantity-label l1">Cantidad:</label>
                <div className="quantity-controls">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="quantity-btn"
                  >
                    <span className="material-icons">remove</span>
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="quantity-input"
                    min="1"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="quantity-btn"
                  >
                    <span className="material-icons">add</span>
                  </button>
                </div>
              </div>

              <div className="action-buttons">
                <button
                  className={`btn btn-primary cta1 ${!canAddToCart ? 'disabled' : ''}`}
                  disabled={!canAddToCart}
                  onClick={handleAddToCart}
                >
                  <span className="material-icons">shopping_cart</span>
                  {canAddToCart ? 'Agregar al carrito' : 'No disponible'}
                </button>

                <button
                  className="btn btn-secondary cta1"
                  onClick={() => {
                    const subject = encodeURIComponent(`Cotización - ${product.name} (${product.sku})`)
                    const body = encodeURIComponent(
                      `Hola, quiero una cotización:\n\n` +
                      `Producto: ${product.name}\n` +
                      `SKU: ${product.sku}\n` +
                      `Cantidad: ${quantity}\n` +
                      (selectedColor ? `Color: ${selectedColor}\n` : '') +
                      (selectedSize ? `Talla: ${selectedSize}\n` : '') +
                      `Precio unitario estimado: $${unitPrice.toLocaleString('es-CL')}\n\n` +
                      `Gracias.`
                    )
                    window.location.href = `mailto:ventas@swag.cl?subject=${subject}&body=${body}`
                  }}
                >
                  <span className="material-icons">calculate</span>
                  Solicitar cotización
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Calculator */}
        <div className="pricing-section">
          <PricingCalculator product={product} />
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
