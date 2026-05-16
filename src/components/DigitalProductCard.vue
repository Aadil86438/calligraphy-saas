<template>
  <v-card class="digital-card group overflow-hidden" @click="$emit('view', product)">
    <div class="image-container overflow-hidden position-relative">
      <v-img
        :src="product.preview_image_url"
        aspect-ratio="1"
        cover
        class="bg-grey-lighten-4 transition-transform duration-500 product-img"
      >
        <template v-slot:placeholder>
          <v-row class="fill-height ma-0" align="center" justify="center">
            <v-progress-circular indeterminate color="grey-lighten-1"></v-progress-circular>
          </v-row>
        </template>
      </v-img>

      <!-- Digital Badge -->
      <v-chip
        color="info"
        variant="flat"
        size="small"
        class="digital-badge"
        prepend-icon="mdi-download"
      >
        DIGITAL
      </v-chip>

      <!-- PDF indicator -->
      <div class="pdf-indicator">
        <v-icon size="16" color="white">mdi-file-pdf-box</v-icon>
        <span class="text-caption font-weight-bold text-white ml-1">PDF</span>
      </div>
    </div>

    <v-card-text class="px-3 pt-4 pb-1">
      <h3 class="luxury-font text-subtitle-1 font-weight-bold mb-1 text-truncate">
        {{ product.title }}
      </h3>
      <div class="d-flex align-center justify-space-between">
        <span class="text-primary font-weight-bold text-h6">
          {{ CONFIG.CURRENCY_SYMBOL }}{{ product.price }}
        </span>
        <v-chip size="x-small" color="info" variant="tonal">INSTANT</v-chip>
      </div>
    </v-card-text>

    <v-card-actions class="px-3 pb-4 pt-1">
      <v-btn
        block
        color="info"
        variant="flat"
        class="mt-1 text-none font-weight-bold"
        @click.stop="$emit('buy', product)"
      >
        <v-icon start>mdi-flash</v-icon>
        Buy Now — Instant Download
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { CONFIG } from '../config/constants'

defineProps({
  product: { type: Object, required: true }
})

defineEmits(['view', 'buy'])
</script>

<style scoped>
.digital-card {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
}

.digital-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(30, 136, 229, 0.15) !important;
}

.digital-card:hover .product-img {
  transform: scale(1.05);
}

.image-container {
  position: relative;
}

.product-img {
  transition: transform 0.5s ease;
}

.digital-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.pdf-indicator {
  position: absolute;
  bottom: 12px;
  right: 12px;
  z-index: 2;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  border-radius: 8px;
  padding: 4px 10px;
  display: flex;
  align-items: center;
}
</style>
