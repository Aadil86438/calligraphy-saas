<template>
  <v-container fluid class="pa-0">
    <!-- Revenue Summary -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-5 rounded-xl border-thin shadow-sm">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-overline text-grey-darken-1 mb-1">Digital Revenue</div>
              <div class="text-h4 font-weight-bold">{{ CONFIG.CURRENCY_SYMBOL }}{{ totalRevenue }}</div>
            </div>
            <v-icon color="info" size="40" class="opacity-20">mdi-cash-multiple</v-icon>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-5 rounded-xl border-thin shadow-sm">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-overline text-grey-darken-1 mb-1">Total Orders</div>
              <div class="text-h4 font-weight-bold">{{ orders.length }}</div>
            </div>
            <v-icon color="success" size="40" class="opacity-20">mdi-cart-check</v-icon>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-5 rounded-xl border-thin shadow-sm">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-overline text-grey-darken-1 mb-1">Total Downloads</div>
              <div class="text-h4 font-weight-bold">{{ totalDownloads }}</div>
            </div>
            <v-icon color="warning" size="40" class="opacity-20">mdi-download</v-icon>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Orders Table -->
    <v-card class="border-thin shadow-sm overflow-hidden" :loading="loading">
      <div v-if="loading" class="pa-16 text-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>
      <div v-else class="overflow-x-auto">
        <v-table hover class="orders-table">
          <thead class="bg-grey-lighten-4">
            <tr>
              <th style="width: 40px"></th>
              <th>CUSTOMER</th>
              <th>PRODUCT</th>
              <th>TXN ID</th>
              <th style="width: 100px">AMOUNT</th>
              <th style="width: 120px">DOWNLOADS</th>
              <th style="width: 140px">DATE</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="order in orders" :key="order.id">
              <tr class="order-row" @click="toggleExpand(order.id)">
                <td>
                  <v-btn size="x-small" icon variant="text" @click.stop="toggleExpand(order.id)">
                    <v-icon>{{ expandedOrders.has(order.id) ? 'mdi-chevron-down' : 'mdi-chevron-right' }}</v-icon>
                  </v-btn>
                </td>
                <td class="py-3">
                  <div class="font-weight-bold text-body-2">{{ order.customer_name }}</div>
                  <div class="text-caption text-grey">{{ order.phone }}</div>
                </td>
                <td class="text-body-2">{{ order.digital_products?.title || 'Unknown' }}</td>
                <td>
                  <v-chip size="small" variant="tonal" color="secondary" class="font-weight-bold">
                    {{ order.transaction_id }}
                  </v-chip>
                </td>
                <td class="font-weight-bold text-primary">
                  {{ CONFIG.CURRENCY_SYMBOL }}{{ order.amount }}
                </td>
                <td>
                  <v-chip
                    size="small"
                    :color="order.download_count >= order.download_limit ? 'error' : 'success'"
                    variant="tonal"
                  >
                    {{ order.download_count }} / {{ order.download_limit }}
                  </v-chip>
                </td>
                <td class="text-caption text-grey">{{ formatDate(order.created_at) }}</td>
              </tr>

              <!-- Expanded: Download Logs -->
              <tr v-if="expandedOrders.has(order.id)" class="expanded-row">
                <td colspan="7" class="pa-0">
                  <div class="bg-grey-lighten-5 pa-4 pl-14">
                    <div class="text-overline text-grey mb-2 font-weight-bold">DOWNLOAD LOGS</div>
                    <div v-if="downloadLogs[order.id] === undefined" class="text-center py-4">
                      <v-progress-circular indeterminate size="20" color="grey"></v-progress-circular>
                    </div>
                    <div v-else-if="downloadLogs[order.id]?.length === 0" class="text-caption text-grey py-2">
                      No downloads recorded yet.
                    </div>
                    <v-table v-else density="compact" class="bg-transparent">
                      <thead>
                        <tr>
                          <th class="text-caption">TIMESTAMP</th>
                          <th class="text-caption">USER AGENT</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="log in downloadLogs[order.id]" :key="log.id">
                          <td class="text-caption">{{ formatDateTime(log.downloaded_at) }}</td>
                          <td class="text-caption text-truncate" style="max-width: 300px">
                            {{ log.user_agent || 'Unknown' }}
                          </td>
                        </tr>
                      </tbody>
                    </v-table>
                  </div>
                </td>
              </tr>
            </template>

            <tr v-if="orders.length === 0">
              <td colspan="7" class="text-center py-16 text-grey">
                <v-icon size="48" color="grey-lighten-2" class="mb-2">mdi-cart-outline</v-icon>
                <div>No digital orders yet</div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject, watch } from 'vue'
import { DigitalProductService } from '../services/DigitalProductService'
import { CONFIG } from '../config/constants'

const orders = ref([])
const loading = ref(true)
const expandedOrders = ref(new Set())
const downloadLogs = ref({})
const showMessage = inject('showMessage')

const totalRevenue = computed(() => {
  return orders.value.reduce((sum, o) => sum + parseFloat(o.amount || 0), 0).toLocaleString()
})

const totalDownloads = computed(() => {
  return orders.value.reduce((sum, o) => sum + (o.download_count || 0), 0)
})

const toggleExpand = (orderId) => {
  if (expandedOrders.value.has(orderId)) {
    expandedOrders.value.delete(orderId)
  } else {
    expandedOrders.value.add(orderId)
    // Fetch logs if not already loaded
    if (downloadLogs.value[orderId] === undefined) {
      downloadLogs.value[orderId] = undefined // loading state
      DigitalProductService.getDownloadLogs(orderId)
        .then((logs) => { downloadLogs.value[orderId] = logs })
        .catch(() => { downloadLogs.value[orderId] = [] })
    }
  }
}

const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
const formatDateTime = (d) => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

const fetchOrders = () => {
  loading.value = true
  DigitalProductService.getDigitalOrders()
    .then((data) => { orders.value = data })
    .catch(() => { showMessage('Error fetching digital orders', 'error') })
    .finally(() => { loading.value = false })
}

let sub = null
onMounted(() => {
  try {
    fetchOrders()
    sub = DigitalProductService.subscribeToDigitalOrders('admin-digital-orders', () => { fetchOrders() })
  } catch (err) {
    console.error('DigitalOrderAdmin mount error:', err)
  }
})

onUnmounted(() => {
  if (sub) sub.unsubscribe()
})
</script>

<style scoped>
.orders-table { min-width: 800px; }
.order-row { cursor: pointer; }
.expanded-row td { border-bottom: none !important; }
.opacity-20 { opacity: 0.2; }
</style>
