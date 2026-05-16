<template>
  <v-main class="bg-background">
    <!-- Premium Navbar -->
    <v-app-bar flat class="px-md-10 border-b" sticky>
      <v-toolbar-title class="luxury-font font-weight-bold text-primary tracking-widest">
        Nafzz studio
      </v-toolbar-title>
      
      <v-spacer></v-spacer>
      
      <!-- Theme Toggle -->
      <v-btn
        icon
        color="secondary"
        class="mr-2 theme-toggle-btn"
        @click="toggleTheme"
        :title="theme.global.name.value === 'luxuryTheme' ? 'Switch to Dark Mode' : 'Switch to Light Mode'"
      >
        <v-icon>{{ theme.global.name.value === 'luxuryTheme' ? 'mdi-weather-night' : 'mdi-weather-sunny' }}</v-icon>
      </v-btn>

      <!-- Social Icons -->
      <div class="hidden-sm-and-down mr-4">
        <v-btn icon color="secondary" :href="CONFIG.YOUTUBE_URL" target="_blank">
          <v-icon>mdi-youtube</v-icon>
        </v-btn>
        <v-btn icon color="secondary" :href="CONFIG.INSTAGRAM_URL" target="_blank">
          <v-icon>mdi-instagram</v-icon>
        </v-btn>
      </div>

      <!-- Cart Button -->
      <v-btn
        icon
        color="secondary"
        class="mr-2"
        @click="cartDrawerOpen = true"
      >
        <v-badge
          :content="cart.cartCount"
          :model-value="cart.cartCount > 0"
          color="error"
          floating
        >
          <v-icon>mdi-cart-outline</v-icon>
        </v-badge>
      </v-btn>

      <v-btn variant="text" to="/digital" class="font-weight-bold mr-1">Digital Shop</v-btn>
      <v-btn variant="text" to="/admin" class="font-weight-bold">Admin</v-btn>
    </v-app-bar>

    <v-container class="mt-10 pb-16">
      <!-- Hero Section -->
      <div class="text-center mb-16 px-4">
        <v-chip color="secondary" variant="outlined" class="mb-4 px-6 py-4 font-weight-bold" size="small">
          HANDCRAFTED LUXURY
        </v-chip>
        <h1 class="text-h2 mb-4 luxury-font font-weight-bold">Timeless Art, Personally Penned</h1>
        <p class="text-subtitle-1 text-grey-darken-1 max-width-600 mx-auto">
          Discover handcrafted calligraphy pieces for your most cherished moments. 
          Each stroke is a testament to tradition and elegance.
        </p>
      </div>

      <!-- Discovery Toolbar -->
      <v-row class="mb-10 align-center">
        <v-col cols="12" md="6">
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            label="Search products..."
            hide-details
            clearable
            class="search-bar"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="6" class="d-flex justify-md-end">
          <v-select
            v-model="sortBy"
            :items="sortOptions"
            label="Sort by"
            hide-details
            class="sort-select"
            style="max-width: 250px"
          ></v-select>
        </v-col>
      </v-row>

      <!-- Products Grid -->
      <v-row v-if="loading">
        <v-col v-for="i in 8" :key="i" cols="12" sm="6" md="4" lg="3">
          <v-skeleton-loader type="card, text"></v-skeleton-loader>
        </v-col>
      </v-row>

      <v-row v-else-if="filteredProducts.length > 0">
        <v-col 
          v-for="product in filteredProducts" 
          :key="product.id" 
          cols="6" sm="6" md="4" lg="3"
        >
          <v-card class="product-card group overflow-hidden" @click="openProductDetail(product)">
            <div class="image-container overflow-hidden">
              <v-img
                :src="product.image_url"
                aspect-ratio="1"
                cover
                class="bg-grey-lighten-4 transition-transform duration-500 product-img"
                lazy-src="https://via.placeholder.com/400x400?text=The+Crafts+Studio"
              >
                <template v-slot:placeholder>
                  <v-row class="fill-height ma-0" align="center" justify="center">
                    <v-progress-circular indeterminate color="grey-lighten-1"></v-progress-circular>
                  </v-row>
                </template>
              </v-img>
            </div>
            
            <v-card-text class="px-2 pt-4 pb-0">
              <h3 class="luxury-font text-subtitle-1 font-weight-bold mb-1 text-truncate">
                {{ product.name }}
              </h3>
              <div class="d-flex align-center justify-space-between">
                <span class="text-primary font-weight-bold">
                  {{ CONFIG.CURRENCY_SYMBOL }}{{ product.price }}
                </span>
                <v-chip size="x-small" color="secondary" variant="flat">PREMIUM</v-chip>
              </div>
            </v-card-text>
            
            <v-card-actions class="px-2 pb-4">
              <v-btn
                block
                color="primary"
                variant="flat"
                class="mt-2 text-none"
                @click.stop="handleAddToCart(product)"
              >
                <v-icon start>mdi-cart-plus</v-icon>
                Add to Cart
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- Empty State -->
      <div v-else class="text-center py-16 opacity-60">
        <v-icon size="100" color="grey-lighten-1">mdi-package-variant-closed</v-icon>
        <h3 class="text-h5 mt-4 luxury-font">No pieces found</h3>
        <p>Try adjusting your search or check back later.</p>
        <v-btn variant="text" color="primary" class="mt-4" @click="searchQuery = ''">Clear Search</v-btn>
      </div>
    </v-container>

    <!-- Footer -->
    <v-footer class="text-center d-flex flex-column bg-surface-variant py-16 border-t px-4">
      <div class="luxury-font font-weight-bold text-h4 mb-4 tracking-widest text-primary">Nafzz studio</div>
      <div class="d-flex mb-8">
        <v-btn icon color="secondary" variant="text" :href="CONFIG.YOUTUBE_URL" target="_blank">
          <v-icon>mdi-youtube</v-icon>
        </v-btn>
        <v-btn icon color="secondary" variant="text" :href="CONFIG.INSTAGRAM_URL" target="_blank">
          <v-icon>mdi-instagram</v-icon>
        </v-btn>
      </div>
      <div class="text-grey-darken-1 mb-2 font-weight-medium">Designed for Elegance. Crafted for You.</div>
      <div class="text-caption text-grey">© 2026 Nafzz studio. developed Mohammed Aadil <a href="https://github.com/sachin-2004"></a></div>
    </v-footer>

    <!-- Product Detail Dialog (View only — no order form) -->
    <v-dialog 
      v-model="dialog" 
      max-width="900" 
      transition="dialog-bottom-transition" 
      content-class="product-detail-dialog"
    >
      <v-card class="rounded-xl overflow-hidden product-modal-card">
        <!-- Absolute Close Button -->
        <v-btn
          icon="mdi-close"
          variant="tonal"
          color="white"
          class="close-btn-fixed"
          @click="dialog = false"
          density="comfortable"
          elevation="4"
        ></v-btn>

        <v-row no-gutters class="fill-height flex-column flex-md-row overflow-hidden">
          <!-- Image Column -->
          <v-col cols="12" md="6" class="product-image-col bg-grey-lighten-4">
            <v-img
              :src="selectedProduct?.image_url"
              class="product-hero-img"
              height="100%"
              cover
            >
              <template v-slot:placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular indeterminate color="grey-lighten-1"></v-progress-circular>
                </v-row>
              </template>
            </v-img>
          </v-col>

          <!-- Content Column -->
          <v-col cols="12" md="6" class="d-flex flex-column modal-content-col bg-surface">
            <v-card-text class="overflow-y-auto flex-grow-1 content-scroll-area pa-6 pa-md-10">
              <div class="d-flex justify-space-between align-start mb-6">
                <div>
                  <h2 class="luxury-font text-h4 mb-1 text-primary">{{ selectedProduct?.name }}</h2>
                  <div class="text-h5 text-secondary font-weight-bold">
                    {{ CONFIG.CURRENCY_SYMBOL }}{{ selectedProduct?.price }}
                  </div>
                </div>
              </div>

              <p class="text-body-1 text-grey-darken-1 mb-8">
                {{ selectedProduct?.description || 'A unique, handcrafted calligraphy piece, made to order with the finest materials and attention to detail.' }}
              </p>

              <v-divider class="mb-8"></v-divider>

              <!-- Cart quantity info if already in cart -->
              <div v-if="selectedProductCartQty > 0" class="d-flex align-center pa-4 bg-grey-lighten-4 rounded-lg mb-6">
                <v-icon color="secondary" class="mr-3">mdi-cart-check</v-icon>
                <div>
                  <div class="font-weight-bold text-body-2">Already in your cart</div>
                  <div class="text-caption text-grey">Quantity: {{ selectedProductCartQty }}</div>
                </div>
              </div>
            </v-card-text>

            <!-- Add to Cart Button -->
            <v-divider></v-divider>
            <div class="pa-4 pa-md-10 sticky-footer bg-surface shadow-top">
              <v-btn
                block
                color="primary"
                size="x-large"
                @click="handleAddToCartFromDetail"
                class="font-weight-bold text-subtitle-1 rounded-pill"
                elevation="8"
              >
                <v-icon start>mdi-cart-plus</v-icon>
                Add to Cart
              </v-btn>
              <div class="text-caption text-center mt-3 text-grey">
                Add items and checkout when you're ready
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card>
    </v-dialog>

    <!-- Cart Drawer -->
    <CartDrawer
      v-model="cartDrawerOpen"
      @checkout="checkoutDialogOpen = true"
    />

    <!-- Checkout Dialog -->
    <CheckoutDialog v-model="checkoutDialogOpen" />

    <!-- Added to Cart Snackbar -->
    <v-snackbar
      v-model="addedSnackbar"
      timeout="2000"
      color="success"
      location="bottom center"
      class="mb-4"
    >
      <div class="d-flex align-center">
        <v-icon start>mdi-check-circle</v-icon>
        <span class="font-weight-medium">Added to cart!</span>
      </div>
      <template v-slot:actions>
        <v-btn variant="text" size="small" @click="cartDrawerOpen = true; addedSnackbar = false">
          View Cart
        </v-btn>
      </template>
    </v-snackbar>
  </v-main>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useTheme } from 'vuetify'
import { SupabaseService } from '../services/SupabaseService'
import { CONFIG } from '../config/constants'
import { useCartStore } from '../stores/cart'
import CartDrawer from '../components/CartDrawer.vue'
import CheckoutDialog from '../components/CheckoutDialog.vue'

const theme = useTheme()
const cart = useCartStore()

const toggleTheme = () => {
  theme.global.name.value = theme.global.name.value === 'luxuryTheme' ? 'luxuryDark' : 'luxuryTheme'
}

const products = ref([])
const loading = ref(true)
const dialog = ref(false)
const selectedProduct = ref(null)
const searchQuery = ref('')
const sortBy = ref('newest')
const cartDrawerOpen = ref(false)
const checkoutDialogOpen = ref(false)
const addedSnackbar = ref(false)
const showMessage = inject('showMessage')

const sortOptions = [
  { title: 'Newest First', value: 'newest' },
  { title: 'Price: Low to High', value: 'price_asc' },
  { title: 'Price: High to Low', value: 'price_desc' },
  { title: 'Name: A-Z', value: 'name_asc' }
]

const fetchProducts = () => {
  loading.value = true
  SupabaseService.getProducts()
    .then((data) => {
      products.value = data
      // Clean cart of any deactivated products
      const removed = cart.removeInactiveProducts(data)
      if (removed.length > 0) {
        showMessage(`${removed.length} unavailable item(s) removed from cart`, 'warning')
      }
    })
    .catch(() => {
      showMessage('Failed to load pieces', 'error')
    })
    .finally(() => {
      loading.value = false
    })
}

const filteredProducts = computed(() => {
  let result = products.value

  // Search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.description?.toLowerCase().includes(query)
    )
  }

  // Sort
  result = [...result].sort((a, b) => {
    if (sortBy.value === 'price_asc') return a.price - b.price
    if (sortBy.value === 'price_desc') return b.price - a.price
    if (sortBy.value === 'name_asc') return a.name.localeCompare(b.name)
    return new Date(b.created_at) - new Date(a.created_at)
  })

  return result
})

const openProductDetail = (product) => {
  selectedProduct.value = product
  dialog.value = true
}

const selectedProductCartQty = computed(() => {
  if (!selectedProduct.value) return 0
  const item = cart.items.find(i => i.product_id === selectedProduct.value.id)
  return item ? item.quantity : 0
})

const handleAddToCart = (product) => {
  cart.addToCart(product)
  addedSnackbar.value = true
}

const handleAddToCartFromDetail = () => {
  if (selectedProduct.value) {
    cart.addToCart(selectedProduct.value)
    addedSnackbar.value = true
    dialog.value = false
  }
}

onMounted(() => {
  fetchProducts()
  // Real-time subscription
  SupabaseService.subscribeToProducts('home-products', () => {
    fetchProducts()
  })
})
</script>

<style scoped>
.product-detail-dialog :deep(.v-overlay__content) {
  max-height: 90vh !important;
  margin: 16px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.product-modal-card {
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.close-btn-fixed {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 100;
  background: rgba(0, 0, 0, 0.4) !important;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

.product-image-col {
  height: 250px;
  flex: 0 0 250px;
}

.modal-content-col {
  flex: 1 1 auto;
  min-height: 0; /* Important for internal scrolling */
}

.content-scroll-area {
  background-attachment: local;
}

@media (min-width: 960px) {
  .product-image-col {
    height: 100%;
    flex: 0 0 50%;
  }
  .product-modal-card {
    height: 700px;
  }
  .close-btn-fixed {
    background: rgba(255, 255, 255, 0.2) !important;
    color: #333 !important;
  }
}

.shadow-top {
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.05);
}

.transition-transform {
  transition-property: transform;
}

.duration-500 {
  transition-duration: 500ms;
}

.tracking-widest {
  letter-spacing: 0.25em !important;
}
</style>
