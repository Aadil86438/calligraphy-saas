<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="550"
    persistent
    transition="dialog-bottom-transition"
    :fullscreen="isMobile"
    scrollable
  >
    <v-card class="rounded-xl overflow-hidden purchase-card">
      <!-- Header -->
      <v-toolbar color="white" flat class="border-b px-2">
        <v-btn icon="mdi-close" variant="text" @click="handleClose" :disabled="isProcessing"></v-btn>
        <v-toolbar-title class="luxury-font font-weight-bold">
          {{ step === 'download' ? 'Download Ready' : 'Purchase Digital Product' }}
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-chip v-if="step !== 'download'" color="info" variant="flat" size="small" class="mr-2">
          Step {{ step === 'payment' ? '1' : '2' }}/2
        </v-chip>
      </v-toolbar>

      <v-card-text class="pa-0 overflow-y-auto" style="max-height: calc(100vh - 180px)">

        <!-- ═══ STEP 1: PAYMENT ═══ -->
        <div v-if="step === 'payment'" class="pa-6">
          <!-- Product Info -->
          <div class="d-flex align-center mb-6 pa-4 bg-grey-lighten-4 rounded-lg">
            <v-avatar size="56" class="rounded-lg mr-4 border flex-shrink-0">
              <v-img :src="product?.preview_image_url" cover></v-img>
            </v-avatar>
            <div class="min-width-0 flex-grow-1">
              <div class="font-weight-bold text-body-1 text-truncate">{{ product?.title }}</div>
              <div class="text-caption text-grey">Digital Download • PDF</div>
            </div>
            <div class="text-h5 font-weight-bold text-primary ml-4">
              {{ CONFIG.CURRENCY_SYMBOL }}{{ product?.price }}
            </div>
          </div>

          <!-- QR Code -->
          <div class="text-center mb-6">
            <div class="luxury-font text-overline text-secondary font-weight-bold mb-3">SCAN TO PAY</div>
            <v-card class="mx-auto pa-4 rounded-xl" max-width="300" elevation="2">
              <v-img
                :src="qrCodeUrl"
                width="260"
                height="260"
                class="mx-auto rounded-lg"
              >
                <template v-slot:placeholder>
                  <v-row class="fill-height ma-0" align="center" justify="center">
                    <v-progress-circular indeterminate color="info"></v-progress-circular>
                  </v-row>
                </template>
              </v-img>
              <div class="mt-3 text-caption text-grey-darken-1">
                UPI ID: <strong>{{ CONFIG.UPI_ID }}</strong>
              </div>
              <div class="text-caption text-grey">
                Amount: <strong class="text-primary">{{ CONFIG.CURRENCY_SYMBOL }}{{ product?.price }}</strong>
              </div>
            </v-card>
          </div>

          <!-- Instructions -->
          <v-alert type="info" variant="tonal" class="mb-4 rounded-lg" density="compact">
            <div class="text-body-2">
              <strong>Steps:</strong><br>
              1. Scan the QR code with any UPI app<br>
              2. Pay <strong>{{ CONFIG.CURRENCY_SYMBOL }}{{ product?.price }}</strong> exactly<br>
              3. Note your <strong>Transaction ID</strong> from the payment confirmation<br>
              4. Click "I've Paid" below
            </div>
          </v-alert>

          <!-- Manual UPI copy -->
          <div class="d-flex align-center pa-3 bg-surface-variant rounded-lg mb-4">
            <v-icon color="secondary" class="mr-3">mdi-content-copy</v-icon>
            <div class="flex-grow-1">
              <div class="text-caption text-grey">Copy UPI ID for manual payment</div>
              <div class="font-weight-bold text-body-2">{{ CONFIG.UPI_ID }}</div>
            </div>
            <v-btn size="small" variant="tonal" color="secondary" @click="copyUpiId">
              Copy
            </v-btn>
          </div>
        </div>

        <!-- ═══ STEP 2: CONFIRMATION ═══ -->
        <div v-if="step === 'confirm'" class="pa-6">
          <div class="text-center mb-6">
            <v-icon color="success" size="48" class="mb-2">mdi-check-circle-outline</v-icon>
            <h3 class="luxury-font text-h6 mb-1">Payment Done?</h3>
            <p class="text-body-2 text-grey">Enter your payment details below to unlock your download.</p>
          </div>

          <v-form ref="confirmForm" v-model="formValid">
            <v-text-field
              v-model="form.transaction_id"
              label="Transaction ID / UTR Number"
              placeholder="e.g. T2405160012345678"
              variant="outlined"
              prepend-inner-icon="mdi-identifier"
              :rules="txnRules"
              required
              hint="10–40 characters, letters and numbers only"
              persistent-hint
              class="mb-2"
            ></v-text-field>

            <v-text-field
              v-model="form.customer_name"
              label="Your Name"
              placeholder="Enter your full name"
              variant="outlined"
              prepend-inner-icon="mdi-account-outline"
              :rules="nameRules"
              required
              class="mb-2"
            ></v-text-field>

            <v-text-field
              v-model="form.phone"
              label="WhatsApp Number"
              placeholder="10-digit mobile number"
              variant="outlined"
              prepend-inner-icon="mdi-whatsapp"
              :rules="phoneRules"
              required
              maxlength="10"
              class="mb-2"
            ></v-text-field>

            <v-checkbox
              v-model="form.confirmed"
              :rules="[v => !!v || 'You must confirm payment']"
              color="success"
              class="mt-0"
            >
              <template v-slot:label>
                <span class="text-body-2">
                  I confirm that I have completed the payment of
                  <strong class="text-primary">{{ CONFIG.CURRENCY_SYMBOL }}{{ product?.price }}</strong>
                </span>
              </template>
            </v-checkbox>
          </v-form>

          <!-- Error display -->
          <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4 rounded-lg" closable @click:close="errorMessage = ''">
            {{ errorMessage }}
          </v-alert>
        </div>

        <!-- ═══ STEP 3: DOWNLOAD ═══ -->
        <div v-if="step === 'download'" class="pa-6 text-center">
          <div class="mb-6">
            <v-icon color="success" size="80" class="mb-4">mdi-check-decagram</v-icon>
            <h2 class="luxury-font text-h5 mb-2">Payment Verified!</h2>
            <p class="text-body-1 text-grey">Your download is ready.</p>
          </div>

          <!-- Product info -->
          <v-card class="pa-4 rounded-xl mb-6 text-left" variant="tonal" color="success">
            <div class="d-flex align-center">
              <v-avatar size="48" class="rounded-lg mr-4">
                <v-img :src="product?.preview_image_url" cover></v-img>
              </v-avatar>
              <div>
                <div class="font-weight-bold">{{ product?.title }}</div>
                <div class="text-caption">{{ CONFIG.CURRENCY_SYMBOL }}{{ product?.price }} • PDF Download</div>
              </div>
            </div>
          </v-card>

          <!-- Download Button -->
          <v-btn
            block
            color="success"
            size="x-large"
            :loading="isDownloading"
            :disabled="isDownloading"
            @click="handleDownload"
            class="font-weight-bold text-subtitle-1 rounded-pill mb-4"
            elevation="8"
          >
            <v-icon start>mdi-download</v-icon>
            Download PDF
          </v-btn>

          <!-- Download counter -->
          <div class="text-caption text-grey mb-4">
            Downloads remaining:
            <strong :class="remainingDownloads <= 1 ? 'text-error' : 'text-success'">
              {{ remainingDownloads }} / {{ CONFIG.DIGITAL_DOWNLOAD_LIMIT }}
            </strong>
          </div>

          <!-- Limit warning -->
          <v-alert v-if="remainingDownloads <= 0" type="warning" variant="tonal" class="rounded-lg text-left">
            <div class="text-body-2">
              Download limit reached. Need more downloads?
              <a :href="whatsappSupportUrl" target="_blank" class="font-weight-bold text-decoration-none">
                Contact us via WhatsApp
              </a>
            </div>
          </v-alert>

          <!-- Download error -->
          <v-alert v-if="downloadError" type="error" variant="tonal" class="mt-4 rounded-lg" closable @click:close="downloadError = ''">
            {{ downloadError }}
          </v-alert>
        </div>
      </v-card-text>

      <!-- Action Footer -->
      <v-divider></v-divider>
      <div class="pa-4 pa-md-6 bg-surface">
        <template v-if="step === 'payment'">
          <v-btn
            block
            color="success"
            size="x-large"
            @click="step = 'confirm'"
            class="font-weight-bold text-subtitle-1 rounded-pill"
            elevation="4"
          >
            <v-icon start>mdi-check</v-icon>
            I've Paid — Enter Transaction ID
          </v-btn>
          <div class="text-caption text-center mt-3 text-grey">
            Make sure you've completed payment before proceeding
          </div>
        </template>

        <template v-if="step === 'confirm'">
          <v-btn
            block
            color="primary"
            size="x-large"
            :loading="isProcessing"
            :disabled="isProcessing || !formValid"
            @click="handleConfirm"
            class="font-weight-bold text-subtitle-1 rounded-pill mb-2"
            elevation="8"
          >
            <v-icon start>mdi-shield-check</v-icon>
            Verify & Unlock Download
          </v-btn>
          <v-btn
            block
            variant="text"
            size="small"
            @click="step = 'payment'"
            :disabled="isProcessing"
            class="text-grey"
          >
            ← Back to payment
          </v-btn>
        </template>

        <template v-if="step === 'download'">
          <v-btn
            block
            variant="tonal"
            size="large"
            @click="handleClose"
            class="rounded-pill"
          >
            Done
          </v-btn>
        </template>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue'
import { useDisplay } from 'vuetify'
import { DigitalProductService } from '../services/DigitalProductService'
import { CONFIG } from '../config/constants'

const { smAndDown: isMobile } = useDisplay()
const showMessage = inject('showMessage')

const props = defineProps({
  modelValue: Boolean,
  product: Object
})
const emit = defineEmits(['update:modelValue', 'purchased'])

// State
const step = ref('payment')
const formValid = ref(false)
const isProcessing = ref(false)
const isDownloading = ref(false)
const errorMessage = ref('')
const downloadError = ref('')
const confirmForm = ref(null)
const createdOrder = ref(null)
const remainingDownloads = ref(CONFIG.DIGITAL_DOWNLOAD_LIMIT)

const form = ref({
  transaction_id: '',
  customer_name: '',
  phone: '',
  confirmed: false
})

// Validation rules
const txnRules = [
  v => !!v || 'Transaction ID is required',
  v => /^[A-Za-z0-9]{10,40}$/.test(v?.trim()) || 'Must be 10–40 alphanumeric characters (no spaces or special characters)'
]

const nameRules = [
  v => !!v || 'Name is required',
  v => v?.trim().length >= 2 || 'Enter your full name'
]

const phoneRules = [
  v => !!v || 'Phone number is required',
  v => /^[6-9]\d{9}$/.test(v) || 'Enter a valid 10-digit Indian mobile number'
]

// Dynamic QR code URL with amount baked in
const qrCodeUrl = computed(() => {
  if (!props.product) return ''
  const upiUrl = `upi://pay?pa=${CONFIG.UPI_ID}&pn=${encodeURIComponent(CONFIG.UPI_NAME)}&am=${props.product.price}&cu=INR`
  return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(upiUrl)}&size=280x280&margin=10`
})

// WhatsApp support link
const whatsappSupportUrl = computed(() => {
  const msg = `Hi, I need additional downloads for my order. Transaction ID: ${form.value.transaction_id}`
  return `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`
})

// Copy UPI ID
const copyUpiId = () => {
  navigator.clipboard.writeText(CONFIG.UPI_ID)
    .then(() => showMessage('UPI ID copied!'))
    .catch(() => showMessage('Copy failed — use the UPI ID shown above', 'warning'))
}

// Handle payment confirmation
const handleConfirm = async () => {
  const { valid } = await confirmForm.value.validate()
  if (!valid) return
  if (isProcessing.value) return

  isProcessing.value = true
  errorMessage.value = ''

  try {
    const order = await DigitalProductService.createDigitalOrder({
      digital_product_id: props.product.id,
      customer_name: form.value.customer_name.trim(),
      phone: form.value.phone.trim(),
      transaction_id: form.value.transaction_id.trim(),
      amount: props.product.price
    })

    createdOrder.value = order
    remainingDownloads.value = CONFIG.DIGITAL_DOWNLOAD_LIMIT
    step.value = 'download'
    showMessage('Payment verified! Your download is ready.', 'success')
    emit('purchased', order)
  } catch (err) {
    errorMessage.value = err.message || 'Verification failed. Please try again.'
  } finally {
    isProcessing.value = false
  }
}

// Handle download
const handleDownload = async () => {
  if (!createdOrder.value) return
  isDownloading.value = true
  downloadError.value = ''

  try {
    const result = await DigitalProductService.processDownload(createdOrder.value.id)
    remainingDownloads.value = result.remainingDownloads

    // Trigger download
    const link = document.createElement('a')
    link.href = result.signedUrl
    link.download = `${result.fileName}.pdf`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showMessage('Download started!', 'success')
  } catch (err) {
    downloadError.value = err.message || 'Download failed. Please try again.'
    if (err.message?.includes('limit reached')) {
      remainingDownloads.value = 0
    }
  } finally {
    isDownloading.value = false
  }
}

// Handle close
const handleClose = () => {
  if (!isProcessing.value) {
    emit('update:modelValue', false)
  }
}

// Reset state when dialog opens with new product
watch(() => props.modelValue, (val) => {
  if (val) {
    step.value = 'payment'
    form.value = { transaction_id: '', customer_name: '', phone: '', confirmed: false }
    errorMessage.value = ''
    downloadError.value = ''
    createdOrder.value = null
    remainingDownloads.value = CONFIG.DIGITAL_DOWNLOAD_LIMIT
  }
})
</script>

<style scoped>
.purchase-card {
  max-height: 95vh;
  display: flex;
  flex-direction: column;
}

.min-width-0 {
  min-width: 0;
}
</style>
