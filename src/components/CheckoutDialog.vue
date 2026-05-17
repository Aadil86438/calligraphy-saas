<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="700"
    persistent
    transition="dialog-bottom-transition"
    :fullscreen="isMobile"
    scrollable
  >
    <v-card class="rounded-xl overflow-hidden checkout-card">
      <!-- Header -->
      <v-toolbar color="white" flat class="border-b px-2 flex-shrink-0">
        <v-btn icon="mdi-close" variant="text" @click="closeDialog" :disabled="isProcessing"></v-btn>
        <v-toolbar-title class="luxury-font font-weight-bold">Checkout</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-chip color="secondary" variant="flat" size="small" class="mr-2">
          {{ cart.cartCount }} item{{ cart.cartCount !== 1 ? 's' : '' }}
        </v-chip>
      </v-toolbar>

      <v-card-text class="pa-0 safe-flex-scroll">
        <!-- Order Summary -->
        <div class="pa-6 bg-surface-variant">
          <div class="luxury-font text-overline text-secondary font-weight-bold mb-3">ORDER SUMMARY</div>
          <div class="border rounded-lg overflow-hidden bg-surface">
            <v-table density="comfortable" class="checkout-table">
              <thead class="bg-grey-lighten-4">
                <tr>
                  <th class="text-left">Item</th>
                  <th class="text-center" style="width: 70px">Qty</th>
                  <th class="text-right" style="width: 100px">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in cart.items" :key="item.product_id">
                  <td>
                    <div class="d-flex align-center py-2">
                      <v-avatar size="40" class="rounded mr-3 border flex-shrink-0">
                        <v-img :src="item.image_url" cover></v-img>
                      </v-avatar>
                      <div class="min-width-0">
                        <div class="font-weight-bold text-body-2 text-truncate">{{ item.name }}</div>
                        <div class="text-caption text-grey">{{ CONFIG.CURRENCY_SYMBOL }}{{ item.price }} each</div>
                      </div>
                    </div>
                  </td>
                  <td class="text-center font-weight-bold">{{ item.quantity }}</td>
                  <td class="text-right font-weight-bold text-primary">
                    {{ CONFIG.CURRENCY_SYMBOL }}{{ (item.price * item.quantity).toFixed(0) }}
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>

          <!-- Grand Total -->
          <div class="d-flex justify-space-between align-center mt-4 pa-4 bg-primary rounded-lg">
            <span class="text-white luxury-font text-subtitle-1">Grand Total</span>
            <span class="text-white text-h5 font-weight-bold">
              {{ CONFIG.CURRENCY_SYMBOL }}{{ cart.cartTotal.toFixed(0) }}
            </span>
          </div>
        </div>

        <!-- Customer Form -->
        <div class="pa-6">
          <div class="luxury-font text-overline text-secondary font-weight-bold mb-3">YOUR DETAILS</div>

          <v-form ref="checkoutForm" v-model="formValid">
            <v-text-field
              v-model="customerForm.name"
              label="Your Name"
              placeholder="Enter your full name"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-account-outline"
              :rules="nameRules"
              required
              class="mb-1"
            ></v-text-field>

            <v-text-field
              v-model="customerForm.phone"
              label="WhatsApp Number"
              placeholder="10-digit mobile number"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-whatsapp"
              :rules="phoneRules"
              required
              maxlength="10"
              class="mb-1"
            ></v-text-field>

            <v-textarea
              v-model="customerForm.notes"
              label="Order Notes (Optional)"
              placeholder="Any special instructions or personalization details"
              variant="outlined"
              rows="3"
              auto-grow
              counter
              maxlength="300"
            ></v-textarea>
          </v-form>
        </div>
      </v-card-text>

      <!-- Action Footer -->
      <v-divider></v-divider>
      <div class="pa-4 pa-md-6 bg-surface shadow-top flex-shrink-0">
        <v-btn
          block
          color="primary"
          size="x-large"
          :loading="isProcessing"
          :disabled="isProcessing || cart.isEmpty"
          @click="handleCheckout"
          class="font-weight-bold text-subtitle-1 rounded-pill"
          elevation="8"
        >
          Confirm & Order via WhatsApp
          <v-icon end class="ml-2">mdi-whatsapp</v-icon>
        </v-btn>
        <div class="text-caption text-center mt-3 text-grey">
          Your order details will open in WhatsApp
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, inject, computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useCartStore } from '../stores/cart'
import { SupabaseService } from '../services/SupabaseService'
import { CONFIG } from '../config/constants'

const cart = useCartStore()
const showMessage = inject('showMessage')
const { smAndDown: isMobile } = useDisplay()

const props = defineProps({
  modelValue: Boolean
})
const emit = defineEmits(['update:modelValue'])

const checkoutForm = ref(null)
const formValid = ref(false)
const isProcessing = ref(false)

const customerForm = ref({
  name: '',
  phone: '',
  notes: ''
})

const nameRules = [
  v => !!v || 'Name is required',
  v => /^[a-zA-Z\s]+$/.test(v) || 'Only letters and spaces allowed'
]

const phoneRules = [
  v => !!v || 'WhatsApp number is required',
  v => /^[6-9]\d{9}$/.test(v) || 'Enter a valid 10-digit Indian mobile number'
]

const closeDialog = () => {
  if (!isProcessing.value) {
    emit('update:modelValue', false)
  }
}

const handleCheckout = async () => {
  const { valid } = await checkoutForm.value.validate()
  if (!valid) return
  if (cart.isEmpty) {
    showMessage('Your cart is empty', 'error')
    return
  }
  if (isProcessing.value) return // Double-click guard

  isProcessing.value = true

  try {
    // 1. Build order payload
    const totalAmount = cart.cartTotal
    const orderPayload = {
      customer_name: customerForm.value.name.trim(),
      phone: customerForm.value.phone.trim(),
      custom_text: customerForm.value.notes.trim() || '',
      notes: customerForm.value.notes.trim() || '',
      // Legacy fields for backward compat — store first item's info
      product_id: cart.items[0].product_id,
      product_name: cart.items.length === 1
        ? cart.items[0].name
        : `${cart.items.length} items`,
      price: totalAmount,
      total_amount: totalAmount,
      status: 'pending'
    }

    // 2. Build order_items payload
    const itemsPayload = cart.items.map(item => ({
      product_id: item.product_id,
      product_name: item.name,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity
    }))

    // 3. Create order + items atomically
    await SupabaseService.createOrderWithItems(orderPayload, itemsPayload)

    showMessage('Order recorded! Redirecting to WhatsApp...')

    // 4. Build WhatsApp message
    let itemLines = ''
    cart.items.forEach((item, index) => {
      itemLines += `${index + 1}. *${item.name}*\n`
      itemLines += `   Qty: ${item.quantity}\n`
      itemLines += `   Price: ${CONFIG.CURRENCY_SYMBOL}${item.price}\n`
      itemLines += `   Subtotal: ${CONFIG.CURRENCY_SYMBOL}${(item.price * item.quantity).toFixed(0)}\n\n`
    })

    const message = `*NEW ORDER FROM ${CONFIG.APP_NAME}*
━━━━━━━━━━━━━━

${itemLines}━━━━━━━━━━━━━━
*Grand Total: ${CONFIG.CURRENCY_SYMBOL}${totalAmount.toFixed(0)}*

*Customer:* ${customerForm.value.name}
*Phone:* ${customerForm.value.phone}

*Notes:* ${customerForm.value.notes || 'None'}

Please confirm my order. Thank you!`

    const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`

    // 5. Clear cart + redirect
    setTimeout(() => {
      cart.clearCart()
      emit('update:modelValue', false)
      // Reset form
      customerForm.value = { name: '', phone: '', notes: '' }
      window.open(whatsappUrl, '_blank')
    }, 1500)
  } catch (error) {
    showMessage(error.message || 'Error placing order. Please try again.', 'error')
  } finally {
    isProcessing.value = false
  }
}
</script>

<style scoped>
.checkout-card {
  max-height: 95vh;
  display: flex;
  flex-direction: column;
}

.checkout-table {
  font-size: 0.875rem;
}

.shadow-top {
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.05);
}

.min-width-0 {
  min-width: 0;
}
</style>
