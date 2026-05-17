<template>
  <v-main class="bg-background">
    <!-- Navbar -->
    <v-app-bar flat class="px-md-10 border-b" sticky>
      <v-toolbar-title class="luxury-font font-weight-bold text-primary tracking-widest">
        {{ CONFIG.APP_NAME }}
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <!-- Theme Toggle -->
      <v-btn
        icon
        color="secondary"
        class="mr-2"
        @click="toggleTheme"
      >
        <v-icon>{{ theme.global.name.value === 'luxuryTheme' ? 'mdi-weather-night' : 'mdi-weather-sunny' }}</v-icon>
      </v-btn>

      <!-- Nav Links -->
      <div class="hidden-sm-and-down d-flex align-center">
        <v-btn variant="text" to="/" class="text-none font-weight-medium mr-1">
          <v-icon start>mdi-palette</v-icon>
          Physical Art
        </v-btn>
      </div>

      <v-btn variant="text" to="/admin" class="font-weight-bold">Admin</v-btn>
    </v-app-bar>

    <v-container class="mt-10 pb-16">
      <!-- Hero Section -->
      <div class="text-center mb-16 px-4">
        <v-chip color="info" variant="outlined" class="mb-4 px-6 py-4 font-weight-bold" size="small">
          INSTANT DIGITAL DOWNLOADS
        </v-chip>
        <h1 class="text-h2 mb-4 luxury-font font-weight-bold">Digital Collection</h1>
        <p class="text-subtitle-1 text-grey-darken-1 max-width-600 mx-auto">
          Premium digital art, calligraphy PDFs, and custom logos — pay instantly and download immediately.
        </p>
      </div>

      <!-- Discovery Toolbar -->
      <v-row class="mb-10 align-center">
        <v-col cols="12" md="6">
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            label="Search digital products..."
            hide-details
            clearable
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="6" class="d-flex justify-md-end">
          <v-select
            v-model="sortBy"
            :items="sortOptions"
            label="Sort by"
            hide-details
            style="max-width: 250px"
          ></v-select>
        </v-col>
      </v-row>

      <!-- Loading Skeleton -->
      <v-row v-if="loading">
        <v-col v-for="i in 8" :key="i" cols="6" sm="6" md="4" lg="3">
          <v-skeleton-loader type="card, text"></v-skeleton-loader>
        </v-col>
      </v-row>

      <!-- Products Grid -->
      <v-row v-else-if="filteredProducts.length > 0">
        <v-col
          v-for="product in filteredProducts"
          :key="product.id"
          cols="6" sm="6" md="4" lg="3"
        >
          <DigitalProductCard
            :product="product"
            @buy="openPurchase"
            @view="openDetail"
          />
        </v-col>
      </v-row>

      <!-- Empty State -->
      <div v-else class="text-center py-16 opacity-60">
        <v-icon size="100" color="grey-lighten-1">mdi-file-document-outline</v-icon>
        <h3 class="text-h5 mt-4 luxury-font">No digital products found</h3>
        <p>Check back soon for new releases.</p>
        <v-btn variant="text" color="primary" class="mt-4" @click="searchQuery = ''">Clear Search</v-btn>
      </div>
    </v-container>

    <!-- Footer -->
    <v-footer class="text-center d-flex flex-column bg-surface-variant py-16 border-t px-4">
      <div class="luxury-font font-weight-bold text-h4 mb-4 tracking-widest text-primary">{{ CONFIG.APP_NAME }}</div>
      <div class="d-flex mb-8">
        <v-btn icon color="secondary" variant="text" :href="CONFIG.YOUTUBE_URL" target="_blank">
          <v-icon>mdi-youtube</v-icon>
        </v-btn>
        <v-btn icon color="secondary" variant="text" :href="CONFIG.INSTAGRAM_URL" target="_blank">
          <v-icon>mdi-instagram</v-icon>
        </v-btn>
      </div>
      <div class="d-flex gap-4 mb-6">
        <v-btn variant="outlined" color="secondary" to="/" class="text-none">
          <v-icon start>mdi-palette</v-icon>
          Physical Art Shop
        </v-btn>
        <v-btn variant="flat" color="info" to="/digital" class="text-none" disabled>
          <v-icon start>mdi-download</v-icon>
          Digital Shop
        </v-btn>
      </div>
      <div class="text-grey-darken-1 mb-2 font-weight-medium">Designed for Elegance. Crafted for You.</div>
      <div class="text-caption text-grey">© 2026 {{ CONFIG.APP_NAME }}. developed Mohammed Aadil</div>
    </v-footer>

    <!-- Product Detail Dialog -->
    <v-dialog v-model="detailDialog" max-width="900" transition="dialog-bottom-transition" content-class="ds-dialog">
      <v-card class="ds-surface-card overflow-hidden product-modal-card">
        <v-btn
          icon="mdi-close"
          variant="tonal"
          color="white"
          style="position: absolute; top: 16px; right: 16px; z-index: 100; background: rgba(0,0,0,0.4);"
          @click="detailDialog = false"
          density="comfortable"
          elevation="4"
        ></v-btn>

        <v-row no-gutters class="fill-height flex-column flex-md-row overflow-hidden">
          <v-col cols="12" md="6" class="bg-grey-lighten-4 product-image-col">
            <v-img :src="selectedProduct?.preview_image_url" height="100%" cover>
              <template v-slot:placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular indeterminate></v-progress-circular>
                </v-row>
              </template>
            </v-img>
          </v-col>

          <v-col cols="12" md="6" class="safe-flex-column bg-surface">
            <v-card-text class="safe-flex-scroll pa-6 pa-md-10">
              <v-chip color="info" variant="flat" size="small" class="mb-4">
                DIGITAL PRODUCT
              </v-chip>
              <h2 class="luxury-font text-h4 mb-1 text-primary">{{ selectedProduct?.title }}</h2>
              <div class="text-h5 text-secondary font-weight-bold mb-6">
                {{ CONFIG.CURRENCY_SYMBOL }}{{ selectedProduct?.price }}
              </div>
              <p class="text-body-1 text-grey-darken-1 mb-6">
                {{ selectedProduct?.description || 'A premium digital product. Manual delivery via WhatsApp after payment.' }}
              </p>

              <v-divider class="mb-6"></v-divider>

              <div class="d-flex align-center mb-3">
                <v-icon color="success" class="mr-3" size="20">mdi-whatsapp</v-icon>
                <span class="text-body-2">Order securely via WhatsApp</span>
              </div>
              <div class="d-flex align-center mb-3">
                <v-icon color="info" class="mr-3" size="20">mdi-image-high-definition</v-icon>
                <span class="text-body-2">Original high-res, watermark-free file delivered after payment</span>
              </div>
            </v-card-text>

            <v-divider></v-divider>
            <div class="pa-4 pa-md-10 flex-shrink-0 bg-surface">
              <v-btn
                block
                color="info"
                size="x-large"
                @click="openPurchaseFromDetail"
                class="font-weight-bold text-subtitle-1 rounded-pill"
                elevation="8"
              >
                <v-icon start>mdi-whatsapp</v-icon>
                Order on WhatsApp — {{ CONFIG.CURRENCY_SYMBOL }}{{ selectedProduct?.price }}
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card>
    </v-dialog>

    <!-- Purchase Dialog -->
    <DigitalPurchaseDialog
      v-model="purchaseDialog"
      :product="purchaseProduct"
      @purchased="onPurchased"
    />
  </v-main>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useTheme } from 'vuetify'
import { DigitalProductService } from '../services/DigitalProductService'
import { CONFIG } from '../config/constants'
import DigitalProductCard from '../components/DigitalProductCard.vue'
import DigitalPurchaseDialog from '../components/DigitalPurchaseDialog.vue'

const theme = useTheme()
const showMessage = inject('showMessage')

const toggleTheme = () => {
  theme.global.name.value = theme.global.name.value === 'luxuryTheme' ? 'luxuryDark' : 'luxuryTheme'
}

const products = ref([])
const loading = ref(true)
const searchQuery = ref('')
const sortBy = ref('newest')
const detailDialog = ref(false)
const selectedProduct = ref(null)
const purchaseDialog = ref(false)
const purchaseProduct = ref(null)

const sortOptions = [
  { title: 'Newest First', value: 'newest' },
  { title: 'Price: Low to High', value: 'price_asc' },
  { title: 'Price: High to Low', value: 'price_desc' },
  { title: 'Name: A-Z', value: 'name_asc' }
]

const fetchProducts = () => {
  loading.value = true
  DigitalProductService.getDigitalProducts()
    .then((data) => { products.value = data })
    .catch(() => { showMessage('Failed to load digital products', 'error') })
    .finally(() => { loading.value = false })
}

const filteredProducts = computed(() => {
  let result = products.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    )
  }
  result = [...result].sort((a, b) => {
    if (sortBy.value === 'price_asc') return a.price - b.price
    if (sortBy.value === 'price_desc') return b.price - a.price
    if (sortBy.value === 'name_asc') return a.title.localeCompare(b.title)
    return new Date(b.created_at) - new Date(a.created_at)
  })
  return result
})

const openDetail = (product) => {
  selectedProduct.value = product
  detailDialog.value = true
}

const openPurchase = (product) => {
  purchaseProduct.value = product
  purchaseDialog.value = true
}

const openPurchaseFromDetail = () => {
  detailDialog.value = false
  purchaseProduct.value = selectedProduct.value
  purchaseDialog.value = true
}

const onPurchased = () => {
  showMessage('Redirecting to WhatsApp...', 'success')
}

onMounted(() => {
  fetchProducts()
  DigitalProductService.subscribeToDigitalProducts('digital-shop', () => {
    fetchProducts()
  })
})
</script>

<style scoped>
.tracking-widest {
  letter-spacing: 0.25em !important;
}
.max-width-600 {
  max-width: 600px;
}
.gap-4 {
  gap: 16px;
}

/* Dialog responsive layout primitives */
.product-modal-card {
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.product-image-col {
  min-height: 300px;
  flex: 0 0 auto;
}

@media (min-width: 960px) {
  .product-image-col {
    min-height: 100%;
    flex: 0 0 50%;
  }
  .product-modal-card {
    height: 80vh;
    max-height: 700px;
  }
}
</style>
