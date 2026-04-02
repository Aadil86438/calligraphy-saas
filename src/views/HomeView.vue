<template>
  <v-main>
    <!-- Add Navbar -->
    <v-app-bar flat color="white" class="px-md-10">
      <v-toolbar-title class="luxury-font font-weight-bold">ARTISAN CALLIGRAPHY</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn variant="text" to="/admin">Admin</v-btn>
    </v-app-bar>

    <v-container class="mt-10">
      <div class="text-center mb-16">
        <h1 class="text-h2 mb-4 luxury-font">Timeless Art, Personally Penned</h1>
        <p class="text-subtitle-1 text-grey-darken-1">Discover handcrafted calligraphy pieces for your most cherished moments.</p>
      </div>

      <v-row v-if="loading">
        <v-col v-for="i in 3" :key="i" cols="12" sm="6" md="4">
          <v-skeleton-loader type="card"></v-skeleton-loader>
        </v-col>
      </v-row>

      <v-row v-else>
        <v-col v-for="product in products" :key="product.id" cols="12" sm="6" md="4">
          <v-card flat class="product-card">
            <v-img
              :src="product.image_url"
              height="400"
              cover
              class="rounded-lg bg-grey-lighten-4"
            >
              <template v-slot:placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular indeterminate color="grey-lighten-1"></v-progress-circular>
                </v-row>
              </template>
            </v-img>
            <v-card-title class="px-0 pt-4 luxury-font">{{ product.name }}</v-card-title>
            <v-card-subtitle class="px-0 text-primary font-weight-bold">${{ product.price }}</v-card-subtitle>
            <v-card-actions class="px-0 pb-4">
              <v-btn
                block
                variant="outlined"
                color="primary"
                @click="openOrderDialog(product)"
                class="mt-2"
              >
                Order Now
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Footer -->
    <v-footer class="text-center d-flex flex-column bg-grey-lighten-4 py-10 mt-16">
      <div class="luxury-font font-weight-bold text-h5 mb-4">ARTISAN CALLIGRAPHY</div>
      <div class="text-grey mb-4">© 2026 Crafted with Passion</div>
    </v-footer>

    <!-- Order Dialog -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card class="pa-4">
        <v-card-title class="luxury-font text-h5">Place Your Order</v-card-title>
        <v-card-subtitle v-if="selectedProduct">Ordering: {{ selectedProduct.name }}</v-card-subtitle>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-text-field
              v-model="orderForm.customer_name"
              label="Full Name"
              :rules="[v => !!v || 'Required']"
              variant="outlined"
            ></v-text-field>
            <v-text-field
              v-model="orderForm.phone"
              label="WhatsApp Phone Number"
              placeholder="+1..."
              :rules="[v => !!v || 'Required']"
              variant="outlined"
            ></v-text-field>
            <v-textarea
              v-model="orderForm.custom_text"
              label="Custom Text (What should I write?)"
              rows="3"
              variant="outlined"
            ></v-textarea>
            <v-textarea
              v-model="orderForm.notes"
              label="Special Notes"
              rows="2"
              variant="outlined"
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="orderLoading"
            @click="submitOrder"
          >
            Confirm Order
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-main>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { SupabaseService } from '../services/SupabaseService'

const products = ref([])
const loading = ref(true)
const dialog = ref(false)
const selectedProduct = ref(null)
const orderLoading = ref(false)
const valid = ref(false)
const form = ref(null)
const showMessage = inject('showMessage')

const orderForm = ref({
  customer_name: '',
  phone: '',
  custom_text: '',
  notes: ''
})

const fetchProducts = async () => {
  try {
    products.value = await SupabaseService.getProducts()
  } catch (error) {
    showMessage('Failed to load products', 'error')
  } finally {
    loading.value = false
  }
}

const openOrderDialog = (product) => {
  selectedProduct.value = product
  dialog.value = true
}

const submitOrder = async () => {
  const { valid: isFormValid } = await form.value.validate()
  if (!isFormValid) return

  orderLoading.value = true
  try {
    const orderData = {
      ...orderForm.value,
      product_id: selectedProduct.value.id,
      product_name: selectedProduct.value.name,
      price: selectedProduct.value.price,
      status: 'pending'
    }

    await SupabaseService.createOrder(orderData)
    showMessage('Order placed successfully!')

    // WhatsApp Redirection
    const message = `Hello! I'd like to order:
*Product:* ${selectedProduct.value.name}
*Price:* $${selectedProduct.value.price}
*Custom Text:* ${orderForm.value.custom_text || 'None'}
*Notes:* ${orderForm.value.notes || 'None'}

Order placed by: ${orderForm.value.customer_name} (${orderForm.value.phone})`

    const whatsappUrl = `https://wa.me/YOUR_PHONE_NUMBER?text=${encodeURIComponent(message)}`
    window.location.href = whatsappUrl

    dialog.value = false
    // Reset form
    Object.keys(orderForm.value).forEach(key => orderForm.value[key] = '')
  } catch (error) {
    showMessage('Error submitting order', 'error')
  } finally {
    orderLoading.value = false
  }
}

onMounted(() => {
  fetchProducts()
  // Real-time subscription
  SupabaseService.subscribeToProducts((payload) => {
    fetchProducts()
  })
})
</script>

<style scoped>
.product-card {
  transition: transform 0.3s ease;
}
.product-card:hover {
  transform: translateY(-5px);
}
</style>
