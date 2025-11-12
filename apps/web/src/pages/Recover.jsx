import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { forgotPassword } from '../lib/api.js'

export default function Recover() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setGenerated('')
    try {
      const data = await forgotPassword(email)
      setGenerated(data.generatedPassword || '')
    } catch (e) {
      setError(e.message || 'Error al recuperar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="container py-8">
      <div className="max-w-md mx-auto card p-6">
        <h2 className="text-2xl font-semibold">Recuperar contraseña</h2>
        <p className="mt-2 text-neutral-600 text-sm">Ingresa tu correo para generar una contraseña temporal.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm text-neutral-600">Correo</label>
            <input className="input mt-1" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          {error && <p className="text-red-600">{error}</p>}
          <button className="btn w-full" disabled={loading || !email}>
            {loading ? 'Generando…' : 'Generar contraseña'}
          </button>
        </form>

        {generated && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-green-800 text-sm">Contraseña temporal generada:</p>
            <div className="mt-1 flex items-center gap-2">
              <code className="px-2 py-1 bg-green-100 rounded text-green-900">{generated}</code>
              <button className="btn" onClick={() => { navigator.clipboard?.writeText(generated) }}>Copiar</button>
            </div>
            <p className="text-xs text-green-700 mt-2">Usa esta contraseña para iniciar sesión y cámbiala desde tu panel o solicita al admin que la actualice.</p>
            <button className="btn mt-4 w-full" onClick={() => navigate('/login')}>Ir a iniciar sesión</button>
          </div>
        )}
      </div>
    </section>
  )
}