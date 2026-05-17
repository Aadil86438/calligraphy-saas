<template>
  <v-navigation-drawer
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    location="right"
    temporary
    width="400"
    class="cart-drawer"
  >
  <div class="safe-flex-column">
    <!-- Header -->
    <div class="pa-6 border-b d-flex align-center justify-space-between flex-shrink-0">
      <div>
        <h3 class="luxury-font text-h6 text-primary">Your Cart</h3>
        <div class="text-caption text-grey">{{ cart.cartCount }} item{{ cart.cartCount !== 1 ? 's' : '' }}</div>
      </div>
      <v-btn
        icon="mdi-close"
        variant="text"
        size="small"
        @click="$emit('update:modelValue', false)"
      ></v-btn>
    </div>

    <!-- Cart Items -->
    <div class="safe-flex-scroll">
      <!-- Empty State -->
      <div v-if="cart.isEmpty" class="text-center pa-16">
        <v-icon size="80" color="grey-lighten-2">mdi-cart-outline</v-icon>
        <h3 class="luxury-font mt-4 text-grey-darken-1">Your cart is empty</h3>
        <p class="text-caption text-grey mt-2">Browse our collection and add pieces you love.</p>
        <v-btn
          variant="outlined"
          color="secondary"
          class="mt-4"
          @click="$emit('update:modelValue', false)"
        >
          Continue Shopping
        </v-btn>
      </div>

      <!-- Items List -->
      <v-list v-else class="pa-0">
        <v-list-item
          v-for="item in cart.items"
          :key="item.product_id"
          class="px-4 py-3 border-b cart-item"
        >
          <div class="d-flex align-start w-100">
            <!-- Thumbnail -->
            <v-avatar size="72" class="rounded-lg mr-4 flex-shrink-0 border">
              <v-img :src="item.image_url" cover></v-img>
            </v-avatar>

            <!-- Details -->
            <div class="flex-grow-1 min-width-0">
              <div class="font-weight-bold text-body-2 text-truncate">{{ item.name }}</div>
              <div class="text-secondary font-weight-bold text-body-2 mt-1">
                {{ CONFIG.CURRENCY_SYMBOL }}{{ item.price }}
              </div>

              <!-- Quantity Controls -->
              <div class="d-flex align-center mt-2">
                <v-btn
                  icon="mdi-minus"
                  size="x-small"
                  variant="outlined"
                  density="compact"
                  color="primary"
                  @click="cart.decreaseQuantity(item.product_id)"
                ></v-btn>
                <span class="mx-3 font-weight-bold text-body-2">{{ item.quantity }}</span>
                <v-btn
                  icon="mdi-plus"
                  size="x-small"
                  variant="outlined"
                  density="compact"
                  color="primary"
                  @click="cart.increaseQuantity(item.product_id)"
                ></v-btn>

                <v-spacer></v-spacer>

                <!-- Subtotal -->
                <span class="font-weight-bold text-body-2 text-primary">
                  {{ CONFIG.CURRENCY_SYMBOL }}{{ (item.price * item.quantity).toFixed(0) }}
                </span>
              </div>
            </div>

            <!-- Remove -->
            <v-btn
              icon="mdi-delete-outline"
              size="x-small"
              variant="text"
              color="error"
              class="ml-1 flex-shrink-0"
              @click="cart.removeFromCart(item.product_id)"
            ></v-btn>
          </div>
        </v-list-item>
      </v-list>
    </div>

    <!-- Footer -->
    <div v-if="!cart.isEmpty" class="pa-6 border-t bg-surface shadow-top flex-shrink-0">
      <div class="d-flex justify-space-between mb-4">
        <span class="text-grey-darken-1 font-weight-medium">Grand Total</span>
        <span class="text-h6 font-weight-bold text-primary">
          {{ CONFIG.CURRENCY_SYMBOL }}{{ cart.cartTotal.toFixed(0) }}
        </span>
      </div>
      <v-btn
        block
        color="primary"
        size="large"
        class="font-weight-bold text-none rounded-pill"
        elevation="4"
        @click="proceedToCheckout"
      >
        Proceed to Checkout
        <v-icon end>mdi-arrow-right</v-icon>
      </v-btn>
      <v-btn
        block
        variant="text"
        size="small"
        color="error"
        class="mt-2 text-none"
        @click="cart.clearCart()"
      >
        Clear Cart
      </v-btn>
    </div>
    </div>
  </v-navigation-drawer>
</template>

<script setup>
import { useCartStore } from '../stores/cart'
import { CONFIG } from '../config/constants'

const cart = useCartStore()

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'checkout'])

const proceedToCheckout = () => {
  emit('update:modelValue', false)
  emit('checkout')
}
</script>

<style scoped>
.cart-drawer {
  z-index: 2100 !important;
}

.cart-item {
  transition: background-color 0.2s ease;
}

.cart-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.shadow-top {
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.05);
}

.min-width-0 {
  min-width: 0;
}

.w-100 {
  width: 100%;
}
</style>
