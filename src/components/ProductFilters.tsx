import { categories } from '../data/products'
import './ProductFilters.css'

type SupplierStat = { id: string; name: string; count: number }

interface ProductFiltersProps {
  selectedCategory: string
  searchQuery: string
  sortBy: string
  suppliers: SupplierStat[]
  onCategoryChange: (category: string) => void
  onSearchChange: (search: string) => void
  onSortChange: (sort: string) => void
}

const ProductFilters = ({
  selectedCategory,
  searchQuery,
  sortBy,
  suppliers,
  onCategoryChange,
  onSearchChange,
  onSortChange
}: ProductFiltersProps) => {
  return (
    <div className="product-filters">
      <div className="filters-card">
        {/* Buscador */}
        <div className="search-section">
          <div className="search-box">
            <span className="material-icons">search</span>
            <input
              type="text"
              placeholder="Buscar productos, SKU..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input p1"
            />
            {searchQuery && (
              <button
                className="clear-search"
                onClick={() => onSearchChange('')}
              >
                <span className="material-icons">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Categorías */}
        <div className="filter-section">
          <h3 className="filter-title p1-medium">Categorías</h3>
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

        {/* Orden */}
        <div className="filter-section">
          <h3 className="filter-title p1-medium">Ordenar por</h3>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="sort-select p1"
          >
            <option value="name">Nombre A-Z</option>
            <option value="price">Precio</option>
            <option value="stock">Stock disponible</option>
          </select>
        </div>

        {/* Proveedores dinámicos */}
        <div className="filter-section">
          <h3 className="filter-title p1-medium">Proveedores</h3>
          <div className="supplier-list">
            {suppliers.length === 0 ? (
              <div className="supplier-item">
                <span className="supplier-name l1">Sin resultados</span>
                <span className="supplier-count l1">0</span>
              </div>
            ) : (
              suppliers.map(supplier => (
                <div key={supplier.id} className="supplier-item">
                  <span className="supplier-name l1">{supplier.name}</span>
                  <span className="supplier-count l1">{supplier.count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductFilters
