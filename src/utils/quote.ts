// src/utils/quote.ts
import type { Product } from '../types/Product'

const clp = (n: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

type QuoteOptions = {
  quantity: number
  unitPrice: number
  selectedColor?: string
  selectedSize?: string
  toEmail?: string          // opcional: correo de destino
  ccEmail?: string          // opcional: CC
}

export function buildQuoteMailto(product: Product, opts: QuoteOptions) {
  const {
    quantity,
    unitPrice,
    selectedColor,
    selectedSize,
    toEmail = 'ventas@tuempresa.cl',
    ccEmail,
  } = opts

  const total = unitPrice * quantity

  const subject = `Cotización: ${product.name} (${product.sku}) – ${quantity} u.`
  const lines: string[] = [
    `Hola, quisiera una cotización de:`,
    ``,
    `Producto: ${product.name}`,
    `SKU: ${product.sku}`,
    `Categoría: ${product.category}`,
    selectedColor ? `Color: ${selectedColor}` : undefined,
    selectedSize ? `Talla: ${selectedSize}` : undefined,
    `Cantidad: ${quantity} unidades`,
    `Precio unitario: ${clp(unitPrice)}`,
    `Total: ${clp(total)}`,
    ``,
    `¿Podrían indicar plazo de entrega y formas de pago?`,
    `Gracias.`
  ].filter(Boolean) as string[]

  const body = lines.join('\n')
  const params = new URLSearchParams({
    subject,
    body,
  })
  if (ccEmail) params.append('cc', ccEmail)

  return `mailto:${encodeURIComponent(toEmail)}?${params.toString()}`
}
