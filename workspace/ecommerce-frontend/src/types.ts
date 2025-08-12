export type Product = {
  id: number
  name: string
  description?: string
  price: number
  imageUrl?: string
  stock: number
}

export type CreateOrderItem = {
  productId: number
  quantity: number
}

export type CreateOrderRequest = {
  customerName: string
  customerEmail: string
  shippingAddress: string
  items: CreateOrderItem[]
}