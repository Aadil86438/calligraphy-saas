<template>
  <v-container fluid class="pa-0">
    <div class="d-flex align-center justify-space-between mb-8">
      <div>
        <h1 class="text-h4 luxury-font mb-1 text-primary">Order Management</h1>
        <p class="text-subtitle-2 text-grey">Track and fulfill your customer requests</p>
      </div>
    </div>

    <!-- Stats Row -->
    <v-row class="mb-8">
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-6 border-thin shadow-sm">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-overline text-grey-darken-1 mb-1">Total Orders</div>
              <div class="text-h4 font-weight-bold">{{ orders.length }}</div>
            </div>
            <v-icon color="primary" size="40">mdi-cart-outline</v-icon>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-6 border-thin shadow-sm">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-overline text-warning mb-1">Pending</div>
              <div class="text-h4 font-weight-bold text-warning">{{ orders.filter(o => o.status === 'pending').length }}</div>
            </div>
            <v-icon color="warning" size="40">mdi-clock-outline</v-icon>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-6 border-thin shadow-sm text-success">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-overline text-success mb-1">Revenue</div>
              <div class="text-h4 font-weight-bold">{{ CONFIG.CURRENCY_SYMBOL }}{{ totalRevenue }}</div>
            </div>
            <v-icon color="success" size="40">mdi-cash-multiple</v-icon>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Orders Table -->
    <v-card class="border-thin shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <v-table hover class="min-width-800">
          <thead class="bg-grey-lighten-4">
            <tr>
              <th class="font-weight-bold py-4">Customer</th>
              <th class="font-weight-bold py-4">Product</th>
              <th class="font-weight-bold py-4">Amount</th>
              <th class="font-weight-bold py-4">Placed On</th>
              <th class="font-weight-bold py-4 text-center">Status</th>
              <th class="font-weight-bold py-4 text-right">Invoice</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id">
              <td class="py-4">
                <div class="font-weight-bold text-subtitle-1">{{ order.customer_name }}</div>
                <div class="text-caption text-secondary d-flex align-center">
                  <v-icon size="14" class="mr-1">mdi-whatsapp</v-icon>
                  {{ order.phone }}
                </div>
              </td>
              <td>
                <div class="font-weight-medium">{{ order.product_name }}</div>
                <div class="text-caption text-grey text-truncate" style="max-width: 200px">
                  {{ order.custom_text || 'No personalization' }}
                </div>
              </td>
              <td class="font-weight-bold text-primary">
                {{ CONFIG.CURRENCY_SYMBOL }}{{ order.price }}
              </td>
              <td>
                <div class="text-body-2">{{ new Date(order.created_at).toLocaleDateString() }}</div>
                <div class="text-caption text-grey">{{ new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</div>
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
                  v-if="order.status === 'completed'"
                  icon="mdi-printer-outline"
                  variant="text"
                  color="primary"
                  @click="viewInvoice(order)"
                ></v-btn>
                <v-btn
                  v-else
                  icon="mdi-eye-outline"
                  variant="text"
                  color="grey"
                  @click="viewInvoice(order)"
                ></v-btn>
              </td>
            </tr>
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

            <!-- Items Table -->
            <div class="border rounded-lg overflow-hidden mb-12">
              <v-table class="invoice-table">
                <thead class="bg-grey-lighten-4">
                  <tr>
                    <th class="py-4 font-weight-bold">ITEM DESCRIPTION</th>
                    <th class="py-4 font-weight-bold text-right">TOTAL AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="py-8">
                      <div class="text-h6 font-weight-bold mb-1">{{ selectedOrder?.product_name }}</div>
                      <div class="text-body-2 text-grey-darken-1">
                        <em>Personalization:</em> {{ selectedOrder?.custom_text || 'Standard Design' }}
                      </div>
                    </td>
                    <td class="text-right text-h6 font-weight-bold">
                      {{ CONFIG.CURRENCY_SYMBOL }}{{ selectedOrder?.price }}
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>

            <!-- Totals -->
            <v-row justify="end">
              <v-col cols="12" sm="5">
                <div class="d-flex justify-space-between py-2 border-b">
                  <span class="text-grey">Subtotal</span>
                  <span class="font-weight-bold">{{ CONFIG.CURRENCY_SYMBOL }}{{ selectedOrder?.price }}</span>
                </div>
                <div class="d-flex justify-space-between py-2 border-b">
                  <span class="text-grey">Tax (0%)</span>
                  <span class="font-weight-bold">{{ CONFIG.CURRENCY_SYMBOL }}0.00</span>
                </div>
                <div class="d-flex justify-space-between py-4 mt-2 bg-primary text-white px-4 rounded-lg">
                  <span class="text-h6 luxury-font">GRAND TOTAL</span>
                  <span class="text-h4 font-weight-bold">{{ CONFIG.CURRENCY_SYMBOL }}{{ selectedOrder?.price }}</span>
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
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import { SupabaseService } from '../services/SupabaseService'
import { CONFIG } from '../config/constants'

const orders = ref([])
const invoiceDialog = ref(false)
const selectedOrder = ref(null)
const showMessage = inject('showMessage')
const setLoading = inject('setLoading')

const totalRevenue = computed(() => {
  return orders.value
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + parseFloat(o.price || 0), 0)
    .toFixed(2)
})

const fetchOrders = () => {
  setLoading(true)
  SupabaseService.getOrders()
    .then((data) => {
      orders.value = data
    })
    .catch(() => {
      showMessage('Error fetching orders', 'error')
    })
    .finally(() => {
      setLoading(false)
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
  invoiceDialog.value = true
}

const printInvoice = () => {
  window.print()
}

// Subscriptions
let orderSub = null

onMounted(() => {
  fetchOrders()
  orderSub = SupabaseService.subscribeToOrders(() => {
    fetchOrders()
  })
})

onUnmounted(() => {
  if (orderSub) orderSub.unsubscribe()
})
</script>

<style scoped>
.min-width-800 {
  min-width: 800px;
}

.status-select {
  width: 140px;
  margin: 0 auto;
}

.invoice-container {
  max-width: 210mm; /* A4 Width */
  min-height: 297mm; /* A4 Height */
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
