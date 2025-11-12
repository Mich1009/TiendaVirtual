import { useEffect, useState } from 'react'
import { getProducts } from '../lib/api.js'
import ProductCard from '../components/ProductCard.jsx'
import Skeleton from '../components/Skeleton.jsx'

export default function Catalog() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const data = await getProducts()
        const list = Array.isArray(data) ? data : data.items || []
        setItems(list)
      } catch (e) {
        setError(e.message || 'Error al cargar productos')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const categories = Array.from(new Set(items.map(i => i.category?.name).filter(Boolean)))
  const filtered = items.filter(p => {
    const matchesQuery = query.trim() === '' || (p.name?.toLowerCase().includes(query.toLowerCase()) || p.description?.toLowerCase().includes(query.toLowerCase()))
    const matchesCategory = !category || p.category?.name === category
    return matchesQuery && matchesCategory
  })

  return (
    <section className="container py-8">
      <div className="flex items-end justify-between">
        <h2 className="text-2xl font-semibold">Productos</h2>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input className="input" placeholder="Buscar productos" value={query} onChange={(e)=>setQuery(e.target.value)} />
        <select className="input" value={category} onChange={(e)=>setCategory(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button className="btn" onClick={() => { setQuery(''); setCategory('') }}>Limpiar filtros</button>
      </div>
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {Array.from({length:6}).map((_,i)=> (
            <div key={i} className="card p-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-5 w-2/3 mt-4" />
              <Skeleton className="h-5 w-1/3 mt-2" />
            </div>
          ))}
        </div>
      )}
      {error && (
        <p className="mt-6 text-red-600">{error}</p>
      )}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filtered.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </section>
  )
}