<template>
  <v-layout>
    <v-navigation-drawer
      v-model="drawer"
      color="primary"
      theme="dark"
      width="260"
    >
      <div class="pa-6 mb-4">
        <h2 class="luxury-font text-white">ARTISAN ADMIN</h2>
      </div>

      <v-list density="comfortable" nav>
        <v-list-item
          prepend-icon="mdi-view-dashboard-outline"
          title="Dashboard"
          to="/admin"
          exact
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-storefront-outline"
          title="Products"
          to="/admin/products"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-clipboard-list-outline"
          title="Orders"
          to="/admin/orders"
        ></v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-4">
          <v-btn
            block
            variant="text"
            prepend-icon="mdi-logout"
            @click="handleLogout"
          >
            Logout
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-main class="bg-grey-lighten-4 min-vh-100">
      <v-container fluid class="pa-6">
        <router-view />
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { SupabaseService } from '../services/SupabaseService'

const drawer = ref(true)
const router = useRouter()

const handleLogout = async () => {
  await SupabaseService.logout()
  router.push('/admin/login')
}
</script>
