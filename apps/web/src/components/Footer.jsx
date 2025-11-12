export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="container py-8 text-sm text-neutral-600 flex items-center justify-between">
        <p>© {new Date().getFullYear()} TiendaVirtual. Todos los derechos reservados.</p>
        <p className="hidden sm:block">Diseño minimalista inspirado en Saga Falabella.</p>
      </div>
    </footer>
  )
}