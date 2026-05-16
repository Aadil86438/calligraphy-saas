import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'nafzzCart'

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref([])

  // Hydrate from localStorage on init
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        items.value = parsed
      }
    }
  } catch {
    // Corrupted storage — start fresh
    localStorage.removeItem(STORAGE_KEY)
  }

  // Persist on every change
  watch(items, (val) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    } catch {
      // Storage full or unavailable — silent fail for persistence
    }
  }, { deep: true })

  // Getters
  const cartCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  const cartTotal = computed(() =>
    items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  )

  const isEmpty = computed(() => items.value.length === 0)

  // Actions
  function addToCart(product) {
    const existing = items.value.find(item => item.product_id === product.id)
    if (existing) {
      existing.quantity += 1
    } else {
      items.value.push({
        product_id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image_url: product.image_url,
        quantity: 1
      })
    }
  }

  function removeFromCart(productId) {
    const index = items.value.findIndex(item => item.product_id === productId)
    if (index !== -1) {
      items.value.splice(index, 1)
    }
  }

  function increaseQuantity(productId) {
    const item = items.value.find(item => item.product_id === productId)
    if (item) {
      item.quantity += 1
    }
  }

  function decreaseQuantity(productId) {
    const item = items.value.find(item => item.product_id === productId)
    if (item) {
      if (item.quantity <= 1) {
        removeFromCart(productId)
      } else {
        item.quantity -= 1
      }
    }
  }

  function clearCart() {
    items.value = []
  }

  /**
   * Remove products from cart that are no longer active.
   * Call this when products are re-fetched to ensure cart integrity.
   * @param {Array} activeProducts - Array of active product objects from DB
   */
  function removeInactiveProducts(activeProducts) {
    const activeIds = new Set(activeProducts.map(p => p.id))
    const removed = items.value.filter(item => !activeIds.has(item.product_id))
    if (removed.length > 0) {
      items.value = items.value.filter(item => activeIds.has(item.product_id))
      return removed // Return removed items so caller can notify user
    }
    return []
  }

  return {
    items,
    cartCount,
    cartTotal,
    isEmpty,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    removeInactiveProducts
  }
})
