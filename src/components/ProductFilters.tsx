import { useMemo, useState } from 'react'
import { categories, suppliers } from '../data/products'
import './ProductFilters.css'

interface ProductFiltersProps {
  selectedCategory: string
  searchQuery: string
  sortBy: string
  selectedSupplier: string
  priceMin: string
  priceMax: string
  onCategoryChange: (category: string) => void
  onSearchChange: (search: string) => void
  onSortChange: (sort: string) => void
  onSupplierChange: (supplierId: string) => void
  onPriceMinChange: (v: string) => void
  onPriceMaxChange: (v: string) => void
  onClearAll: () => void
}

const ProductFilters = ({
  selectedCategory,
  searchQuery,
  sortBy,
  selectedSupplier,
  priceMin,
  priceMax,
  onCategoryChange,
  onSearchChange,
  onSortChange,
  onSupplierChange,
  onPriceMinChange,
  onPriceMaxChange,
  onClearAll
}: ProductFiltersProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const hasActiveFilters = useMemo(() => {
    return (
      (selectedCategory && selectedCategory !== 'all') ||
      !!searchQuery ||
      (selectedSupplier && selectedSupplier !== 'all') ||
      !!priceMin ||
      !!priceMax
    )
  }, [selectedCategory, searchQuery, selectedSupplier, priceMin, priceMax])

  return (
    <div className="product-filters">
      <div className="filters-card">
        {/* Search Bar */}
        <div className="search-section">
          <div className="search-box">
            <span className="material-icons">search</span>
            <input
              type="text"
              placeholder="Buscar productos, SKU..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input p1"
              aria-label="Buscar"
            />
            {searchQuery && (
              <button
                className="clear-search"
                onClick={() => onSearchChange('')}
                aria-label="Limpiar búsqueda"
                title="Limpiar búsqueda"
              >
                <span className="material-icons">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="filter-section">
          <div className="row-between">
            <h3 className="filter-title p1-medium">Categorías</h3>
            <button
              className="link-btn l1"
              onClick={() => setShowAdvanced(v => !v)}
              aria-expanded={showAdvanced}
            >
              {showAdvanced ? 'Ocultar avanzados' : 'Mostrar avanzados'}
            </button>
          </div>

          <div className="category-filters">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => onCategoryChange(category.id)}
              >
                <span className="material-icons">{category.icon}</span>
                <span className="category-name l1">{category.name}</span>
                <span className="category-count l1">({category.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="filter-section">
          <h3 className="filter-title p1-medium">Ordenar por</h3>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="sort-select p1"
          >
            <option value="name">Nombre A-Z</option>
            <option value="price">Precio (menor a mayor)</option>
            <option value="stock">Stock disponible</option>
          </select>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <>
            <div className="filter-section">
              <h3 className="filter-title p1-medium">Proveedor</h3>
              <div className="supplier-pills">
                <button
                  className={`supplier-pill ${selectedSupplier === 'all' ? 'active' : ''}`}
                  onClick={() => onSupplierChange('all')}
                >
                  Todos
                </button>
                {suppliers.map(s => (
                  <button
                    key={s.id}
                    className={`supplier-pill ${selectedSupplier === s.id ? 'active' : ''}`}
                    onClick={() => onSupplierChange(s.id)}
                  >
                    {s.name} <span className="pill-count">{s.products}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h3 className="filter-title p1-medium">Rango de precio (CLP)</h3>
              <div className="price-range">
                <div className="price-field">
                  <label className="l1" htmlFor="min">Mín.</label>
                  <input
                    id="min"
                    type="number"
                    className="price-input p1"
                    min={0}
                    value={priceMin}
                    onChange={(e) => onPriceMinChange(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <span className="l1">—</span>
                <div className="price-field">
                  <label className="l1" htmlFor="max">Máx.</label>
                  <input
                    id="max"
                    type="number"
                    className="price-input p1"
                    min={0}
                    value={priceMax}
                    onChange={(e) => onPriceMaxChange(e.target.value)}
                    placeholder="20000"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="filter-actions">
          <button className="btn btn-secondary cta1" onClick={onClearAll} disabled={!hasActiveFilters}>
            <span className="material-icons">filter_alt_off</span>
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductFilters
