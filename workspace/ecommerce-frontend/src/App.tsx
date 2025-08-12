import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Link, Route, Routes, useNavigate } from 'react-router-dom'
import { createOrder, fetchProducts } from './api'
import type { CreateOrderRequest, Product } from './types'
import './App.css'

function ProductList({ addToCart }: { addToCart: (p: Product) => void }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((e) => setError(e?.message ?? 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading products...</p>
  if (error) return <p role="alert">{error}</p>

  return (
    <div className="grid">
      {products.map((p) => (
        <div className="card" key={p.id}>
          {p.imageUrl && <img src={p.imageUrl} alt={p.name} />}
          <h3>{p.name}</h3>
          <p className="price">${p.price.toFixed(2)}</p>
          <p className="stock">In stock: {p.stock}</p>
          <button onClick={() => addToCart(p)} disabled={p.stock <= 0}>Add to Cart</button>
        </div>
      ))}
    </div>
  )
}

function CartPage({
  cart,
  remove,
  clear,
}: {
  cart: Record<number, { product: Product; quantity: number }>
  remove: (id: number) => void
  clear: () => void
}) {
  const navigate = useNavigate()
  const items = Object.values(cart)
  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [items]
  )

  const [form, setForm] = useState({ name: '', email: '', address: '' })
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    if (!items.length) return
    setPlacing(true)
    setError(null)
    const payload: CreateOrderRequest = {
      customerName: form.name,
      customerEmail: form.email,
      shippingAddress: form.address,
      items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
    }
    try {
      await createOrder(payload)
      clear()
      navigate('/')
      alert('Order placed!')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Order failed')
    } finally {
      setPlacing(false)
    }
  }

  if (!items.length) return <p>Your cart is empty.</p>

  return (
    <div>
      <h2>Cart</h2>
      <ul>
        {items.map((i) => (
          <li key={i.product.id}>
            {i.product.name} × {i.quantity} = ${(i.product.price * i.quantity).toFixed(2)}{' '}
            <button onClick={() => remove(i.product.id)}>Remove</button>
          </li>
        ))}
      </ul>
      <p className="total">Total: ${total.toFixed(2)}</p>

      <h3>Checkout</h3>
      <div className="form">
        <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <textarea placeholder="Shipping address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        {error && <p role="alert">{error}</p>}
        <button disabled={placing} onClick={submit}>
          {placing ? 'Placing...' : 'Place Order'}
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const [cart, setCart] = useState<Record<number, { product: Product; quantity: number }>>({})

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev[product.id]
      const quantity = (existing?.quantity ?? 0) + 1
      return { ...prev, [product.id]: { product, quantity } }
    })
  }
  const removeFromCart = (id: number) => {
    setCart((prev) => {
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
  }
  const clear = () => setCart({})

  return (
    <BrowserRouter>
      <header className="header">
        <Link to="/">MyStore</Link>
        <nav>
          <Link to="/">Products</Link>
          <Link to="/cart">Cart ({Object.keys(cart).length})</Link>
        </nav>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<ProductList addToCart={addToCart} />} />
          <Route path="/cart" element={<CartPage cart={cart} remove={removeFromCart} clear={clear} />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
