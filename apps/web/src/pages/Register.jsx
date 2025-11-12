import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register, login } from '../lib/api.js'
import { emitAuthChanged } from '../lib/auth.js'

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      // Registrar como CUSTOMER en backend (/auth/register)
      await register(name, email, password)
      // Autologin tras registro
      const { accessToken } = await login(email, password)
      localStorage.setItem('token', accessToken)
      emitAuthChanged()
      navigate('/')
    } catch (e) {
      setError(e.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="container py-8">
      <div className="max-w-md mx-auto card p-6">
        <h2 className="text-2xl font-semibold">Registrarse</h2>
        <p className="mt-2 text-neutral-600 text-sm">Crea tu cuenta de cliente.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm text-neutral-600">Nombre</label>
            <input className="input mt-1" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Tu nombre" />
          </div>
          <div>
            <label className="text-sm text-neutral-600">Correo</label>
            <input className="input mt-1" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <label className="text-sm text-neutral-600">Contraseña</label>
            <div className="relative mt-1">
              <input
                className="input pr-10"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-800 p-1"
                onClick={() => setShowPassword(s => !s)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-5.523 0-10-5-10-7 0-.725 1.18-2.688 3.35-4.35M6.5 6.5C8.5 5 10.5 4 12 4c5.523 0 10 5 10 7 0 .64-.843 2.312-2.5 3.9"/>
                    <path d="M3 3l18 18"/>
                    <path d="M9.9 9.9a3 3 0 1 0 4.2 4.2"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12Z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-neutral-600 mt-1">Mínimo 6 caracteres.</p>
          </div>
          {error && <p className="text-red-600">{error}</p>}
          <button className="btn w-full" disabled={loading || !name || !email || (password?.length||0) < 6}>
            {loading ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </section>
  )
}