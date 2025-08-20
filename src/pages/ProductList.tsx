import { useState, useMemo } from 'react'
import ProductCard from '../components/ProductCard'
import ProductFilters from '../components/ProductFilters'
import { products as allProducts, suppliers as allSuppliers } from '../data/products'
import type { Product } from '../types/Product'
import './ProductList.css'

type SupplierStat = { id: string; name: string; count: number }

const ProductList = () => {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(allProducts)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('name')

  const filterProducts = (category: string, search: string, sort: string) => {
    let filtered = [...allProducts]

    if (category !== 'all') {
      filtered = filtered.filter(p => p.category === category)
    }

    // búsqueda: nombre + SKU (case-insensitive, trim)
    if (search) {
      const q = search.trim().toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
      )
    }

    switch (sort) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'price':
        filtered.sort((a, b) => (a.basePrice || 0) - (b.basePrice || 0))
        break
      case 'stock':
        filtered.sort((a, b) => (b.stock || 0) - (a.stock || 0))
        break
      default:
        break
    }

    setFilteredProducts(filtered)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    filterProducts(category, searchQuery, sortBy)
  }

  const handleSearchChange = (search: string) => {
    setSearchQuery(search)
    filterProducts(selectedCategory, search, sortBy)
  }

  const handleSortChange = (sort: string) => {
    setSortBy(sort)
    filterProducts(selectedCategory, searchQuery, sort)
  }

  // proveedores dinámicos según la lista filtrada actual
  const supplierStats: SupplierStat[] = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of filteredProducts) {
      counts.set(p.supplier, (counts.get(p.supplier) || 0) + 1)
    }
    // aseguramos que aparezcan con su nombre
    return allSuppliers
      .map(s => ({ id: s.id, name: s.name, count: counts.get(s.id) || 0 }))
      .filter(s => s.count > 0)
      .sort((a, b) => b.count - a.count)
  }, [filteredProducts])

  return (
    <div className="product-list-page">
      <div className="container">
        {/* Encabezado */}
        <div className="page-header">
          <div className="page-info">
            <h1 className="page-title h2">Catálogo de Productos</h1>
            <p className="page-subtitle p1">
              Descubre nuestra selección de productos promocionales premium
            </p>
          </div>

          <div className="page-stats">
            <div className="stat-item">
              <span className="stat-value p1-medium">{filteredProducts.length}</span>
              <span className="stat-label l1">productos</span>
            </div>
            <div className="stat-item">
              <span className="stat-value p1-medium">{supplierStats.length}</span>
              <span className="stat-label l1">proveedores</span>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <ProductFilters
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          sortBy={sortBy}
          suppliers={supplierStats}
          onCategoryChange={handleCategoryChange}
          onSearchChange={handleSearchChange}
          onSortChange={handleSortChange}
        />

        {/* Grid de productos */}
        <div className="products-section">
          {filteredProducts.length === 0 ? (
            <div className="empty-state">
              <span className="material-icons">search_off</span>
              <h3 className="h2">No hay productos</h3>
              <p className="p1">No se encontraron productos que coincidan con tu búsqueda.</p>
              <button
                className="btn btn-primary cta1"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                  filterProducts('all', '', sortBy)
                }}
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
