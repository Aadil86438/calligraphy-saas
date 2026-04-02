<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12 rounded-lg pa-4">
          <v-card-title class="text-center pb-6">
            <h1 class="luxury-font text-h4">Business Login</h1>
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleLogin" v-model="valid" ref="form">
              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                required
                variant="outlined"
                prepend-inner-icon="mdi-email-outline"
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="Password"
                type="password"
                required
                variant="outlined"
                prepend-inner-icon="mdi-lock-outline"
              ></v-text-field>
              <v-btn
                block
                color="primary"
                size="large"
                type="submit"
                :loading="loading"
                class="mt-6 font-weight-bold"
              >
                Login to Dashboard
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import { SupabaseService } from '../services/SupabaseService'

const email = ref('')
const password = ref('')
const loading = ref(false)
const valid = ref(false)
const router = useRouter()
const showMessage = inject('showMessage')

const handleLogin = async () => {
  loading.value = true
  try {
    await SupabaseService.login(email.value, password.value)
    showMessage('Login successful!')
    router.push('/admin')
  } catch (error) {
    showMessage(error.message || 'Invalid credentials', 'error')
  } finally {
    loading.value = false
  }
}
</script>
