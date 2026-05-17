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
/* ==========================================================================
   NAFZZ STUDIO - PREMIUM DESIGN SYSTEM (PHASE 1 ARCHITECTURE)
   ========================================================================== */

@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

/* --- TYPOGRAPHY SYSTEM --- */
.v-application {
  font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: rgb(var(--v-theme-primary));
}

/* Restrict Playfair Display strictly to Primary Headings to reduce cognitive load */
h1, h2, .luxury-font {
  font-family: 'Playfair Display', serif !important;
  letter-spacing: -0.02em;
}

/* Functional typography utilities */
.tracking-normal { letter-spacing: normal !important; }
.tracking-tight { letter-spacing: -0.015em !important; }
.tracking-widest { letter-spacing: 0.15em !important; text-transform: uppercase; }

/* --- SURFACE & ELEVATION SYSTEM (Stripe/Linear Inspired) --- */
.ds-surface-card {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-border-color));
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05) !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.ds-surface-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05) !important;
}

/* Dialog surfaces require higher elevation */
.ds-dialog .v-overlay__content > .v-card {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
  border: 1px solid rgb(var(--v-theme-border-color));
}

/* --- BUTTON SYSTEM --- */
.ds-btn {
  transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease !important;
}
.ds-btn:active {
  transform: scale(0.98);
}
.ds-btn--primary {
  box-shadow: 0 1px 2px rgba(0,0,0,0.1) !important;
}

/* --- TABLE SYSTEM --- */
.ds-table {
  border: 1px solid rgb(var(--v-theme-border-color));
  border-radius: 12px;
}
.ds-table th {
  font-weight: 600 !important;
  color: rgb(var(--v-theme-primary), 0.7) !important;
  font-size: 0.75rem !important;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgb(var(--v-theme-surface-variant)) !important;
}

/* --- LAYOUT PRIMITIVES (Responsive Safety) --- */
/* Replace calc(100vh) with safe flex areas */
.safe-flex-scroll {
  flex: 1 1 auto;
  min-height: 0; /* Crucial for nested flex scrolling */
  overflow-y: auto;
}

.safe-flex-column {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* --- MICRO-INTERACTIONS & UTILITIES --- */
/* Glassmorphism snackbar */
.glass-snackbar .v-snackbar__wrapper {
  background: rgba(var(--v-theme-primary), 0.95) !important;
  backdrop-filter: blur(12px) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgb(var(--v-theme-surface)) !important;
  border-radius: 12px !important;
}

.global-loader {
  backdrop-filter: blur(4px);
  background: rgba(var(--v-theme-background), 0.5) !important;
}

/* Custom minimal scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgb(var(--v-theme-border-color));
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgb(var(--v-theme-primary), 0.3);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
