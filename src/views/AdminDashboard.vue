<template>
  <v-layout>
    <!-- Mobile Navigation Drawer -->
    <v-navigation-drawer
      v-model="mobileDrawer"
      temporary
      width="280"
      class="d-md-none"
    >
      <div class="pa-6">
        <h2 class="luxury-font text-h5 text-primary mb-1">{{ CONFIG.APP_NAME }}</h2>
      </div>

      <v-list nav class="px-4">
        <v-list-item
          prepend-icon="mdi-home-outline"
          title="Home"
          to="/"
          class="mb-1 rounded-lg"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-download-outline"
          title="Digital Shop"
          to="/digital"
          class="mb-1 rounded-lg"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-view-dashboard-outline"
          title="Admin Dashboard"
          to="/admin"
          class="mb-1 rounded-lg"
        ></v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-4">
          <v-btn
            block
            variant="tonal"
            color="error"
            prepend-icon="mdi-logout"
            @click="handleLogout"
            class="rounded-lg"
          >
            Logout
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Top Header Bar -->
    <v-app-bar flat class="border-b px-2 px-md-6">
      <!-- Mobile menu icon -->
      <v-app-bar-nav-icon class="d-md-none" @click="mobileDrawer = !mobileDrawer"></v-app-bar-nav-icon>
      
      <v-toolbar-title class="luxury-font font-weight-bold text-primary">
        {{ CONFIG.APP_NAME }}
      </v-toolbar-title>
      
      <v-spacer></v-spacer>

      <!-- Desktop nav links -->
      <div class="hidden-sm-and-down d-flex align-center">
        <v-btn variant="text" to="/" class="text-none font-weight-medium mr-1">
          <v-icon start>mdi-home-outline</v-icon>
          HOME
        </v-btn>
        <v-btn variant="text" to="/digital" class="text-none font-weight-medium mr-1">
          <v-icon start>mdi-download-outline</v-icon>
          DIGITAL SHOP
        </v-btn>
      </div>

      <!-- Theme Toggle -->
      <v-btn icon variant="text" color="grey-darken-1" class="mr-1" @click="toggleTheme">
        <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
      </v-btn>

      <!-- User Avatar -->
      <v-avatar color="secondary" size="36" class="ml-1">
        <v-icon color="white" size="20">mdi-account</v-icon>
      </v-avatar>
    </v-app-bar>

    <v-main class="bg-grey-lighten-5 min-vh-100">
      <v-container fluid class="pa-4 pa-md-8">
        <!-- Admin Header -->
        <div class="d-flex align-center justify-space-between mb-6">
          <div>
            <h1 class="text-h4 luxury-font mb-1 text-primary">Admin Control</h1>
            <p class="text-subtitle-2 text-grey">Manage your collection and orders</p>
          </div>
          <v-btn
            v-if="activeTab === 'products' || activeTab === 'digital'"
            color="primary"
            prepend-icon="mdi-plus"
            size="large"
            class="elevation-2 hidden-xs"
            @click="triggerAdd"
          >
            Add {{ activeTab === 'products' ? 'Product' : 'Digital Art' }}
          </v-btn>
        </div>

        <!-- Tab Navigation -->
        <v-tabs
          v-model="activeTab"
          color="primary"
          class="mb-8 border-b"
          slider-color="primary"
          show-arrows
        >
          <v-tab value="dashboard" class="text-none font-weight-bold">
            <v-icon start>mdi-view-dashboard-outline</v-icon>
            Overview
          </v-tab>
          <v-tab value="products" class="text-none font-weight-bold">
            <v-icon start>mdi-storefront-outline</v-icon>
            Physical
          </v-tab>
          <v-tab value="orders" class="text-none font-weight-bold">
            <v-icon start>mdi-cart-outline</v-icon>
            Physical Orders
          </v-tab>
          <v-tab value="digital" class="text-none font-weight-bold">
            <v-icon start>mdi-file-document-outline</v-icon>
            Digital
          </v-tab>
          <v-tab value="digital_orders" class="text-none font-weight-bold">
            <v-icon start>mdi-download-outline</v-icon>
            Digital Orders
          </v-tab>
        </v-tabs>

        <!-- Tab Content -->
        <v-window v-model="activeTab" class="mt-4">
          <v-window-item value="dashboard">
            <AdminOverview />
          </v-window-item>
          <v-window-item value="products">
            <ProductManagement ref="productMgmt" :show-add-dialog="showAddProduct" @dialog-closed="showAddProduct = false" />
          </v-window-item>
          <v-window-item value="orders">
            <OrderManagement />
          </v-window-item>
          <v-window-item value="digital">
            <DigitalProductAdmin :show-add-dialog="showAddDigital" @dialog-closed="showAddDigital = false" />
          </v-window-item>
          <v-window-item value="digital_orders">
            <DigitalOrderAdmin />
          </v-window-item>
        </v-window>

        <!-- Mobile FAB for Add -->
        <v-btn
          v-if="activeTab === 'products' || activeTab === 'digital'"
          color="primary"
          icon="mdi-plus"
          size="large"
          class="d-sm-none fab-btn"
          elevation="8"
          position="fixed"
          style="bottom: 24px; right: 24px; z-index: 100;"
          @click="triggerAdd"
        ></v-btn>
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTheme } from 'vuetify'
import { SupabaseService } from '../services/SupabaseService'
import { CONFIG } from '../config/constants'
import AdminOverview from './AdminOverview.vue'
import ProductManagement from './ProductManagement.vue'
import OrderManagement from './OrderManagement.vue'
import DigitalProductAdmin from './DigitalProductAdmin.vue'
import DigitalOrderAdmin from './DigitalOrderAdmin.vue'

const router = useRouter()
const route = useRoute()
const theme = useTheme()
const mobileDrawer = ref(false)
const activeTab = ref('dashboard')
const showAddProduct = ref(false)
const showAddDigital = ref(false)
const productMgmt = ref(null)

const isDark = ref(theme.global.name.value !== 'luxuryTheme')

const toggleTheme = () => {
  theme.global.name.value = theme.global.name.value === 'luxuryTheme' ? 'luxuryDark' : 'luxuryTheme'
  isDark.value = theme.global.name.value !== 'luxuryTheme'
}

const handleLogout = () => {
  SupabaseService.logout()
    .then(() => {
      router.push('/admin/login')
    })
}

const triggerAdd = () => {
  if (activeTab.value === 'products') showAddProduct.value = true
  else if (activeTab.value === 'digital') showAddDigital.value = true
}

// Sync URL to tab
watch(() => route.path, (path) => {
  if (path === '/admin/products') activeTab.value = 'products'
  else if (path === '/admin/orders') activeTab.value = 'orders'
  else if (path === '/admin/digital') activeTab.value = 'digital'
  else if (path === '/admin/digital-orders') activeTab.value = 'digital_orders'
  else activeTab.value = 'dashboard'
}, { immediate: true })
</script>

<style scoped>
.fab-btn {
  position: fixed !important;
}
</style>
