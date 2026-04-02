<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-8">
      <h1 class="text-h4 luxury-font">Order Management</h1>
    </div>

    <!-- Stats Row -->
    <v-row class="mb-6">
      <v-col cols="12" sm="4">
        <v-card flat class="rounded-lg pa-4 border">
          <div class="text-overline mb-1">Total Orders</div>
          <div class="text-h4 font-weight-bold">{{ orders.length }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card flat class="rounded-lg pa-4 border">
          <div class="text-overline mb-1">Pending</div>
          <div class="text-h4 font-weight-bold text-warning">{{ orders.filter(o => o.status === 'pending').length }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Orders Table -->
    <v-card flat class="rounded-lg border">
      <v-table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Product</th>
            <th>Price</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td>
              <div class="font-weight-bold">{{ order.customer_name }}</div>
              <div class="text-caption text-grey">{{ order.phone }}</div>
            </td>
            <td>{{ order.product_name }}</td>
            <td>${{ order.price }}</td>
            <td>{{ new Date(order.created_at).toLocaleDateString() }}</td>
            <td>
              <v-select
                v-model="order.status"
                :items="['pending', 'completed']"
                variant="plain"
                density="compact"
                hide-details
                :color="order.status === 'completed' ? 'success' : 'warning'"
                @update:model-value="updateStatus(order)"
              ></v-select>
            </td>
            <td>
              <v-btn
                v-if="order.status === 'completed'"
                prepend-icon="mdi-printer-outline"
                variant="outlined"
                size="small"
                color="primary"
                @click="viewInvoice(order)"
              >
                Invoice
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Invoice Dialog -->
    <v-dialog v-model="invoiceDialog" fullscreen scrollable>
      <v-card>
        <v-toolbar color="white" flat class="border-b">
          <v-btn icon="mdi-close" @click="invoiceDialog = false"></v-btn>
          <v-toolbar-title class="luxury-font">Pro-Forma Invoice</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn color="primary" prepend-icon="mdi-printer" @click="printInvoice">Print A4</v-btn>
        </v-toolbar>
        <v-card-text class="bg-grey-lighten-4 pa-0">
          <div id="invoice-print-area" class="invoice-container mx-auto pa-16 bg-white my-10 border shadow-lg">
            <!-- Invoice Header -->
            <div class="d-flex justify-space-between mb-16">
              <div>
                <h1 class="luxury-font text-h3 mb-2">INVOICE</h1>
                <p class="text-grey mb-1">Invoice #: {{ selectedOrder?.id.slice(0, 8).toUpperCase() }}</p>
                <p class="text-grey">Date: {{ new Date().toLocaleDateString() }}</p>
              </div>
              <div class="text-right">
                <h2 class="luxury-font">Artisan Calligraphy</h2>
                <p class="text-grey">123 Creative Studio Lane</p>
                <p class="text-grey">Artcity, AC 12345</p>
                <p class="text-grey">contact@artisan-cal.com</p>
              </div>
            </div>

            <!-- Customer Info -->
            <div class="mb-16">
              <h3 class="text-overline mb-4">Billed To</h3>
              <p class="text-h5 font-weight-bold mb-1">{{ selectedOrder?.customer_name }}</p>
              <p class="text-grey">{{ selectedOrder?.phone }}</p>
            </div>

            <!-- Table -->
            <v-table class="mb-16 border-b">
              <thead class="bg-grey-lighten-4">
                <tr>
                  <th class="text-left font-weight-bold py-4">DESCRIPTION</th>
                  <th class="text-right font-weight-bold py-4">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="py-6">
                    <div class="text-h6 mb-1">{{ selectedOrder?.product_name }}</div>
                    <div class="text-caption text-grey">Custom Personalization included.</div>
                  </td>
                  <td class="text-right text-h6 font-weight-bold">${{ selectedOrder?.price }}</td>
                </tr>
                <tr>
                  <td class="text-right font-weight-bold py-6 text-h5">TOTAL</td>
                  <td class="text-right text-h5 font-weight-bold text-primary">${{ selectedOrder?.price }}</td>
                </tr>
              </tbody>
            </v-table>

            <!-- Footer -->
            <div class="text-center mt-16 pt-16 border-t font-italic text-grey">
              Thank you for supporting personalized handmade art.
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { SupabaseService } from '../services/SupabaseService'

const orders = ref([])
const invoiceDialog = ref(false)
const selectedOrder = ref(null)
const showMessage = inject('showMessage')

const fetchOrders = async () => {
  try {
    orders.value = await SupabaseService.getOrders()
  } catch (error) {
    showMessage('Error fetching orders', 'error')
  }
}

const updateStatus = async (order) => {
  try {
    await SupabaseService.updateOrderStatus(order.id, order.status)
    showMessage(`Order marked as ${order.status}`)
    fetchOrders()
  } catch (error) {
    showMessage('Error updating status', 'error')
  }
}

const viewInvoice = (order) => {
  selectedOrder.value = order
  invoiceDialog.value = true
}

const printInvoice = () => {
  window.print()
}

onMounted(fetchOrders)
</script>

<style scoped>
.invoice-container {
  max-width: 800px;
  min-height: 1100px; /* Rough A4 ratio */
}

@media print {
  body * {
    visibility: hidden;
  }
  #invoice-print-area, #invoice-print-area * {
    visibility: visible;
  }
  #invoice-print-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    border: none !important;
    box-shadow: none !important;
    margin: 0 !important;
    padding: 20mm !important;
  }
  .v-card-text {
    padding: 0 !important;
    background: white !important;
  }
}
</style>
