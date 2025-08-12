import axios from 'axios'
import type { CreateOrderRequest, Product } from './types'

const api = axios.create({ baseURL: '/api' })

export const fetchProducts = async (): Promise<Product[]> => {
  const { data } = await api.get<Product[]>('/products')
  return data
}

export const fetchProduct = async (id: number): Promise<Product> => {
  const { data } = await api.get<Product>(`/products/${id}`)
  return data
}

export const createOrder = async (payload: CreateOrderRequest) => {
  const { data } = await api.post('/orders', payload)
  return data
}

export default api