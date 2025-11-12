import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getToken, getUser } from '../lib/auth'
import { getUsersAdmin, createUserAdmin, updateUserAdmin, deleteUserAdmin } from '../lib/api'

export default function AdminUsers() {
  const navigate = useNavigate()
  const [token, setTokenState] = useState(null)
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [limit] = useState(12)
  const [total, setTotal] = useState(0)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editing, setEditing] = useState(null) // user or null
  const [form, setForm] = useState({ name: '', email: '', role: 'CUSTOMER', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [showGenerated, setShowGenerated] = useState('')

  useEffect(() => {
    const t = getToken()
    setTokenState(t)
    const u = getUser()
    if (!t || !u || u.role !== 'ADMIN') {
      navigate('/login?returnTo=/admin/users')
      return
    }
    (async () => {
      try {
        setLoading(true)
        setError('')
        const data = await getUsersAdmin(t, { page, limit, search: query })
        const list = Array.isArray(data.items) ? data.items : []
        setItems(list)
        setTotal(Number(data.total || list.length))
      } catch (e) {
        setError(e.message || 'Error al cargar usuarios')
      } finally { setLoading(false) }
    })()
  }, [navigate, page, limit, query])

  function startCreate() {
    setEditing({ id: null })
    setForm({ name: '', email: '', role: 'CUSTOMER', password: '' })
    setFieldErrors({})
    setShowGenerated('')
  }

  function startEdit(u) {
    setEditing(u)
    setForm({ name: u.name || '', email: u.email || '', role: u.role || 'CUSTOMER', password: '' })
    setFieldErrors({})
    setShowGenerated('')
  }

  function validateForm() {
    const errs = {}
    if (!form.name || form.name.trim().length < 2) errs.name = 'Nombre requerido (mín 2)'
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Correo inválido'
    if (!['ADMIN','CUSTOMER'].includes(form.role)) errs.role = 'Rol inválido'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function save() {
    if (!validateForm()) return
    try {
      setLoading(true)
      setError('')
      setSuccess('')
      let resp
      if (!editing.id) {
        // Si no se envía password, se generará automáticamente en el servidor
        const payload = { name: form.name, email: form.email, role: form.role }
        if (form.password && form.password.length >= 6) payload.password = form.password
        resp = await createUserAdmin(token, payload)
      } else {
        const payload = { name: form.name, email: form.email, role: form.role }
        if (form.password && form.password.length >= 6) payload.password = form.password
        resp = await updateUserAdmin(token, editing.id, payload)
      }
      setSuccess(editing.id ? 'Usuario actualizado' : 'Usuario creado')
      if (resp && resp.generatedPassword) setShowGenerated(resp.generatedPassword)
      // recargar listado
      const data = await getUsersAdmin(token, { page, limit, search: query })
      setItems(Array.isArray(data.items) ? data.items : [])
      setTotal(Number(data.total || 0))
      setEditing(null)
    } catch (e) {
      setError(e.message || 'Error al guardar usuario')
    } finally { setLoading(false) }
  }

  async function remove(id) {
    if (!confirm('¿Eliminar este usuario?')) return
    try {
      setLoading(true)
      setError('')
      await deleteUserAdmin(token, id)
      setSuccess('Usuario eliminado')
      const data = await getUsersAdmin(token, { page, limit, search: query })
      setItems(Array.isArray(data.items) ? data.items : [])
      setTotal(Number(data.total || 0))
    } catch (e) {
      setError(e.message || 'Error al eliminar usuario')
    } finally { setLoading(false) }
  }

  const canSave = () => {
    if (!form.name || form.name.trim().length < 2) return false
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return false
    if (!['ADMIN','CUSTOMER'].includes(form.role)) return false
    if (form.password && form.password.length > 0 && form.password.length < 6) return false
    return true
  }

  return (
    <section className="container py-8">
      <div className="flex items-end justify-between">
        <h2 className="text-2xl font-semibold">Usuarios</h2>
        <button className="btn" onClick={startCreate}>Nuevo usuario</button>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input className="input" placeholder="Buscar por nombre/correo/rol" value={query} onChange={(e)=>setQuery(e.target.value)} />
        <div className="md:col-span-2 flex items-center justify-end">
          <span className="text-sm text-neutral-600">Total: {total}</span>
        </div>
      </div>

      {error && <p className="mt-4 text-red-600">{error}</p>}
      {success && <p className="mt-4 text-green-700">{success}</p>}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {items.map(u => (
          <div key={u.id} className="card p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{u.name}</p>
              <p className="text-neutral-600 text-sm">{u.email}</p>
              <span className="inline-block mt-1 text-xs bg-neutral-200 text-neutral-700 rounded px-2 py-0.5">{u.role}</span>
            </div>
            <div className="flex gap-2">
              <button className="btn" onClick={()=>startEdit(u)}>Editar</button>
              <button className="btn" onClick={()=>remove(u.id)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button className="btn" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Anterior</button>
        <span>Página {page}</span>
        <button className="btn" disabled={items.length < limit} onClick={()=>setPage(p=>p+1)}>Siguiente</button>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6">
            <h2 className="text-xl font-semibold mb-4">{editing.id ? 'Editar usuario' : 'Nuevo usuario'}</h2>
            {showGenerated && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800 text-sm">Contraseña generada:</p>
                <div className="mt-1 flex items-center gap-2">
                  <code className="px-2 py-1 bg-green-100 rounded text-green-900">{showGenerated}</code>
                  <button className="btn" onClick={() => { navigator.clipboard?.writeText(showGenerated) }}>Copiar</button>
                </div>
                <p className="text-xs text-green-700 mt-2">Guárdala y compártela con el usuario. No se volverá a mostrar.</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-sm text-neutral-700">Nombre</span>
                <input className="border rounded px-3 py-2" value={form.name} onChange={e => { setForm(f => ({...f, name: e.target.value})); setFieldErrors(prev => ({...prev, name: undefined})) }} />
                {fieldErrors.name && <span className="text-xs text-red-600">{fieldErrors.name}</span>}
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm text-neutral-700">Correo</span>
                <input className="border rounded px-3 py-2" type="email" value={form.email} onChange={e => { setForm(f => ({...f, email: e.target.value})); setFieldErrors(prev => ({...prev, email: undefined})) }} />
                {fieldErrors.email && <span className="text-xs text-red-600">{fieldErrors.email}</span>}
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm text-neutral-700">Rol</span>
                <select className="border rounded px-3 py-2" value={form.role} onChange={e => { setForm(f => ({...f, role: e.target.value})); setFieldErrors(prev => ({...prev, role: undefined})) }}>
                  <option value="CUSTOMER">Cliente</option>
                  <option value="ADMIN">Admin</option>
                </select>
                {fieldErrors.role && <span className="text-xs text-red-600">{fieldErrors.role}</span>}
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm text-neutral-700">Contraseña (opcional)</span>
                <input className="border rounded px-3 py-2" type="text" placeholder="Dejar vacío para generar"
                       value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} />
                <span className="text-xs text-neutral-600">Mínimo 6 caracteres; si se deja vacío, se generará automáticamente.</span>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button className="btn" onClick={() => setEditing(null)}>Cancelar</button>
              <button className="btn" disabled={!canSave()} onClick={save}>{editing.id ? 'Guardar cambios' : 'Crear usuario'}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}