import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const SupabaseService = {
  // Auth
  login(email, password) {
    return supabase.auth.signInWithPassword({ email, password })
      .then(({ data, error }) => {
        if (error) throw error
        return data
      })
  },

  logout() {
    return supabase.auth.signOut()
      .then(({ error }) => {
        if (error) throw error
      })
  },

  getUser() {
    return supabase.auth.getUser()
      .then(({ data: { user } }) => {
        return user
      })
  },

  // Products
  getProducts() {
    return supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) throw error
        return data
      })
  },

  getAllProducts() {
    return supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) throw error
        return data
      })
  },

  createProduct(product) {
    return supabase
      .from('products')
      .insert([product])
      .select()
      .then(({ data, error }) => {
        if (error) throw error
        return data[0]
      })
  },

  updateProduct(id, updates) {
    return supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .then(({ data, error }) => {
        if (error) throw error
        return data[0]
      })
  },

  deleteProduct(id) {
    return supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .then(({ data, error }) => {
        if (error) throw error
        return data[0]
      })
  },

  // Storage
  uploadProductImage(file) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `product-images/${fileName}`

    return supabase.storage
      .from('products')
      .upload(filePath, file)
      .then(({ error: uploadError }) => {
        if (uploadError) throw uploadError
        return supabase.storage
          .from('products')
          .getPublicUrl(filePath)
      })
      .then(({ data }) => {
        return data.publicUrl
      })
  },

  // Orders
  createOrder(order) {
    return supabase
      .from('orders')
      .insert([order])
      .select()
      .then(({ data, error }) => {
        if (error) throw error
        return data[0]
      })
  },

  getOrders() {
    return supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) throw error
        return data
      })
  },

  updateOrderStatus(id, status) {
    return supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .then(({ data, error }) => {
        if (error) throw error
        return data[0]
      })
  },

  // Order with Items (Multi-product checkout)
  async createOrderWithItems(order, items) {
    // Step 1: Create the order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([order])
      .select()

    if (orderError) throw orderError
    if (!orderData || orderData.length === 0) throw new Error('Order creation failed')

    const createdOrder = orderData[0]

    // Step 2: Insert order_items with the new order_id
    const itemsWithOrderId = items.map(item => ({
      ...item,
      order_id: createdOrder.id
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsWithOrderId)

    if (itemsError) {
      // Attempt cleanup: delete the orphaned order
      await supabase.from('orders').delete().eq('id', createdOrder.id)
      throw itemsError
    }

    return createdOrder
  },

  getOrderItems(orderId) {
    return supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) throw error
        return data
      })
  },

  getOrdersWithItems() {
    return supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) throw error
        return data
      })
  },

  // Real-time listeners
  subscribeToProducts(callback) {
    return supabase
      .channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, callback)
      .subscribe()
  },

  subscribeToOrders(callback) {
    return supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, callback)
      .subscribe()
  }
}
