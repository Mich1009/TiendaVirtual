import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
  const img = product.images && product.images[0] ? product.images[0].url : 'https://via.placeholder.com/600x400?text=Producto'
  return (
    <article className="card overflow-hidden">
      <Link to={`/products/${product.id}`} className="block">
        <img src={img} alt={product.name} className="w-full h-56 object-cover" />
      </Link>
      <div className="p-4">
        <h3 className="font-medium text-lg line-clamp-2">{product.name}</h3>
        <p className="mt-1 text-neutral-600">{product.category?.name || 'Categoría'}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-semibold text-lg">${Number(product.price).toFixed(2)}</span>
          <Link to={`/products/${product.id}`} className="btn">Ver</Link>
        </div>
      </div>
    </article>
  )
}