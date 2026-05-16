import { supabase } from './SupabaseService'
import { CONFIG } from '../config/constants'

/**
 * Completely isolated service for Digital Products.
 * Does NOT modify or interact with the existing SupabaseService.
 */
export const DigitalProductService = {

  // ─── DIGITAL PRODUCTS ─────────────────────────────────────

  getDigitalProducts() {
    return supabase
      .from('digital_products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) throw error
        return data
      })
  },

  getAllDigitalProducts() {
    return supabase
      .from('digital_products')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) throw error
        return data
      })
  },

  createDigitalProduct(product) {
    return supabase
      .from('digital_products')
      .insert([product])
      .select()
      .then(({ data, error }) => {
        if (error) throw error
        return data[0]
      })
  },

  updateDigitalProduct(id, updates) {
    return supabase
      .from('digital_products')
      .update(updates)
      .eq('id', id)
      .select()
      .then(({ data, error }) => {
        if (error) throw error
        return data[0]
      })
  },

  deleteDigitalProduct(id) {
    return supabase
      .from('digital_products')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .then(({ data, error }) => {
        if (error) throw error
        return data[0]
      })
  },

  // ─── STORAGE ──────────────────────────────────────────────

  uploadPreviewImage(file) {
    const ext = file.name.split('.').pop()
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const path = `previews/${name}`

    return supabase.storage
      .from('digital-previews')
      .upload(path, file, { upsert: false })
      .then(({ error }) => {
        if (error) throw error
        return supabase.storage
          .from('digital-previews')
          .getPublicUrl(path)
      })
      .then(({ data }) => data.publicUrl)
  },

  uploadOriginalPdf(file) {
    const ext = file.name.split('.').pop()
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const path = `originals/${name}`

    return supabase.storage
      .from('digital-originals')
      .upload(path, file, { upsert: false })
      .then(({ error }) => {
        if (error) throw error
        return path // Return path only — NEVER a public URL
      })
  },

  // ─── DIGITAL ORDERS ───────────────────────────────────────

  async checkDuplicateTransaction(transactionId) {
    const { data, error } = await supabase
      .from('digital_orders')
      .select('id')
      .eq('transaction_id', transactionId)
      .limit(1)

    if (error) throw error
    return data && data.length > 0
  },

  async createDigitalOrder(order) {
    // 1. Check for duplicate transaction ID first
    const isDuplicate = await this.checkDuplicateTransaction(order.transaction_id)
    if (isDuplicate) {
      throw new Error('This Transaction ID has already been used. Please check and enter a valid, unique Transaction ID.')
    }

    // 2. Insert order with download enabled immediately
    const { data, error } = await supabase
      .from('digital_orders')
      .insert([{
        ...order,
        download_enabled: true,
        download_count: 0,
        download_limit: CONFIG.DIGITAL_DOWNLOAD_LIMIT,
        payment_status: 'self_confirmed'
      }])
      .select()

    if (error) {
      // Supabase unique constraint will also catch duplicates
      if (error.code === '23505') {
        throw new Error('This Transaction ID has already been used.')
      }
      throw error
    }

    return data[0]
  },

  getDigitalOrders() {
    return supabase
      .from('digital_orders')
      .select('*, digital_products(title, price, preview_image_url)')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) throw error
        return data
      })
  },

  getDigitalOrderByTxn(transactionId) {
    return supabase
      .from('digital_orders')
      .select('*, digital_products(title, original_pdf_path)')
      .eq('transaction_id', transactionId)
      .single()
      .then(({ data, error }) => {
        if (error) throw error
        return data
      })
  },

  // ─── DOWNLOADS (CRITICAL SECURITY) ────────────────────────

  async getDownloadUrl(pdfPath) {
    const { data, error } = await supabase.storage
      .from('digital-originals')
      .createSignedUrl(pdfPath, CONFIG.SIGNED_URL_EXPIRY)

    if (error) throw error
    return data.signedUrl
  },

  async processDownload(orderId) {
    // 1. Fetch order to check limits
    const { data: order, error: fetchErr } = await supabase
      .from('digital_orders')
      .select('*, digital_products(original_pdf_path, title)')
      .eq('id', orderId)
      .single()

    if (fetchErr) throw fetchErr
    if (!order) throw new Error('Order not found')

    // 2. Check download_enabled
    if (!order.download_enabled) {
      throw new Error('Download is not enabled for this order.')
    }

    // 3. Check download limit
    if (order.download_count >= order.download_limit) {
      throw new Error(`Download limit reached (${order.download_limit}/${order.download_limit}). Contact us via WhatsApp for assistance.`)
    }

    // 4. Generate signed URL
    const pdfPath = order.digital_products?.original_pdf_path
    if (!pdfPath) throw new Error('File not found. Contact support.')

    const signedUrl = await this.getDownloadUrl(pdfPath)

    // 5. Increment download count
    await supabase
      .from('digital_orders')
      .update({ download_count: order.download_count + 1 })
      .eq('id', orderId)

    // 6. Log the download
    await supabase
      .from('digital_download_logs')
      .insert([{
        digital_order_id: orderId,
        ip_address: 'client', // Client-side limitation
        user_agent: navigator.userAgent
      }])

    return {
      signedUrl,
      fileName: order.digital_products?.title || 'download',
      remainingDownloads: order.download_limit - order.download_count - 1
    }
  },

  // ─── ADMIN: DOWNLOAD LOGS ─────────────────────────────────

  getDownloadLogs(orderId) {
    return supabase
      .from('digital_download_logs')
      .select('*')
      .eq('digital_order_id', orderId)
      .order('downloaded_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) throw error
        return data
      })
  },

  // ─── REALTIME ─────────────────────────────────────────────

  subscribeToDigitalProducts(channelName, callback) {
    return supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'digital_products' }, callback)
      .subscribe()
  },

  subscribeToDigitalOrders(channelName, callback) {
    return supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'digital_orders' }, callback)
      .subscribe()
  }
}
