// src/components/QuotationForm.tsx
import { useMemo, useState } from 'react'
import { Product } from '../types/Product'
import './QuotationForm.css'

const formatCLP = (n: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n || 0)

function bestUnitPrice(product: Product, qty: number) {
  if (!product.priceBreaks?.length) return product.basePrice
  let price = product.basePrice
  for (const br of product.priceBreaks) {
    if (qty >= br.minQty) price = br.price
  }
  return price
}

export default function QuotationForm({ product }: { product: Product }) {
  const [company, setCompany] = useState('')
  const [contact, setContact] = useState('')
  const [rut, setRut] = useState('')
  const [qty, setQty] = useState(10)
  const [notes, setNotes] = useState('')

  const unitPrice = useMemo(() => bestUnitPrice(product, qty), [product, qty])
  const total = unitPrice * qty

  const disabled = !company || !contact || qty < 1

  const handleDownload = () => {
    const lines = [
      '--- COTIZACIÓN ---',
      `Empresa/Nombre: ${company}`,
      `Contacto: ${contact}`,
      `RUT/DNI: ${rut}`,
      '',
      `Producto: ${product.name} (${product.sku})`,
      `Cantidad: ${qty}`,
      `Precio unitario: ${formatCLP(unitPrice)}`,
      `Total: ${formatCLP(total)}`,
      '',
      `Notas: ${notes || '-'}`,
      '-------------------'
    ].join('\n')

    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cotizacion_${product.sku}_${qty}u.txt`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const handleEmail = () => {
    const subject = `Cotización ${product.name} x${qty} (${formatCLP(total)})`
    const body = [
      `Hola, solicito cotización de:`,
      `- Producto: ${product.name} (${product.sku})`,
      `- Cantidad: ${qty}`,
      `- Precio unitario: ${formatCLP(unitPrice)}`,
      `- Total: ${formatCLP(total)}`,
      ``,
      `Datos:`,
      `- Empresa/Nombre: ${company}`,
      `- RUT/DNI: ${rut}`,
      `- Contacto: ${contact}`,
      ``,
      `Notas: ${notes || '-'}`,
    ].join('\n')

    window.location.href =
      `mailto:ventas@tuempresa.cl?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <div className="quotation card">
      <div className="quotation-header">
        <h3 className="p1-medium">Simulador de Cotización</h3>
        <p className="l1">Genera una cotización rápida con tus datos.</p>
      </div>

      <div className="quotation-grid">
        <div className="form-group">
          <label className="form-label">Empresa / Nombre</label>
          <input
            className="form-input"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Acme SpA"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email / Teléfono</label>
          <input
            className="form-input"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="contacto@acme.cl"
          />
        </div>

        <div className="form-group">
          <label className="form-label">RUT / DNI</label>
          <input
            className="form-input"
            value={rut}
            onChange={(e) => setRut(e.target.value)}
            placeholder="12.345.678-9"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Cantidad</label>
          <input
            type="number"
            min={1}
            className="form-input"
            value={qty}
            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
          />
        </div>

        <div className="form-group full">
          <label className="form-label">Notas</label>
          <textarea
            className="form-input"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Detalles de impresión, plazos, dirección, etc."
          />
        </div>
      </div>

      <div className="quotation-summary">
        <div className="row">
          <span className="l1">Precio unitario</span>
          <span className="p1-medium">{formatCLP(unitPrice)}</span>
        </div>
        <div className="row">
          <span className="l1">Cantidad</span>
          <span className="p1-medium">{qty} u.</span>
        </div>
        <div className="row total">
          <span className="p1-medium">Total</span>
          <span className="h2">{formatCLP(total)}</span>
        </div>
      </div>

      <div className="quotation-actions">
        <button className="btn btn-secondary cta1" onClick={handleDownload} disabled={disabled}>
          <span className="material-icons">download</span>
          Descargar resumen
        </button>
        <button className="btn btn-primary cta1" onClick={handleEmail} disabled={disabled}>
          <span className="material-icons">email</span>
          Enviar por email
        </button>
      </div>
    </div>
  )
}
