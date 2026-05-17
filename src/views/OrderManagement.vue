<template>
  <v-container fluid class="pa-0">
    <!-- Orders Table -->
    <v-card class="ds-surface-card overflow-hidden" :loading="loading">
      <div v-if="loading" class="pa-16 text-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>
      <div v-else class="overflow-x-auto">
        <v-table hover class="orders-table ds-table">
          <thead class="bg-grey-lighten-4">
            <tr>
              <th style="width: 40px"></th>
              <th class="font-weight-bold py-4">CUSTOMER</th>
              <th class="font-weight-bold py-4">PHONE</th>
              <th class="font-weight-bold py-4">ITEMS</th>
              <th class="font-weight-bold py-4">TOTAL</th>
              <th class="font-weight-bold py-4">DATE</th>
              <th class="font-weight-bold py-4 text-center">STATUS</th>
              <th class="font-weight-bold py-4 text-right">INVOICE</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="order in orders" :key="order.id">
              <!-- Main Row -->
              <tr class="order-row">
                <td class="py-3">
                  <v-btn
                    icon
                    size="x-small"
                    variant="text"
                    @click="toggleExpand(order.id)"
                  >
                    <v-icon>{{ expandedOrders.has(order.id) ? 'mdi-chevron-down' : 'mdi-chevron-right' }}</v-icon>
                  </v-btn>
                </td>
                <td class="py-3">
                  <div class="d-flex align-center">
                    <v-avatar color="grey-lighten-4" size="36" class="mr-3">
                      <span class="text-primary font-weight-bold text-body-2">{{ order.customer_name?.charAt(0)?.toUpperCase() }}</span>
                    </v-avatar>
                    <span class="font-weight-bold text-body-2">{{ order.customer_name }}</span>
                  </div>
                </td>
                <td class="text-body-2">{{ order.phone }}</td>
                <td>
                  <v-chip
                    size="small"
                    variant="tonal"
                    color="success"
                    class="font-weight-medium"
                  >
                    {{ getItemCount(order) }} item{{ getItemCount(order) !== 1 ? 's' : '' }}
                  </v-chip>
                </td>
                <td class="text-secondary font-weight-bold">
                  {{ CONFIG.CURRENCY_SYMBOL }}{{ formatAmount(order.total_amount || order.price) }}
                </td>
                <td class="text-body-2 text-grey-darken-1">
                  {{ formatDate(order.created_at) }}
                </td>
                <td class="text-center">
                  <v-select
                    v-model="order.status"
                    :items="['pending', 'completed']"
                    variant="plain"
                    density="compact"
                    hide-details
                    class="status-select rounded-lg"
                    :color="order.status === 'completed' ? 'success' : 'warning'"
                    @update:model-value="updateStatus(order)"
                  >
                    <template v-slot:selection="{ item }">
                      <v-chip
                        :color="item.value === 'completed' ? 'success' : 'warning'"
                        size="x-small"
                        variant="flat"
                        class="px-2 font-weight-bold"
                      >
                        {{ (item.title || '').toUpperCase() }}
                      </v-chip>
                    </template>
                  </v-select>
                </td>
                <td class="text-right">
                  <v-btn
                    icon="mdi-printer-outline"
                    variant="text"
                    size="small"
                    :color="order.status === 'completed' ? 'primary' : 'grey'"
                    @click="viewInvoice(order)"
                  ></v-btn>
                </td>
              </tr>

              <!-- Expanded Row: Order Items -->
              <tr v-if="expandedOrders.has(order.id)" class="expanded-row">
                <td colspan="8" class="pa-0">
                  <div class="bg-grey-lighten-5 pa-4 pl-14">
                    <v-table density="compact" class="bg-transparent">
                      <thead>
                        <tr>
                          <th class="text-caption font-weight-bold">Product</th>
                          <th class="text-caption font-weight-bold text-center">Qty</th>
                          <th class="text-caption font-weight-bold text-right">Price</th>
                          <th class="text-caption font-weight-bold text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        <template v-if="order.order_items && order.order_items.length > 0">
                          <tr v-for="item in order.order_items" :key="item.id">
                            <td class="text-body-2">{{ item.product_name }}</td>
                            <td class="text-body-2 text-center">{{ item.quantity }}</td>
                            <td class="text-body-2 text-right">{{ CONFIG.CURRENCY_SYMBOL }}{{ item.price }}</td>
                            <td class="text-body-2 text-right font-weight-bold">{{ CONFIG.CURRENCY_SYMBOL }}{{ item.subtotal }}</td>
                          </tr>
                        </template>
                        <template v-else>
                          <tr>
                            <td class="text-body-2">{{ order.product_name }}</td>
                            <td class="text-body-2 text-center">1</td>
                            <td class="text-body-2 text-right">{{ CONFIG.CURRENCY_SYMBOL }}{{ order.price }}</td>
                            <td class="text-body-2 text-right font-weight-bold">{{ CONFIG.CURRENCY_SYMBOL }}{{ order.price }}</td>
                          </tr>
                        </template>
                      </tbody>
                    </v-table>
                    <div v-if="order.custom_text" class="mt-2 text-caption text-grey-darken-1">
                      <strong>Notes:</strong> {{ order.custom_text }}
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </v-table>
      </div>

      <!-- Empty State -->
      <div v-if="orders.length === 0" class="text-center pa-16">
        <v-icon size="64" color="grey-lighten-2">mdi-clipboard-text-outline</v-icon>
        <h2 class="luxury-font mt-4">No orders yet</h2>
        <p class="text-grey">Your masterpieces are waiting for their first admirers.</p>
      </div>
    </v-card>

    <!-- Premium Invoice Dialog -->
    <v-dialog v-model="invoiceDialog" fullscreen scrollable transition="dialog-bottom-transition">
      <v-card class="bg-grey-lighten-4">
        <v-toolbar color="white" flat class="border-b sticky-top">
          <v-btn icon="mdi-close" @click="invoiceDialog = false"></v-btn>
          <v-toolbar-title class="luxury-font font-weight-bold">OFFICIAL INVOICE</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            prepend-icon="mdi-printer"
            variant="flat"
            class="px-6"
            @click="printInvoice"
          >
            Download / Print A4
          </v-btn>
        </v-toolbar>

        <v-card-text class="pa-0">
          <div id="invoice-print-area" class="invoice-container mx-auto pa-16 bg-white my-10 border shadow-2xl relative">
            <!-- Luxury Watermark -->
            <div class="watermark luxury-font">Nafzz studio</div>

            <!-- Invoice Header -->
            <div class="d-flex justify-space-between mb-16 relative">
              <div>
                <h1 class="luxury-font text-h2 mb-2 text-primary">INVOICE</h1>
                <div class="d-flex flex-column text-grey-darken-1">
                  <span>ID: <b class="text-black">{{ selectedOrder?.id.slice(0, 8).toUpperCase() }}</b></span>
                  <span>DATE: <b class="text-black">{{ new Date().toLocaleDateString('en-IN', { dateStyle: 'long' }) }}</b></span>
                </div>
              </div>
              <div class="text-right">
                <h2 class="luxury-font text-h4 mb-2">{{ CONFIG.APP_NAME }}</h2>
                <div class="text-subtitle-2 text-grey-darken-1">
                  123 Artisan Avenue, Creative District<br>
                  New Delhi, India 110001<br>
                  <v-icon size="14">mdi-email-outline</v-icon> hello@thecraftsstudio.com
                </div>
              </div>
            </div>

            <v-divider class="mb-12 border-opacity-25"></v-divider>

            <!-- Billing Info -->
            <v-row class="mb-16">
              <v-col cols="6">
                <div class="text-overline text-secondary mb-2">BILLED TO</div>
                <h3 class="text-h5 font-weight-bold mb-1">{{ selectedOrder?.customer_name }}</h3>
                <p class="text-grey-darken-1 mb-0">{{ selectedOrder?.phone }}</p>
                <p class="text-grey-darken-1">Order #{{ selectedOrder?.id.split('-')[0] }}</p>
              </v-col>
              <v-col cols="6" class="text-right">
                <div class="text-overline text-secondary mb-2">PAYMENT STATUS</div>
                <v-chip
                  :color="selectedOrder?.status === 'completed' ? 'success' : 'warning'"
                  variant="flat"
                  size="small"
                  class="font-weight-bold"
                >
                  {{ selectedOrder?.status.toUpperCase() }}
                </v-chip>
              </v-col>
            </v-row>

            <!-- Items Table — Multi-product aware -->
            <div class="border rounded-lg overflow-hidden mb-12">
              <v-table class="invoice-table">
                <thead class="bg-grey-lighten-4">
                  <tr>
                    <th class="py-4 font-weight-bold">ITEM DESCRIPTION</th>
                    <th class="py-4 font-weight-bold text-center" style="width: 60px">QTY</th>
                    <th class="py-4 font-weight-bold text-right" style="width: 110px">UNIT PRICE</th>
                    <th class="py-4 font-weight-bold text-right" style="width: 110px">SUBTOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- New multi-item orders -->
                  <template v-if="invoiceItems.length > 0">
                    <tr v-for="item in invoiceItems" :key="item.id">
                      <td class="py-6">
                        <div class="text-subtitle-1 font-weight-bold mb-1">{{ item.product_name }}</div>
                      </td>
                      <td class="text-center font-weight-medium">{{ item.quantity }}</td>
                      <td class="text-right font-weight-medium">
                        {{ CONFIG.CURRENCY_SYMBOL }}{{ item.price }}
                      </td>
                      <td class="text-right text-subtitle-1 font-weight-bold">
                        {{ CONFIG.CURRENCY_SYMBOL }}{{ item.subtotal }}
                      </td>
                    </tr>
                  </template>
                  <!-- Legacy single-item orders (no order_items) -->
                  <template v-else>
                    <tr>
                      <td class="py-8">
                        <div class="text-h6 font-weight-bold mb-1">{{ selectedOrder?.product_name }}</div>
                        <div class="text-body-2 text-grey-darken-1">
                          <em>Personalization:</em> {{ selectedOrder?.custom_text || 'Standard Design' }}
                        </div>
                      </td>
                      <td class="text-center font-weight-medium">1</td>
                      <td class="text-right font-weight-medium">
                        {{ CONFIG.CURRENCY_SYMBOL }}{{ selectedOrder?.price }}
                      </td>
                      <td class="text-right text-h6 font-weight-bold">
                        {{ CONFIG.CURRENCY_SYMBOL }}{{ selectedOrder?.price }}
                      </td>
                    </tr>
                  </template>
                </tbody>
              </v-table>
            </div>

            <!-- Personalization note for multi-item orders -->
            <div v-if="selectedOrder?.custom_text && invoiceItems.length > 0" class="mb-8 pa-4 bg-grey-lighten-4 rounded-lg">
              <div class="text-overline text-secondary mb-1">ORDER NOTES</div>
              <div class="text-body-2 text-grey-darken-1">{{ selectedOrder.custom_text }}</div>
            </div>

            <!-- Totals -->
            <v-row justify="end">
              <v-col cols="12" sm="5">
                <div class="d-flex justify-space-between py-2 border-b">
                  <span class="text-grey">Subtotal</span>
                  <span class="font-weight-bold">{{ CONFIG.CURRENCY_SYMBOL }}{{ invoiceTotal }}</span>
                </div>
                <div class="d-flex justify-space-between py-2 border-b">
                  <span class="text-grey">Tax (0%)</span>
                  <span class="font-weight-bold">{{ CONFIG.CURRENCY_SYMBOL }}0.00</span>
                </div>
                <div class="d-flex justify-space-between py-4 mt-2 bg-primary text-white px-4 rounded-lg">
                  <span class="text-h6 luxury-font">GRAND TOTAL</span>
                  <span class="text-h4 font-weight-bold">{{ CONFIG.CURRENCY_SYMBOL }}{{ invoiceTotal }}</span>
                </div>
              </v-col>
            </v-row>

            <!-- Invoice Footer -->
            <div class="mt-16 pt-16 text-center border-t border-dashed">
              <p class="text-h6 luxury-font mb-1 text-primary">Thank you for your patronage</p>
              <p class="text-body-2 text-grey mb-8">Each piece is handcrafted with love and carries a story of its own.</p>
              <div class="d-flex justify-center gap-4">
                <v-icon color="secondary">mdi-instagram</v-icon>
                <v-icon color="secondary">mdi-youtube</v-icon>
                <span class="text-caption font-weight-bold text-grey">@nafzzcalligraphy</span>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, inject } from 'vue'
import { SupabaseService } from '../services/SupabaseService'
import { CONFIG } from '../config/constants'

const orders = ref([])
const expandedOrders = ref(new Set())
const invoiceDialog = ref(false)
const selectedOrder = ref(null)
const invoiceItems = ref([])
const showMessage = inject('showMessage')
const loading = ref(true)

const invoiceTotal = computed(() => {
  if (invoiceItems.value.length > 0) {
    return invoiceItems.value.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0).toFixed(0)
  }
  return selectedOrder.value?.total_amount || selectedOrder.value?.price || '0'
})

const getItemCount = (order) => {
  if (order.order_items && order.order_items.length > 0) {
    return order.order_items.length
  }
  return 1
}

const toggleExpand = (orderId) => {
  if (expandedOrders.value.has(orderId)) {
    expandedOrders.value.delete(orderId)
  } else {
    expandedOrders.value.add(orderId)
  }
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatAmount = (val) => {
  return Number(val || 0).toLocaleString()
}

const fetchOrders = () => {
  console.log('OrderManagement: fetchOrders started')
  loading.value = true
  SupabaseService.getOrdersWithItems()
    .then((data) => {
      console.log('OrderManagement: fetchOrders success', data)
      orders.value = data
    })
    .catch(() => {
      // Fallback to legacy getOrders if order_items table doesn't exist yet
      SupabaseService.getOrders()
        .then((data) => {
          orders.value = data
        })
        .catch(() => {
          showMessage('Error fetching orders', 'error')
        })
    })
    .finally(() => {
      loading.value = false
    })
}

const updateStatus = (order) => {
  SupabaseService.updateOrderStatus(order.id, order.status)
    .then(() => {
      showMessage(`Order marked as ${order.status}`)
      fetchOrders()
    })
    .catch(() => {
      showMessage('Error updating status', 'error')
    })
}

const viewInvoice = (order) => {
  selectedOrder.value = order

  if (order.order_items && order.order_items.length > 0) {
    invoiceItems.value = order.order_items
    invoiceDialog.value = true
  } else {
    SupabaseService.getOrderItems(order.id)
      .then((items) => {
        invoiceItems.value = items || []
      })
      .catch(() => {
        invoiceItems.value = []
      })
      .finally(() => {
        invoiceDialog.value = true
      })
  }
}

const printInvoice = () => {
  window.print()
}

// Subscriptions
let orderSub = null

onMounted(() => {
  try {
    console.log('OrderManagement: mounted start')
    fetchOrders()
    orderSub = SupabaseService.subscribeToOrders('mgmt-orders', () => {
      fetchOrders()
    })
  } catch (err) {
    console.error('OrderManagement: mounted error', err)
  }
})

onUnmounted(() => {
  if (orderSub) orderSub.unsubscribe()
})
</script>

<style scoped>
.orders-table {
  min-width: 800px;
}

.status-select {
  width: 140px;
  margin: 0 auto;
}

.order-row {
  cursor: pointer;
}

.expanded-row td {
  border-bottom: none !important;
}

.invoice-container {
  max-width: 210mm;
  min-height: 297mm;
  position: relative;
  overflow: hidden;
}

.watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  font-size: 8rem;
  opacity: 0.03;
  pointer-events: none;
  white-space: nowrap;
}

.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
}

.gap-4 {
  gap: 16px;
}

@media print {
  body * {
    visibility: hidden;
  }
  #invoice-print-area, #invoice-print-area * {
    visibility: visible;
  }
  #invoice-print-area {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    height: 100% !important;
    border: none !important;
    box-shadow: none !important;
    margin: 0 !important;
    padding: 15mm !important;
  }
  .v-toolbar, .v-btn {
    display: none !important;
  }
}
</style>
