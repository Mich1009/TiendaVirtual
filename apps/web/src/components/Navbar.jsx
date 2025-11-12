import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getUser, clearToken, emitAuthChanged } from '../lib/auth.js'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [count, setCount] = useState(0)
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const sync = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]')
        setCount(cart.reduce((s, i) => s + (i.qty || 0), 0))
      } catch { /* noop */ }
    }
    sync()
    const handler = () => sync()
    window.addEventListener('cart-updated', handler)
    return () => window.removeEventListener('cart-updated', handler)
  }, [])

  useEffect(() => {
    const syncUser = () => setUser(getUser())
    syncUser()
    const onAuth = () => syncUser()
    window.addEventListener('auth-changed', onAuth)
    window.addEventListener('storage', (e) => { if (e.key === 'token') syncUser() })
    return () => window.removeEventListener('auth-changed', onAuth)
  }, [])

  // Cerrar el menú de cuenta cuando cambiamos de ruta
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  function logout() {
    clearToken()
    emitAuthChanged()
    setMenuOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-neutral-200">
      <div className="container flex items-center justify-between h-16">
        <Link to={user?.role === 'ADMIN' ? '/admin' : '/'} className="font-semibold text-xl tracking-tight">Tienda<span className="text-brand">Virtual</span></Link>
        <nav className="flex gap-6 items-center">
          {user?.role === 'ADMIN' ? (
            <>
              <NavLink to="/admin" className={({isActive}) => isActive ? 'link font-medium' : 'link'}>Órdenes</NavLink>
              <NavLink to="/admin/products" className={({isActive}) => isActive ? 'link font-medium' : 'link'}>Productos</NavLink>
              <NavLink to="/admin/categories" className={({isActive}) => isActive ? 'link font-medium' : 'link'}>Categorías</NavLink>
              <NavLink to="/admin/users" className={({isActive}) => isActive ? 'link font-medium' : 'link'}>Usuarios</NavLink>
              <button className="link font-medium" onClick={logout}>Cerrar sesión</button>
            </>
          ) : (
            <>
              <NavLink to="/" onClick={() => setMenuOpen(false)} className={({isActive}) => isActive ? 'link font-medium' : 'link'}>Productos</NavLink>
              {user?.role === 'CUSTOMER' && (
                <NavLink to="/orders" onClick={() => setMenuOpen(false)} className={({isActive}) => isActive ? 'link font-medium' : 'link'}>Mis pedidos</NavLink>
              )}
              <NavLink to="/cart" onClick={() => setMenuOpen(false)} className={({isActive}) => isActive ? 'link font-medium relative' : 'link relative'}>
                Carrito
                {count > 0 && (
                  <span className="absolute -top-3 -right-5 bg-brand text-white text-xs rounded-full px-2 py-0.5">{count}</span>
                )}
              </NavLink>
              {!user ? (
                <>
                  <NavLink to="/login" onClick={() => setMenuOpen(false)} className={({isActive}) => isActive ? 'link font-medium' : 'link'}>
                    Iniciar sesión
                  </NavLink>
                  <NavLink to="/register" onClick={() => setMenuOpen(false)} className={({isActive}) => isActive ? 'link font-medium' : 'link'}>
                    Registrarse
                  </NavLink>
                </>
              ) : (
                <div className="relative">
                  <button className="link font-medium flex items-center gap-2" onClick={() => setMenuOpen(o => !o)}>
                    Mi cuenta
                    <span className="text-xs bg-neutral-200 text-neutral-700 rounded px-2 py-0.5">
                      {user.role === 'ADMIN' ? 'Admin' : 'Cliente'}
                    </span>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-white border border-neutral-200 rounded-md shadow-lg p-2">
                      {user.role === 'CUSTOMER' && (
                        <Link to="/orders" className="block px-2 py-2 hover:bg-neutral-100 rounded" onClick={() => setMenuOpen(false)}>Mis pedidos</Link>
                      )}
                      <Link to="/account" className="block px-2 py-2 hover:bg-neutral-100 rounded" onClick={() => setMenuOpen(false)}>Configuración</Link>
                      <button className="block w-full text-left px-2 py-2 hover:bg-neutral-100 rounded" onClick={logout}>Cerrar sesión</button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  )
}