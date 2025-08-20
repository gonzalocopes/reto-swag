// src/components/Loader.tsx
import './Loader.css'

export default function Loader({ text = 'Cargando...' }: { text?: string }) {
  return (
    <div className="loader">
      <div className="spinner" aria-hidden="true" />
      <span className="loader-text l1">{text}</span>
    </div>
  )
}
