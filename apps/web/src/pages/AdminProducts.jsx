import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getToken, getUser } from '../lib/auth'
import { getProductsAdmin, createProduct, updateProduct, deleteProduct, addProductImageUrl, getCategories, createCategory } from '../lib/api'

export default function AdminProducts() {
  const navigate = useNavigate()
  const [token, setTokenState] = useState(null)
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [page, setPage] = useState(1)
  const [limit] = useState(12)
  const [total, setTotal] = useState(0)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('created_desc')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editing, setEditing] = useState(null) // product or null
  const [form, setForm] = useState({ name: '', description: '', price: 0, stock: 0, active: true, categoryId: null, images: [] })
  const [imageUrl, setImageUrl] = useState('')
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCat, setNewCat] = useState({ name: '', description: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    const t = getToken()
    setTokenState(t)
    const u = getUser()
    if (!t || !u || u.role !== 'ADMIN') {
      navigate('/login?returnTo=/admin/products')
      return
    }
    (async () => {
      try {
        setLoading(true)
        setError('')
        const [prods, cats] = await Promise.all([
          getProductsAdmin({ page, limit, search: query, sort, category }),
          getCategories()
        ])
        const list = Array.isArray(prods.items) ? prods.items : Array.isArray(prods) ? prods : []
        setItems(list)
        setTotal(Number(prods.total || list.length || 0))
        setCategories(Array.isArray(cats) ? cats : [])
      } catch (e) {
        setError(e.message || 'Error al cargar productos')
      } finally { setLoading(false) }
    })()
  }, [navigate, page, limit, query, sort, category])

  function startCreate() {
    setEditing({ id: null })
    setForm({ name: '', description: '', price: 0, stock: 0, active: true, categoryId: null, images: [] })
  }

  function startEdit(p) {
    setEditing(p)
    setForm({
      name: p.name || '',
      description: p.description || '',
      price: Number(p.price || 0),
      stock: Number(p.stock || 0),
      active: Boolean(p.active),
      categoryId: p.category?.id || null,
      images: (p.images || []).map(img => ({ url: img.url, alt: img.alt || '' }))
    })
    setFieldErrors({})
  }

  function cancelEdit() {
    setEditing(null)
    setForm({ name: '', description: '', price: 0, stock: 0, active: true, categoryId: null, images: [] })
    setImageUrl('')
    setFieldErrors({})
  }

  function validate(current) {
    const errs = {}
    if (!current.name || !current.name.trim()) errs.name = 'El nombre es requerido'
    const priceVal = Number(current.price)
    if (Number.isNaN(priceVal) || priceVal < 0) errs.price = 'Precio debe ser 0 o mayor'
    const stockVal = Number(current.stock)
    if (Number.isNaN(stockVal) || stockVal < 0) errs.stock = 'Stock debe ser 0 o mayor'
    return errs
  }

  async function save() {
    try {
      setLoading(true); setError(''); setSuccess('')
      const errs = validate(form)
      if (Object.keys(errs).length) {
        setFieldErrors(errs)
        setError('Por favor corrige los campos marcados')
        return
      }
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        active: Boolean(form.active),
        categoryId: form.categoryId || null,
        images: form.images || []
      }
      if (editing?.id) {
        await updateProduct(token, editing.id, payload)
        setSuccess('Producto actualizado correctamente')
      } else {
        await createProduct(token, payload)
        setSuccess('Producto creado correctamente')
      }
      cancelEdit()
      const prods = await getProductsAdmin({ page, limit, search: query, sort, category })
      const list = Array.isArray(prods.items) ? prods.items : Array.isArray(prods) ? prods : []
      setItems(list)
      setTotal(Number(prods.total || list.length || 0))
    } catch (e) {
      setError(e.message || 'Error al guardar producto')
    } finally { setLoading(false) }
  }

  async function removeProduct(id) {
    if (!confirm('¿Eliminar producto?')) return
    try {
      setLoading(true); setError(''); setSuccess('')
      await deleteProduct(token, id)
      setSuccess('Producto eliminado')
      const prods = await getProductsAdmin({ page, limit, search: query, sort, category })
      const list = Array.isArray(prods.items) ? prods.items : Array.isArray(prods) ? prods : []
      setItems(list)
      setTotal(Number(prods.total || list.length || 0))
    } catch (e) {
      setError(e.message || 'Error al eliminar producto')
    } finally { setLoading(false) }
  }

  async function addImageByUrl() {
    if (!editing?.id || !imageUrl) return
    try {
      setLoading(true); setError(''); setSuccess('')
      await addProductImageUrl(token, editing.id, { url: imageUrl, alt: '' })
      const refreshed = await getProductsAdmin({ page, limit, search: query, sort, category })
      const list = Array.isArray(refreshed.items) ? refreshed.items : Array.isArray(refreshed) ? refreshed : []
      setItems(list)
      const updated = list.find(i => i.id === editing.id)
      if (updated) startEdit(updated)
      setImageUrl('')
      setImgError(false)
      setSuccess('Imagen agregada correctamente')
    } catch (e) {
      setError(e.message || 'Error al agregar imagen')
    } finally { setLoading(false) }
  }

  async function createCategoryInline() {
    try {
      setLoading(true); setError('')
      const created = await createCategory(token, { name: newCat.name, description: newCat.description })
      const cats = await getCategories()
      setCategories(Array.isArray(cats) ? cats : [])
      const createdId = created?.id || (Array.isArray(cats) ? cats.find(c => c.name === newCat.name)?.id : null)
      if (createdId) setForm(f => ({ ...f, categoryId: createdId }))
      setShowNewCategory(false)
      setNewCat({ name: '', description: '' })
    } catch (e) {
      setError(e.message || 'Error al crear categoría')
    } finally { setLoading(false) }
  }

  return (
    <section className="container py-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Panel Admin · Productos</h1>
          <p className="text-neutral-700 mt-1">Crear, editar y eliminar productos</p>
        </div>
        <button className="btn" onClick={startCreate}>Nuevo producto</button>
      </div>

      {success && <p className="mt-4 text-green-600">{success}</p>}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar…"
               className="md:col-span-2 border rounded px-3 py-2" />
        <select value={category} onChange={e => setCategory(e.target.value)} className="border rounded px-3 py-2">
          <option value="">Todas las categorías</option>
          {categories.map(c => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)} className="border rounded px-3 py-2">
          <option value="created_desc">Recientes</option>
          <option value="price_asc">Precio ↑</option>
          <option value="price_desc">Precio ↓</option>
        </select>
      </div>

      {error && <p className="mt-4 text-red-600">{error}</p>}
      {loading && <p className="mt-4">Cargando…</p>}

      {!loading && (
        items.length === 0 ? (
          <p className="mt-6">No hay productos.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4">
            {items.map(p => (
              <div key={p.id} className="card p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded overflow-hidden bg-neutral-100 flex items-center justify-center">
                    {p.images?.[0]?.url ? (
                      <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-neutral-400 text-sm">Sin foto</span>
                    )}
                  </div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-neutral-600">Stock {p.stock} · ${Number(p.price || 0).toFixed(2)}</p>
                  <p className="text-sm">{p.category?.name || 'Sin categoría'} · {p.active ? 'Activo' : 'Inactivo'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="btn" onClick={() => startEdit(p)}>Editar</button>
                  <button className="btn-outline" onClick={() => removeProduct(p.id)}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {!loading && total > limit && (
        <div className="mt-6 flex items-center gap-3">
          <button className="btn" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Anterior</button>
          <span className="text-sm text-neutral-700">Página {page}</span>
          <button className="btn" disabled={(page * limit) >= total} onClick={() => setPage(p => p + 1)}>Siguiente</button>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">{editing.id ? 'Editar producto' : 'Nuevo producto'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-sm text-neutral-700">Nombre</span>
                <input className="border rounded px-3 py-2" value={form.name} onChange={e => { setForm(f => ({...f, name: e.target.value})); setFieldErrors(prev => ({...prev, name: undefined})) }} />
                {fieldErrors.name && <span className="text-xs text-red-600">{fieldErrors.name}</span>}
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm text-neutral-700">Precio</span>
                <input type="number" className="border rounded px-3 py-2" value={form.price}
                       onChange={e => { setForm(f => ({...f, price: e.target.value})); setFieldErrors(prev => ({...prev, price: undefined})) }} />
                {fieldErrors.price && <span className="text-xs text-red-600">{fieldErrors.price}</span>}
              </label>
              <label className="flex flex-col gap-1 md:col-span-2">
                <span className="text-sm text-neutral-700">Descripción</span>
                <textarea className="border rounded px-3 py-2" rows={3} value={form.description}
                          onChange={e => setForm(f => ({...f, description: e.target.value}))} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm text-neutral-700">Stock</span>
                <input type="number" className="border rounded px-3 py-2" value={form.stock}
                       onChange={e => { setForm(f => ({...f, stock: e.target.value})); setFieldErrors(prev => ({...prev, stock: undefined})) }} />
                {fieldErrors.stock && <span className="text-xs text-red-600">{fieldErrors.stock}</span>}
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm text-neutral-700">Categoría</span>
                <select className="border rounded px-3 py-2" value={form.categoryId || ''}
                        onChange={e => setForm(f => ({...f, categoryId: e.target.value ? Number(e.target.value) : null}))}>
                  <option value="">Sin categoría</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button type="button" className="btn mt-2" onClick={() => setShowNewCategory(s => !s)}>
                  {showNewCategory ? 'Cerrar creación rápida' : 'Nueva categoría'}
                </button>
                {showNewCategory && (
                  <div className="mt-2 grid grid-cols-1 gap-2">
                    <input className="border rounded px-3 py-2" placeholder="Nombre"
                           value={newCat.name} onChange={e => setNewCat(n => ({...n, name: e.target.value}))} />
                    <textarea className="border rounded px-3 py-2" rows={2} placeholder="Descripción (opcional)"
                              value={newCat.description} onChange={e => setNewCat(n => ({...n, description: e.target.value}))} />
                    <button type="button" className="btn" disabled={!newCat.name.trim()} onClick={createCategoryInline}>Crear y seleccionar</button>
                  </div>
                )}
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.active}
                       onChange={e => setForm(f => ({...f, active: e.target.checked}))} />
                <span className="text-sm">Activo</span>
              </label>
            </div>

            <div className="mt-4">
              <h3 className="font-medium">Imágenes</h3>
              <div className="mt-2 flex items-center gap-2">
                <input className="border rounded px-3 py-2 flex-1" placeholder="URL de imagen" value={imageUrl}
                       onChange={e => { setImageUrl(e.target.value); setImgError(false); }} />
                <button className="btn" disabled={!editing.id || !imageUrl} onClick={addImageByUrl}>Agregar</button>
              </div>
              <div className="mt-2">
                <div className="w-28 h-28 rounded overflow-hidden bg-neutral-100 flex items-center justify-center">
                  {imageUrl && !imgError ? (
                    <img src={imageUrl} alt="Vista previa" className="w-full h-full object-cover" onError={() => setImgError(true)} onLoad={() => setImgError(false)} />
                  ) : (
                    <span className="text-neutral-400 text-sm">Vista previa</span>
                  )}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(form.images || []).map((img, idx) => (
                  <div key={idx} className="w-full h-20 bg-neutral-100 overflow-hidden rounded">
                    {img.url ? <img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover" /> : null}
                  </div>
                ))}
              </div>
              <div className="mt-2 text-sm text-neutral-600">También puedes guardar imágenes al crear/editar usando el campo lista "images".</div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button className="btn-outline" onClick={cancelEdit}>Cancelar</button>
              <button className="btn" onClick={save} disabled={Object.keys(validate(form)).length > 0 || loading}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}