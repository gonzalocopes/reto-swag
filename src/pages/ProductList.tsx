import { useEffect, useMemo, useState } from 'react'
import ProductCard from '../components/ProductCard'
import ProductFilters from '../components/ProductFilters'
import { products as allProducts } from '../data/products'
import { Product } from '../types/Product'
import Loader from '../components/Loader'
import './ProductList.css'

const normalize = (s: string) =>
  (s || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')

const ProductList = () => {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSupplier, setSelectedSupplier] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [priceMin, setPriceMin] = useState<string>('') // guardamos como string para inputs controlados
  const [priceMax, setPriceMax] = useState<string>('')
  const [sortBy, setSortBy] = useState('name')
  const [isLoading, setIsLoading] = useState(true)

  // Simula carga inicial
  useEffect(() => {
    const t = setTimeout(() => {
      setFilteredProducts(allProducts)
      setIsLoading(false)
    }, 350)
    return () => clearTimeout(t)
  }, [])

  // Recalcula con “loader” suave
  const applyFilters = (opts?: {
    category?: string; supplier?: string; search?: string; min?: string; max?: string; sort?: string
  }) => {
    const category = opts?.category ?? selectedCategory
    const supplier = opts?.supplier ?? selectedSupplier
    const search = opts?.search ?? searchQuery
    const min = opts?.min ?? priceMin
    const max = opts?.max ?? priceMax
    const sort = opts?.sort ?? sortBy

    setIsLoading(true)
    setTimeout(() => {
      let filtered = [...allProducts]

      // categoría
      if (category !== 'all') {
        filtered = filtered.filter(p => p.category === category)
      }

      // proveedor
      if (supplier !== 'all') {
        filtered = filtered.filter(p => p.supplier === supplier)
      }

      // búsqueda (case/accents insensitive)
      if (search) {
        const q = normalize(search)
        filtered = filtered.filter(p =>
          normalize(p.name).includes(q) ||
          normalize(p.sku).includes(q)
        )
      }

      // rango de precios
      const minNum = min ? Number(min) : null
      const maxNum = max ? Number(max) : null
      if (minNum !== null) filtered = filtered.filter(p => p.basePrice >= minNum!)
      if (maxNum !== null) filtered = filtered.filter(p => p.basePrice <= maxNum!)

      // ordenamiento
      switch (sort) {
        case 'name':
          filtered.sort((a, b) => a.name.localeCompare(b.name, 'es'))
          break
        case 'price':
          filtered.sort((a, b) => a.basePrice - b.basePrice)
          break
        case 'stock':
          filtered.sort((a, b) => b.stock - a.stock)
          break
      }

      setFilteredProducts(filtered)
      setIsLoading(false)
    }, 250)
  }

  // Handlers conectados al filtro
  const handleCategoryChange = (category: string) => { setSelectedCategory(category); applyFilters({ category }) }
  const handleSupplierChange = (supplier: string) => { setSelectedSupplier(supplier); applyFilters({ supplier }) }
  const handleSearchChange = (search: string) => { setSearchQuery(search); applyFilters({ search }) }
  const handlePriceMinChange = (v: string) => { setPriceMin(v); applyFilters({ min: v }) }
  const handlePriceMaxChange = (v: string) => { setPriceMax(v); applyFilters({ max: v }) }
  const handleSortChange = (sort: string) => { setSortBy(sort); applyFilters({ sort }) }

  const handleClearAll = () => {
    setSelectedCategory('all')
    setSelectedSupplier('all')
    setSearchQuery('')
    setPriceMin('')
    setPriceMax('')
    setSortBy('name')
    applyFilters({ category: 'all', supplier: 'all', search: '', min: '', max: '', sort: 'name' })
  }

  const stats = useMemo(() => ({
    total: filteredProducts.length,
    categories: new Set(allProducts.map(p => p.category)).size
  }), [filteredProducts])

  return (
    <div className="product-list-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-info">
            <h1 className="page-title h2">Catálogo de Productos</h1>
            <p className="page-subtitle p1">
              Descubre nuestra selección de productos promocionales premium
            </p>
          </div>

          <div className="page-stats">
            <div className="stat-item">
              <span className="stat-value p1-medium">{stats.total}</span>
              <span className="stat-label l1">productos</span>
            </div>
            <div className="stat-item">
              <span className="stat-value p1-medium">{stats.categories}</span>
              <span className="stat-label l1">categorías</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <ProductFilters
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          sortBy={sortBy}
          selectedSupplier={selectedSupplier}
          priceMin={priceMin}
          priceMax={priceMax}
          onCategoryChange={handleCategoryChange}
          onSearchChange={handleSearchChange}
          onSortChange={handleSortChange}
          onSupplierChange={handleSupplierChange}
          onPriceMinChange={handlePriceMinChange}
          onPriceMaxChange={handlePriceMaxChange}
          onClearAll={handleClearAll}
        />

        {/* Products Grid */}
        <div className="products-section">
          {isLoading ? (
            <div className="empty-state">
              <Loader text="Filtrando productos..." />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <span className="material-icons">search_off</span>
              <h3 className="h2">No hay productos</h3>
              <p className="p1">No se encontraron productos que coincidan con tu búsqueda.</p>
              <button
                className="btn btn-primary cta1"
                onClick={handleClearAll}
              >
                Ver todos los productos
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductList
