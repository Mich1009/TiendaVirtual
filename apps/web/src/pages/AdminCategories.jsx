import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getToken, getUser } from '../lib/auth'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../lib/api'

export default function AdminCategories() {
  const navigate = useNavigate()
  const [token, setTokenState] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editing, setEditing] = useState(null) // category or null
  const [form, setForm] = useState({ name: '', description: '' })
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    const t = getToken()
    setTokenState(t)
    const u = getUser()
    if (!t || !u || u.role !== 'ADMIN') {
      navigate('/login?returnTo=/admin/categories')
      return
    }
    (async () => {
      try {
        setLoading(true)
        setError('')
        const cats = await getCategories()
        setItems(Array.isArray(cats) ? cats : [])
      } catch (e) {
        setError(e.message || 'Error al cargar categorías')
      } finally { setLoading(false) }
    })()
  }, [navigate])

  function startCreate() {
    setEditing({ id: null })
    setForm({ name: '', description: '' })
  }

  function startEdit(c) {
    setEditing(c)
    setForm({ name: c.name || '', description: c.description || '' })
    setFieldErrors({})
  }

  function cancelEdit() {
    setEditing(null)
    setForm({ name: '', description: '' })
    setFieldErrors({})
  }

  function validate(current) {
    const errs = {}
    if (!current.name || !current.name.trim()) errs.name = 'El nombre es requerido'
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
      const payload = { name: form.name, description: form.description }
      if (editing?.id) {
        await updateCategory(token, editing.id, payload)
        setSuccess('Categoría actualizada correctamente')
      } else {
        await createCategory(token, payload)
        setSuccess('Categoría creada correctamente')
      }
      cancelEdit()
      const refreshed = await getCategories()
      setItems(Array.isArray(refreshed) ? refreshed : [])
    } catch (e) {
      setError(e.message || 'Error al guardar categoría')
    } finally { setLoading(false) }
  }

  async function removeCategory(id) {
    if (!confirm('¿Eliminar categoría?')) return
    try {
      setLoading(true); setError(''); setSuccess('')
      await deleteCategory(token, id)
      setSuccess('Categoría eliminada')
      const refreshed = await getCategories()
      setItems(Array.isArray(refreshed) ? refreshed : [])
    } catch (e) {
      setError(e.message || 'Error al eliminar categoría')
    } finally { setLoading(false) }
  }

  return (
    <section className="container py-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Panel Admin · Categorías</h1>
          <p className="text-neutral-700 mt-1">Crear, editar y eliminar categorías</p>
        </div>
        <button className="btn" onClick={startCreate}>Nueva categoría</button>
      </div>

      {success && <p className="mt-4 text-green-600">{success}</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
      {loading && <p className="mt-4">Cargando…</p>}

      {!loading && (
        items.length === 0 ? (
          <p className="mt-6">No hay categorías.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4">
            {items.map(c => (
              <div key={c.id} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{c.name}</p>
                  {c.description && <p className="text-sm text-neutral-600">{c.description}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <button className="btn" onClick={() => startEdit(c)}>Editar</button>
                  <button className="btn-outline" onClick={() => removeCategory(c.id)}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6">
            <h2 className="text-xl font-semibold mb-4">{editing.id ? 'Editar categoría' : 'Nueva categoría'}</h2>
            <div className="grid grid-cols-1 gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-sm text-neutral-700">Nombre</span>
                <input className="border rounded px-3 py-2" value={form.name} onChange={e => { setForm(f => ({...f, name: e.target.value})); setFieldErrors(prev => ({...prev, name: undefined})) }} />
                {fieldErrors.name && <span className="text-xs text-red-600">{fieldErrors.name}</span>}
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm text-neutral-700">Descripción</span>
                <textarea className="border rounded px-3 py-2" rows={3} value={form.description}
                          onChange={e => setForm(f => ({...f, description: e.target.value}))} />
              </label>
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