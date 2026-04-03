<template>
  <v-main class="bg-background">
    <!-- Premium Navbar -->
    <v-app-bar flat color="white" class="px-md-10 border-b" sticky>
      <v-toolbar-title class="luxury-font font-weight-bold text-primary tracking-widest">
        THE CRAFTS STUDIO
      </v-toolbar-title>
      
      <v-spacer></v-spacer>
      
      <!-- Social Icons -->
      <div class="hidden-sm-and-down mr-4">
        <v-btn icon color="secondary" :href="CONFIG.YOUTUBE_URL" target="_blank">
          <v-icon>mdi-youtube</v-icon>
        </v-btn>
        <v-btn icon color="secondary" :href="CONFIG.INSTAGRAM_URL" target="_blank">
          <v-icon>mdi-instagram</v-icon>
        </v-btn>
      </div>

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
                @click.stop="openOrderDialog(product)"
              >
                Order Now
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
    <v-footer class="text-center d-flex flex-column bg-primary text-white py-16">
      <div class="luxury-font font-weight-bold text-h4 mb-4 tracking-widest">THE CRAFTS STUDIO</div>
      <div class="d-flex mb-8">
        <v-btn icon color="white" variant="text" :href="CONFIG.YOUTUBE_URL" target="_blank">
          <v-icon>mdi-youtube</v-icon>
        </v-btn>
        <v-btn icon color="white" variant="text" :href="CONFIG.INSTAGRAM_URL" target="_blank">
          <v-icon>mdi-instagram</v-icon>
        </v-btn>
      </div>
      <div class="text-grey mb-2">Designed for Elegance. Crafted for You.</div>
      <div class="text-caption text-grey">© 2026 The Crafts Studio. All rights reserved.</div>
    </v-footer>

    <!-- Product Detail / Order Dialog -->
    <v-dialog v-model="dialog" max-width="900" transition="dialog-bottom-transition" persistent>
      <v-card class="rounded-xl overflow-hidden">
        <v-row no-gutters>
          <v-col cols="12" md="6" class="bg-grey-lighten-4">
            <v-img
              :src="selectedProduct?.image_url"
              height="100%"
              min-height="400"
              cover
            ></v-img>
          </v-col>
          <v-col cols="12" md="6" class="pa-8 d-flex flex-column">
            <div class="d-flex justify-space-between align-start mb-4">
              <div>
                <h2 class="luxury-font text-h4 mb-1">{{ selectedProduct?.name }}</h2>
                <div class="text-h5 text-primary font-weight-bold">{{ CONFIG.CURRENCY_SYMBOL }}{{ selectedProduct?.price }}</div>
              </div>
              <v-btn icon="mdi-close" variant="text" @click="dialog = false"></v-btn>
            </div>

            <p class="text-body-1 text-grey-darken-1 mb-8">
              {{ selectedProduct?.description || 'A unique, handcrafted calligraphy piece, made to order with the finest materials and attention to detail.' }}
            </p>

            <v-divider class="mb-8"></v-divider>

            <v-form ref="form" v-model="valid" class="flex-grow-1">
              <v-text-field
                v-model="orderForm.customer_name"
                label="Your Name"
                :rules="[v => !!v || 'Required']"
                required
              ></v-text-field>
              
              <v-text-field
                v-model="orderForm.phone"
                label="WhatsApp Number"
                placeholder="e.g. 86438..."
                :rules="[v => !!v || 'Required']"
                required
              ></v-text-field>

              <v-textarea
                v-model="orderForm.custom_text"
                label="Personalization Text"
                placeholder="What should I write? (e.g. A name or a quote)"
                rows="2"
              ></v-textarea>

              <div class="mt-auto pt-4">
                <v-btn
                  block
                  color="primary"
                  size="large"
                  :loading="orderLoading"
                  @click="submitOrder"
                  class="font-weight-bold text-h6"
                >
                  Confirm & Order via WhatsApp
                </v-btn>
                <div class="text-caption text-center mt-4 text-grey">
                  By clicking confirm, your order will be saved and you'll be redirected to WhatsApp to finalize.
                </div>
              </div>
            </v-form>
          </v-col>
        </v-row>
      </v-card>
    </v-dialog>
  </v-main>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { SupabaseService } from '../services/SupabaseService'
import { CONFIG } from '../config/constants'

const products = ref([])
const loading = ref(true)
const dialog = ref(false)
const selectedProduct = ref(null)
const orderLoading = ref(false)
const valid = ref(false)
const form = ref(null)
const searchQuery = ref('')
const sortBy = ref('newest')
const showMessage = inject('showMessage')
const setLoading = inject('setLoading')

const sortOptions = [
  { title: 'Newest First', value: 'newest' },
  { title: 'Price: Low to High', value: 'price_asc' },
  { title: 'Price: High to Low', value: 'price_desc' },
  { title: 'Name: A-Z', value: 'name_asc' }
]

const orderForm = ref({
  customer_name: '',
  phone: '',
  custom_text: '',
  notes: ''
})

const fetchProducts = () => {
  loading.value = true
  SupabaseService.getProducts()
    .then((data) => {
      products.value = data
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

const openOrderDialog = (product) => {
  selectedProduct.value = product
  dialog.value = true
}

const submitOrder = () => {
  form.value.validate()
    .then(({ valid: isFormValid }) => {
      if (!isFormValid) return

      orderLoading.value = true
      const orderData = {
        ...orderForm.value,
        product_id: selectedProduct.value.id,
        product_name: selectedProduct.value.name,
        price: selectedProduct.value.price,
        status: 'pending'
      }

      SupabaseService.createOrder(orderData)
        .then(() => {
          showMessage('Order recorded! Redirecting to WhatsApp...')
          
          // Construct structured WhatsApp message
          const message = `*NEW ORDER FROM THE CRAFTS STUDIO*
------------------------------
*Product:* ${selectedProduct.value.name}
*Price:* ${CONFIG.CURRENCY_SYMBOL}${selectedProduct.value.price}
*Custom Text:* ${orderForm.value.custom_text || 'Not specified'}
------------------------------
*Customer:* ${orderForm.value.customer_name}
*Phone:* ${orderForm.value.phone}
*Notes:* ${orderForm.value.notes || 'None'}
------------------------------
Please confirm my order. Thank you!`

          const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
          
          setTimeout(() => {
            window.location.href = whatsappUrl
            dialog.value = false
            // Reset form
            Object.keys(orderForm.value).forEach(key => orderForm.value[key] = '')
          }, 1500)
        })
        .catch(() => {
          showMessage('Error placing order. Please try again.', 'error')
        })
        .finally(() => {
          orderLoading.value = false
        })
    })
}

onMounted(() => {
  fetchProducts()
  // Real-time subscription
  SupabaseService.subscribeToProducts(() => {
    fetchProducts()
  })
})
</script>

<style scoped>
.max-width-600 {
  max-width: 600px;
}

.product-card {
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  cursor: pointer;
  border: 1px solid rgba(0,0,0,0.05) !important;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(212, 175, 55, 0.1) !important;
  border-color: rgba(212, 175, 55, 0.3) !important;
}

.product-img {
  transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.product-card:hover .product-img {
  transform: scale(1.1);
}

.search-bar :deep(.v-field__outline) {
  --v-field-border-opacity: 0.1;
}

.sort-select :deep(.v-field__outline) {
  --v-field-border-opacity: 0.1;
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

