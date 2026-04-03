<template>
  <v-container fluid class="pa-0">
    <!-- Header -->
    <div class="mb-10">
      <h1 class="text-h4 luxury-font mb-2">Command Center</h1>
      <p class="text-subtitle-1 text-grey">Real-time health and performance metrics</p>
    </div>

    <!-- Live Stats Cards -->
    <v-row class="mb-10">
      <v-col cols="12" sm="6" md="3">
        <v-card class="stats-card pa-6 rounded-xl border-thin bg-white shadow-sm overflow-hidden">
          <div class="d-flex align-center justify-space-between relative">
            <div>
              <div class="text-overline text-grey-darken-1 mb-1">Total Pieces</div>
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
              <div class="text-overline text-grey-darken-1 mb-1">Volume (Orders)</div>
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
              <div class="text-overline text-grey-darken-1 mb-1">Gross Revenue</div>
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

      <v-col cols="12" sm="6" md="3">
        <v-card class="stats-card pa-6 rounded-xl border-thin bg-white shadow-sm overflow-hidden">
          <div class="d-flex align-center justify-space-between relative">
            <div>
              <div class="text-overline text-grey-darken-1 mb-1">Customer Reach</div>
              <div class="text-h3 font-weight-bold counter-value">{{ uniqueCustomers }}</div>
            </div>
            <v-icon color="indigo" size="48" class="stats-icon opacity-10">mdi-account-group-outline</v-icon>
          </div>
          <div class="mt-4 d-flex align-center text-caption text-grey font-weight-bold">
            <v-icon size="14" class="mr-1">mdi-star-outline</v-icon>
            Engagement Rate High
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Activity & Performance -->
    <v-row>
      <v-col cols="12" md="8">
        <v-card class="rounded-xl border-thin shadow-sm">
          <v-toolbar color="transparent" class="px-4">
            <v-toolbar-title class="luxury-font text-subtitle-1">Recent Activity</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn variant="text" size="small" to="/admin/orders">View All</v-btn>
          </v-toolbar>
          <v-divider></v-divider>
          <v-list class="pa-0 overflow-y-auto" max-height="600">
            <v-list-item v-for="order in recentOrders" :key="order.id" class="px-6 py-4 border-b">
              <template v-slot:prepend>
                <v-avatar color="grey-lighten-4" size="48" class="mr-2">
                  <v-icon color="primary">mdi-cart-plus</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-bold mb-1">
                New Order from {{ order.customer_name }}
              </v-list-item-title>
              <v-list-item-subtitle class="text-caption">
                {{ order.product_name }} • {{ CONFIG.CURRENCY_SYMBOL }}{{ order.price }}
              </v-list-item-subtitle>
              <template v-slot:append>
                <div class="text-right">
                  <v-chip
                    :color="order.status === 'completed' ? 'success' : 'warning'"
                    size="x-small"
                    variant="flat"
                    class="mb-1"
                  >
                    {{ order.status.toUpperCase() }}
                  </v-chip>
                  <div class="text-caption text-grey font-italic">{{ formatTime(order.created_at) }}</div>
                </div>
              </template>
            </v-list-item>
            
            <div v-if="orders.length === 0" class="pa-16 text-center text-grey">
              No recent activity recorded yet.
            </div>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="rounded-xl border-thin shadow-sm pa-6 mb-6 bg-primary text-white">
          <h3 class="luxury-font mb-4">Quick Tip</h3>
          <p class="text-body-2 opacity-80 mb-6">
            Keep your inventory updated with the latest calligraphy pieces to increase customer engagement and revenue.
          </p>
          <v-btn color="secondary" block size="large" to="/admin/products" class="text-none font-weight-bold">
            Update Collection
          </v-btn>
        </v-card>

        <v-card class="rounded-xl border-thin shadow-sm pa-6">
          <h3 class="luxury-font mb-4">System Status</h3>
          <div class="d-flex align-center mb-4">
            <div class="status-indicator online mr-3"></div>
            <div>
              <div class="text-subtitle-2">Supabase Database</div>
              <div class="text-caption text-grey">Real-time Synchronization: Enabled</div>
            </div>
          </div>
          <div class="d-flex align-center">
            <div class="status-indicator online mr-3"></div>
            <div>
              <div class="text-subtitle-2">WhatsApp Gateway</div>
              <div class="text-caption text-grey">Configured for +{{ CONFIG.WHATSAPP_NUMBER }}</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import { SupabaseService } from '../services/SupabaseService'
import { CONFIG } from '../config/constants'

const products = ref([])
const orders = ref([])
const showMessage = inject('showMessage')
const setLoading = inject('setLoading')

const totalRevenue = computed(() => {
  return orders.value
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + parseFloat(o.price || 0), 0)
    .toLocaleString()
})

const pendingOrders = computed(() => orders.value.filter(o => o.status === 'pending'))
const uniqueCustomers = computed(() => new Set(orders.value.map(o => o.phone)).size)
const recentOrders = computed(() => orders.value.slice(0, 10))

const fetchData = () => {
  setLoading(true)
  Promise.all([
    SupabaseService.getAllProducts(),
    SupabaseService.getOrders()
  ])
    .then(([productsData, ordersData]) => {
      products.value = productsData
      orders.value = ordersData
    })
    .catch((err) => {
      showMessage('Error fetching dashboard data', 'error')
    })
    .finally(() => {
      setLoading(false)
    })
}

// Subscriptions
let productSubscription = null
let orderSubscription = null

onMounted(() => {
  fetchData()
  
  // Real-time synchronization
  productSubscription = SupabaseService.subscribeToProducts(() => {
    fetchData() // Refresh on change for perfect data integrity
  })
  
  orderSubscription = SupabaseService.subscribeToOrders(() => {
    fetchData()
  })
})

onUnmounted(() => {
  if (productSubscription) productSubscription.unsubscribe()
  if (orderSubscription) orderSubscription.unsubscribe()
})

const formatTime = (dateStr) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return date.toLocaleDateString()
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

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-indicator.online {
  background-color: #4CAF50;
  box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.2);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
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
