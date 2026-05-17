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

  // ─── REALTIME ─────────────────────────────────────────────

  subscribeToDigitalProducts(channelName, callback) {
    return supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'digital_products' }, callback)
      .subscribe()
  }
}
