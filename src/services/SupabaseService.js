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
