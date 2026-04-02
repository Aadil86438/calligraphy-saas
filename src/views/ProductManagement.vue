<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-8">
      <h1 class="text-h4 luxury-font">Product Management</h1>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="openDialog()"
      >
        Add New Product
      </v-btn>
    </div>

    <!-- Stats Row -->
    <v-row class="mb-6">
      <v-col cols="12" sm="4">
        <v-card flat class="rounded-lg pa-4 border">
          <div class="text-overline mb-1">Total Products</div>
          <div class="text-h4 font-weight-bold">{{ products.length }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Products Table -->
    <v-card flat class="rounded-lg border">
      <v-table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Price</th>
            <th>Description</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td>
              <v-img :src="product.image_url" width="50" height="50" cover class="rounded"></v-img>
            </td>
            <td class="font-weight-bold">{{ product.name }}</td>
            <td>${{ product.price }}</td>
            <td class="text-truncate" style="max-width: 200px">{{ product.description }}</td>
            <td>
              <v-chip :color="product.is_active ? 'success' : 'error'" size="small">
                {{ product.is_active ? 'Active' : 'Deleted' }}
              </v-chip>
            </td>
            <td>
              <v-btn icon="mdi-pencil-outline" variant="text" size="small" @click="openDialog(product)"></v-btn>
              <v-btn
                v-if="product.is_active"
                icon="mdi-delete-outline"
                variant="text"
                size="small"
                color="error"
                @click="confirmDelete(product)"
              ></v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="600">
      <v-card class="pa-4">
        <v-card-title class="luxury-font text-h5">{{ isEditing ? 'Edit Product' : 'Add Product' }}</v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-file-input
              label="Product Image"
              variant="outlined"
              prepend-icon="mdi-camera"
              accept="image/*"
              @change="handleImageChange"
              :rules="[!isEditing && (v => !!v || 'Image required')]"
            ></v-file-input>
            <v-text-field
              v-model="editedItem.name"
              label="Product Name"
              variant="outlined"
              :rules="[v => !!v || 'Name is required']"
            ></v-text-field>
            <v-text-field
              v-model="editedItem.price"
              label="Price"
              type="number"
              variant="outlined"
              :rules="[v => !!v || 'Price is required']"
            ></v-text-field>
            <v-textarea
              v-model="editedItem.description"
              label="Description"
              variant="outlined"
              rows="3"
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="saveLoading"
            @click="saveProduct"
          >
            Save Product
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card class="pa-4">
        <v-card-title class="luxury-font">Confirm Delete</v-card-title>
        <v-card-text>Are you sure you want to delete <b>{{ selectedItem?.name }}</b>? This is a soft delete.</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" @click="deleteProduct">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { SupabaseService } from '../services/SupabaseService'

const products = ref([])
const dialog = ref(false)
const deleteDialog = ref(false)
const isEditing = ref(false)
const valid = ref(false)
const saveLoading = ref(false)
const form = ref(null)
const showMessage = inject('showMessage')

const editedItem = ref({
  name: '',
  price: '',
  description: '',
  image_url: ''
})
const selectedFile = ref(null)
const selectedItem = ref(null)

const fetchProducts = async () => {
  try {
    products.value = await SupabaseService.getAllProducts()
  } catch (error) {
    showMessage('Error fetching products', 'error')
  }
}

const openDialog = (item = null) => {
  if (item) {
    isEditing.value = true
    selectedItem.value = item
    editedItem.value = { ...item }
  } else {
    isEditing.value = false
    selectedItem.value = null
    editedItem.value = { name: '', price: '', description: '', image_url: '' }
  }
  dialog.value = true
}

const handleImageChange = (e) => {
  if (e.target.files && e.target.files[0]) {
    selectedFile.value = e.target.files[0]
  }
}

const saveProduct = async () => {
  const { valid: isFormValid } = await form.value.validate()
  if (!isFormValid) return

  saveLoading.value = true
  try {
    let imageUrl = editedItem.value.image_url

    if (selectedFile.value) {
      imageUrl = await SupabaseService.uploadProductImage(selectedFile.value)
    }

    const payload = {
      name: editedItem.value.name,
      price: parseFloat(editedItem.value.price),
      description: editedItem.value.description,
      image_url: imageUrl
    }

    if (isEditing.value) {
      await SupabaseService.updateProduct(selectedItem.value.id, payload)
      showMessage('Product updated successfully')
    } else {
      await SupabaseService.createProduct(payload)
      showMessage('Product added successfully')
    }

    dialog.value = false
    fetchProducts()
  } catch (error) {
    showMessage(error.message, 'error')
  } finally {
    saveLoading.value = false
  }
}

const confirmDelete = (item) => {
  selectedItem.value = item
  deleteDialog.value = true
}

const deleteProduct = async () => {
  try {
    await SupabaseService.deleteProduct(selectedItem.value.id)
    showMessage('Product deleted successfully')
    deleteDialog.value = false
    fetchProducts()
  } catch (error) {
    showMessage(error.message, 'error')
  }
}

onMounted(fetchProducts)
</script>
