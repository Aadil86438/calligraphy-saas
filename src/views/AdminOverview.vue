<template>
  <v-container fluid class="pa-0">
    <!-- Live Stats Cards -->
    <v-row class="mb-10">
      <v-col cols="12" sm="6" md="3">
        <v-card class="stats-card pa-6 rounded-xl border-thin bg-white shadow-sm overflow-hidden">
          <div class="d-flex align-center justify-space-between relative">
            <div>
              <div class="text-overline text-grey-darken-1 mb-1">Total Products</div>
              <div class="text-h3 font-weight-bold counter-value">{{ products.length }}</div>
            </div>
            <v-icon color="primary" size="48" class="stats-icon opacity-10">mdi-package-variant</v-icon>
          </div>
          <div class="mt-4 d-flex align-center text-caption text-success font-weight-bold">
            <v-icon size="14" class="mr-1">mdi-refresh</v-icon>
            Updates Live
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stats-card pa-6 rounded-xl border-thin bg-white shadow-sm overflow-hidden">
          <div class="d-flex align-center justify-space-between relative">
            <div>
              <div class="text-overline text-grey-darken-1 mb-1">Active Products</div>
              <div class="text-h3 font-weight-bold counter-value">{{ activeProductCount }}</div>
            </div>
            <v-icon color="success" size="48" class="stats-icon opacity-10">mdi-check-decagram</v-icon>
          </div>
          <div class="mt-4 d-flex align-center text-caption text-success font-weight-bold">
            <v-icon size="14" class="mr-1">mdi-check-circle</v-icon>
            Verified
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stats-card pa-6 rounded-xl border-thin bg-white shadow-sm overflow-hidden">
          <div class="d-flex align-center justify-space-between relative">
            <div>
              <div class="text-overline text-grey-darken-1 mb-1">Total Orders</div>
              <div class="text-h3 font-weight-bold counter-value">{{ orders.length }}</div>
            </div>
            <v-icon color="secondary" size="48" class="stats-icon opacity-10">mdi-cart-variant</v-icon>
          </div>
          <div class="mt-4 d-flex align-center text-caption text-info font-weight-bold">
            <v-icon size="14" class="mr-1">mdi-timer-outline</v-icon>
            {{ pendingOrders.length }} Pending
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stats-card pa-6 rounded-xl border-thin bg-white shadow-sm overflow-hidden">
          <div class="d-flex align-center justify-space-between relative">
            <div>
              <div class="text-overline text-grey-darken-1 mb-1">Revenue (Est.)</div>
              <div class="text-h3 font-weight-bold counter-value">{{ CONFIG.CURRENCY_SYMBOL }}{{ totalRevenue }}</div>
            </div>
            <v-icon color="success" size="48" class="stats-icon opacity-10">mdi-cash-multiple</v-icon>
          </div>
          <div class="mt-4 d-flex align-center text-caption text-success font-weight-bold">
            <v-icon size="14" class="mr-1">mdi-trending-up</v-icon>
            Top Performer
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Activity -->
    <div class="luxury-font text-overline text-grey-darken-1 mb-4 font-weight-bold">RECENT ACTIVITY</div>
    <v-card class="rounded-xl border-thin shadow-sm">
      <v-list class="pa-0">
        <v-list-item v-for="order in recentOrders" :key="order.id" class="px-6 py-4 border-b">
          <template v-slot:prepend>
            <v-avatar color="grey-lighten-4" size="44" class="mr-3">
              <v-icon color="primary" size="20">mdi-cart-plus</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="font-weight-bold mb-1 text-body-2">
            Order from {{ order.customer_name }}
            <span v-if="order.order_items && order.order_items.length > 0" class="text-grey font-weight-medium">
              ({{ order.order_items.length }} item{{ order.order_items.length !== 1 ? 's' : '' }})
            </span>
          </v-list-item-title>
          <v-list-item-subtitle class="text-caption">
            {{ formatDate(order.created_at) }}
          </v-list-item-subtitle>
          <template v-slot:append>
            <span class="text-secondary font-weight-bold">
              {{ CONFIG.CURRENCY_SYMBOL }}{{ formatAmount(order.total_amount || order.price) }}
            </span>
          </template>
        </v-list-item>
        
        <div v-if="orders.length === 0" class="pa-16 text-center text-grey">
          No recent activity recorded yet.
        </div>
      </v-list>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import { SupabaseService } from '../services/SupabaseService'
import { CONFIG } from '../config/constants'

const products = ref([])
const orders = ref([])
const showMessage = inject('showMessage')
const loading = ref(true)

const activeProductCount = computed(() => products.value.filter(p => p.is_active).length)

const totalRevenue = computed(() => {
  return orders.value
    .reduce((sum, o) => sum + parseFloat(o.total_amount || o.price || 0), 0)
    .toLocaleString()
})

const pendingOrders = computed(() => orders.value.filter(o => o.status === 'pending'))
const recentOrders = computed(() => orders.value.slice(0, 10))

const fetchData = () => {
  loading.value = true
  Promise.all([
    SupabaseService.getAllProducts(),
    SupabaseService.getOrdersWithItems()
      .catch(() => SupabaseService.getOrders()) // Fallback if order_items not ready
  ])
    .then(([productsData, ordersData]) => {
      products.value = productsData
      orders.value = ordersData
    })
    .catch(() => {
      showMessage('Error fetching dashboard data', 'error')
    })
    .finally(() => {
      loading.value = false
    })
}

// Subscriptions
let productSubscription = null
let orderSubscription = null

onMounted(() => {
  fetchData()
  
  // Real-time synchronization
  productSubscription = SupabaseService.subscribeToProducts('dashboard-products', () => {
    fetchData()
  })
  
  orderSubscription = SupabaseService.subscribeToOrders('dashboard-orders', () => {
    fetchData()
  })
})

onUnmounted(() => {
  if (productSubscription) productSubscription.unsubscribe()
  if (orderSubscription) orderSubscription.unsubscribe()
})

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatAmount = (val) => {
  return Number(val || 0).toLocaleString()
}
</script>

<style scoped>
.stats-card {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
}

.stats-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.08) !important;
}

.stats-icon {
  position: absolute;
  top: 10px;
  right: 10px;
}

.counter-value {
  letter-spacing: -1px;
}

.border-b {
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.opacity-10 {
  opacity: 0.1;
}

.relative {
  position: relative;
}
</style>
