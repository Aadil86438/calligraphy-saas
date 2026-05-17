<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600"
    persistent
    transition="dialog-bottom-transition"
    :fullscreen="isMobile"
    scrollable
  >
    <v-card class="rounded-xl overflow-hidden checkout-card">
      <!-- Header -->
      <v-toolbar color="white" flat class="border-b px-2 flex-shrink-0">
        <v-btn icon="mdi-close" variant="text" @click="closeDialog" :disabled="isProcessing"></v-btn>
        <v-toolbar-title class="luxury-font font-weight-bold">Order Digital Product</v-toolbar-title>
      </v-toolbar>

      <v-card-text class="pa-0 safe-flex-scroll">
        <!-- Order Summary -->
        <div class="pa-6 bg-surface-variant">
          <div class="luxury-font text-overline text-secondary font-weight-bold mb-3">PRODUCT SUMMARY</div>
          <div class="border rounded-lg overflow-hidden bg-surface pa-4">
            <div class="d-flex align-center">
              <v-avatar size="64" class="rounded mr-4 border flex-shrink-0">
                <v-img :src="product?.preview_image_url" cover></v-img>
              </v-avatar>
              <div class="min-width-0">
                <div class="font-weight-bold text-body-1 text-truncate">{{ product?.title }}</div>
                <div class="text-caption text-grey mt-1">Digital Product</div>
              </div>
            </div>
            <v-divider class="my-4"></v-divider>
            <div class="d-flex justify-space-between align-center">
              <span class="font-weight-medium">Price</span>
              <span class="text-h6 font-weight-bold text-primary">
                {{ CONFIG.CURRENCY_SYMBOL }}{{ product?.price }}
              </span>
            </div>
          </div>

          <v-alert type="info" variant="tonal" class="mt-4 rounded-lg" density="compact" icon="mdi-shield-check">
            <span class="text-caption">After payment confirmation via WhatsApp, you will securely receive the original high-resolution, watermark-free digital file.</span>
          </v-alert>
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
              placeholder="Any special instructions"
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
          color="success"
          size="x-large"
          :loading="isProcessing"
          :disabled="isProcessing"
          @click="handleCheckout"
          class="font-weight-bold text-subtitle-1 rounded-pill"
          elevation="8"
        >
          Confirm & Order via WhatsApp
          <v-icon end class="ml-2">mdi-whatsapp</v-icon>
        </v-btn>
        <div class="text-caption text-center mt-3 text-grey">
          You will be redirected to WhatsApp to send payment screenshot
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, inject, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { CONFIG } from '../config/constants'

const showMessage = inject('showMessage')
const { smAndDown: isMobile } = useDisplay()

const props = defineProps({
  modelValue: Boolean,
  product: Object
})
const emit = defineEmits(['update:modelValue', 'purchased'])

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
  if (isProcessing.value) return

  isProcessing.value = true

  try {
    const message = `Hello ${CONFIG.APP_NAME},

I want to order this digital product:

Product: ${props.product.title}
Price: ${CONFIG.CURRENCY_SYMBOL}${props.product.price}

Customer Name: ${customerForm.value.name.trim()}
Phone: ${customerForm.value.phone.trim()}

Notes: ${customerForm.value.notes.trim() || 'None'}

I will send payment screenshot shortly.`

    const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`

    emit('purchased')

    setTimeout(() => {
      emit('update:modelValue', false)
      customerForm.value = { name: '', phone: '', notes: '' }
      window.open(whatsappUrl, '_blank')
      isProcessing.value = false
    }, 1000)

  } catch (error) {
    showMessage('Error redirecting. Please try again.', 'error')
    isProcessing.value = false
  }
}

watch(() => props.modelValue, (val) => {
  if (val) {
    customerForm.value = { name: '', phone: '', notes: '' }
  }
})
</script>

<style scoped>
.checkout-card {
  max-height: 95vh;
  display: flex;
  flex-direction: column;
}

.shadow-top {
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.05);
}

.min-width-0 {
  min-width: 0;
}
</style>
