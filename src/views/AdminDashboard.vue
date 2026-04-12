<template>
  <v-layout>
    <!-- Premium Sidebar -->
    <v-navigation-drawer
      v-model="drawer"
      color="primary"
      theme="dark"
      width="280"
      elevation="0"
      class="border-r"
    >
      <div class="pa-8 mb-4">
        <h2 class="luxury-font text-white tracking-widest text-h5">Nafzz studio Admin</h2>
        <div class="text-caption text-secondary mt-1">Management Portal</div>
      </div>

      <v-list density="comfortable" nav class="px-4">
        <v-list-item
          prepend-icon="mdi-view-dashboard-outline"
          title="Dashboard Overview"
          to="/admin"
          exact
          active-color="secondary"
          class="mb-2 rounded-lg"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-storefront-outline"
          title="Product Inventory"
          to="/admin/products"
          active-color="secondary"
          class="mb-2 rounded-lg"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-clipboard-list-outline"
          title="Order Tracking"
          to="/admin/orders"
          active-color="secondary"
          class="mb-2 rounded-lg"
        ></v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-6 border-t border-white-opacity-10">
          <v-btn
            block
            variant="tonal"
            color="error"
            prepend-icon="mdi-logout"
            @click="handleLogout"
            class="rounded-lg"
          >
            Sign Out
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Navigation Intel Header -->
    <v-app-bar flat class="border-b px-4">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      
      <v-breadcrumbs :items="breadcrumbs" class="hidden-sm-and-down px-0">
        <template v-slot:title="{ item }">
          <span class="luxury-font text-subtitle-2">{{ item.title.toUpperCase() }}</span>
        </template>
      </v-breadcrumbs>

      <v-spacer></v-spacer>

      <v-btn
        variant="outlined"
        prepend-icon="mdi-arrow-left"
        to="/"
        class="text-none mr-2 font-weight-bold"
        color="secondary"
      >
        Public View
      </v-btn>
    </v-app-bar>

    <v-main class="bg-grey-lighten-5 min-vh-100">
      <v-container fluid class="pa-8">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { SupabaseService } from '../services/SupabaseService'

const drawer = ref(true)
const router = useRouter()
const route = useRoute()

// Navigation Intelligence: Dynamic Breadcrumbs
const breadcrumbs = computed(() => {
  const paths = route.path.split('/').filter(p => p)
  const items = [{ title: 'Home', disabled: false, to: '/' }]
  
  let currentPath = ''
  paths.forEach((p, index) => {
    currentPath += `/${p}`
    items.push({
      title: p.charAt(0).toUpperCase() + p.slice(1),
      disabled: index === paths.length - 1,
      to: currentPath
    })
  })
  
  return items
})

const handleLogout = () => {
  SupabaseService.logout()
    .then(() => {
      router.push('/admin/login')
    })
}
</script>

<style scoped>
.tracking-widest {
  letter-spacing: 0.2em !important;
}

.border-white-opacity-10 {
  border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
}

/* Page transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
