<template>
  <v-app>
    <!-- Global Loading Overlay -->
    <v-overlay
      v-model="loading"
      class="align-center justify-center global-loader"
      persistent
    >
      <v-progress-circular
        color="secondary"
        indeterminate
        size="64"
      ></v-progress-circular>
    </v-overlay>

    <router-view />

    <!-- Premium Glass Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="4000"
      location="top right"
      class="glass-snackbar"
      elevation="0"
    >
      <div class="d-flex align-center">
        <v-icon
          start
          :icon="snackbar.color === 'error' ? 'mdi-alert-circle' : 'mdi-check-circle'"
        ></v-icon>
        <span class="font-weight-medium">{{ snackbar.text }}</span>
      </div>
      
      <template v-slot:actions>
        <v-btn
          variant="text"
          icon="mdi-close"
          size="small"
          @click="snackbar.show = false"
        ></v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { ref, provide } from 'vue'

const loading = ref(false)
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

const showMessage = (text, color = 'success') => {
  snackbar.value = { show: true, text, color }
}

const setLoading = (value) => {
  loading.value = value
}

provide('showMessage', showMessage)
provide('setLoading', setLoading)
</script>

<style>
/* Global luxury font or styling */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Outfit:wght@300;400;500;600&display=swap');

:root {
  --v-theme-secondary: #D4AF37;
}

.v-application {
  font-family: 'Outfit', sans-serif !important;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3, h4, h5, .luxury-font {
  font-family: 'Playfair Display', serif !important;
}

/* Glassmorphism snackbar */
.glass-snackbar .v-snackbar__wrapper {
  background: rgba(26, 26, 26, 0.8) !important;
  backdrop-filter: blur(10px) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white !important;
}

/* Global Loader Blur */
.global-loader {
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.1) !important;
}

/* Micro-interactions */
.v-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.v-btn:hover {
  transform: translateY(-2px);
}

.v-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
  background: #D4AF37;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #b8962d;
}

/* Smooth Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
