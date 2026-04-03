<template>
  <v-container fluid class="pa-0">
    <div class="d-flex align-center justify-space-between mb-8">
      <div>
        <h1 class="text-h4 luxury-font mb-1 text-primary">Product Inventory</h1>
        <p class="text-subtitle-2 text-grey">Manage your handcrafted collection</p>
      </div>
      <div class="d-flex align-center gap-2">
        <v-btn-toggle
          v-model="viewMode"
          mandatory
          divided
          variant="outlined"
          color="secondary"
          class="mr-4 overflow-hidden rounded-lg bg-white"
        >
          <v-btn value="table" icon="mdi-table-large"></v-btn>
          <v-btn value="grid" icon="mdi-view-grid-outline"></v-btn>
        </v-btn-toggle>
        
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openDialog()"
          size="large"
          class="elevation-4"
        >
          Add Piece
        </v-btn>
      </div>
    </div>

    <!-- Stats Row -->
    <v-row class="mb-8">
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-6 border-thin shadow-sm">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-overline text-grey-darken-1 mb-1">Total Collection</div>
              <div class="text-h4 font-weight-bold">{{ products.length }}</div>
            </div>
            <v-icon color="primary" size="40" alpha="0.1">mdi-package-variant</v-icon>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-6 border-thin shadow-sm">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-overline text-success mb-1">Active Pieces</div>
              <div class="text-h4 font-weight-bold">{{ products.filter(p => p.is_active).length }}</div>
            </div>
            <v-icon color="success" size="40">mdi-check-decagram</v-icon>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Products Content -->
    <transition name="fade" mode="out-in">
      <v-card v-if="viewMode === 'table'" class="border-thin shadow-sm">
        <v-table hover>
          <thead class="bg-grey-lighten-4">
            <tr>
              <th class="font-weight-bold py-4">Piece</th>
              <th class="font-weight-bold py-4">Details</th>
              <th class="font-weight-bold py-4 text-center">Status</th>
              <th class="font-weight-bold py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in products" :key="product.id">
              <td class="py-4">
                <div class="d-flex align-center">
                  <v-avatar size="60" class="rounded-lg mr-4 border">
                    <v-img :src="product.image_url" cover></v-img>
                  </v-avatar>
                  <div>
                    <div class="font-weight-bold text-subtitle-1">{{ product.name }}</div>
                    <div class="text-secondary font-weight-bold">{{ CONFIG.CURRENCY_SYMBOL }}{{ product.price }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div class="text-truncate" style="max-width: 300px">{{ product.description }}</div>
                <div class="text-caption text-grey">Added: {{ new Date(product.created_at).toLocaleDateString() }}</div>
              </td>
              <td class="text-center">
                <v-chip
                  :color="product.is_active ? 'success' : 'error'"
                  size="small"
                  variant="flat"
                  class="font-weight-bold"
                >
                  {{ product.is_active ? 'ACTIVE' : 'DELETED' }}
                </v-chip>
              </td>
              <td class="text-right">
                <v-btn icon="mdi-pencil-outline" variant="text" color="grey-darken-1" @click="openDialog(product)"></v-btn>
                <v-btn
                  v-if="product.is_active"
                  icon="mdi-delete-outline"
                  variant="text"
                  color="error"
                  @click="confirmDelete(product)"
                ></v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>

      <v-row v-else>
        <v-col v-for="product in products" :key="product.id" cols="12" sm="6" md="4" lg="3">
          <v-card class="product-card">
            <v-img :src="product.image_url" height="200" cover>
              <v-chip
                :color="product.is_active ? 'success' : 'error'"
                size="x-small"
                variant="flat"
                class="ma-2 position-absolute"
                style="top: 0; left: 0"
              >
                {{ product.is_active ? 'ACTIVE' : 'DELETED' }}
              </v-chip>
            </v-img>
            <v-card-text>
              <div class="font-weight-bold text-h6 text-truncate">{{ product.name }}</div>
              <div class="text-primary font-weight-bold mb-2">{{ CONFIG.CURRENCY_SYMBOL }}{{ product.price }}</div>
              <div class="text-caption text-truncate">{{ product.description }}</div>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn icon="mdi-pencil-outline" variant="text" size="small" @click="openDialog(product)"></v-btn>
              <v-btn
                v-if="product.is_active"
                icon="mdi-delete-outline"
                variant="text"
                size="small"
                color="error"
                @click="confirmDelete(product)"
              ></v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </transition>

    <!-- Empty State -->
    <v-card v-if="products.length === 0" class="text-center pa-16 border-thin shadow-sm">
      <v-icon size="64" color="grey-lighten-1">mdi-package-variant-closed</v-icon>
      <h2 class="luxury-font mt-4">Your collection is empty</h2>
      <p class="text-grey">Add your first masterpiece to start selling.</p>
      <v-btn color="primary" class="mt-4" @click="openDialog()">Add Product</v-btn>
    </v-card>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="800" persistent transition="dialog-bottom-transition">
      <v-card class="rounded-xl">
        <v-toolbar color="white" class="px-4 border-b">
          <v-toolbar-title class="luxury-font">{{ isEditing ? 'Edit Piece' : 'New Masterpiece' }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="dialog = false"></v-btn>
        </v-toolbar>

        <v-card-text class="pa-8">
          <v-form ref="form" v-model="valid">
            <v-row>
              <v-col cols="12" md="5">
                <div class="image-upload-container border-dashed rounded-xl d-flex align-center justify-center overflow-hidden bg-grey-lighten-4" style="height: 300px; border: 2px dashed #ccc">
                  <v-img v-if="imagePreview || editedItem.image_url" :src="imagePreview || editedItem.image_url" height="100%" cover></v-img>
                  <div v-else class="text-center pa-4">
                    <v-icon size="48" color="grey">mdi-camera-outline</v-icon>
                    <div class="text-caption mt-2">Upload Product Image</div>
                  </div>
                </div>
                <v-file-input
                  v-model="selectedFile"
                  label="Select Image"
                  variant="outlined"
                  class="mt-4"
                  prepend-icon=""
                  prepend-inner-icon="mdi-paperclip"
                  accept="image/*"
                  hide-details
                  @change="onFileChange"
                ></v-file-input>
              </v-col>
              
              <v-col cols="12" md="7">
                <v-text-field
                  v-model="editedItem.name"
                  label="Piece Name"
                  :rules="[v => !!v || 'Name is required']"
                  class="mb-4"
                ></v-text-field>
                
                <v-text-field
                  v-model="editedItem.price"
                  label="Price"
                  type="number"
                  :prefix="CONFIG.CURRENCY_SYMBOL"
                  :rules="[v => !!v || 'Price is required']"
                  class="mb-4"
                ></v-text-field>
                
                <v-textarea
                  v-model="editedItem.description"
                  label="Description / Artist Notes"
                  rows="5"
                  counter
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-8 pt-0">
          <v-spacer></v-spacer>
          <v-btn variant="text" size="large" @click="dialog = false" class="mr-2">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            size="large"
            block
            :loading="saveLoading"
            @click="saveProduct"
            class="max-width-200"
          >
            {{ isEditing ? 'Update Piece' : 'Add to Collection' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation -->
    <v-dialog v-model="deleteDialog" max-width="450">
      <v-card class="pa-6 rounded-xl text-center">
        <v-icon color="error" size="64" class="mb-4">mdi-alert-circle-outline</v-icon>
        <h2 class="luxury-font mb-2">Are you sure?</h2>
        <p class="text-grey mb-6 text-body-1">
          This will soft-delete <b>{{ selectedItem?.name }}</b>. It will no longer be visible to customers.
        </p>
        <div class="d-flex gap-4">
          <v-btn block variant="tonal" size="large" @click="deleteDialog = false">Keep it</v-btn>
          <v-btn block color="error" variant="flat" size="large" @click="deleteProduct">Yes, Delete</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { SupabaseService } from '../services/SupabaseService'
import { CONFIG } from '../config/constants'

const products = ref([])
const viewMode = ref('table')
const dialog = ref(false)
const deleteDialog = ref(false)
const isEditing = ref(false)
const valid = ref(false)
const saveLoading = ref(false)
const form = ref(null)
const imagePreview = ref('')
const selectedFile = ref(null)
const selectedItem = ref(null)

const showMessage = inject('showMessage')
const setLoading = inject('setLoading')

const editedItem = ref({
  name: '',
  price: '',
  description: '',
  image_url: ''
})

const fetchProducts = () => {
  setLoading(true)
  SupabaseService.getAllProducts()
    .then((data) => {
      products.value = data
    })
    .catch((error) => {
      showMessage('Error fetching products', 'error')
    })
    .finally(() => {
      setLoading(false)
    })
}

const openDialog = (item = null) => {
  imagePreview.value = ''
  selectedFile.value = null
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

const onFileChange = (file) => {
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  } else {
    imagePreview.value = ''
  }
}

const saveProduct = () => {
  form.value.validate()
    .then(({ valid: isFormValid }) => {
      if (!isFormValid) return

      saveLoading.value = true
      
      const proceedSave = (imageUrl) => {
        const payload = {
          name: editedItem.value.name,
          price: parseFloat(editedItem.value.price),
          description: editedItem.value.description,
          image_url: imageUrl
        }

        const action = isEditing.value 
          ? SupabaseService.updateProduct(selectedItem.value.id, payload)
          : SupabaseService.createProduct(payload)

        action
          .then(() => {
            showMessage(isEditing.value ? 'Piece updated' : 'Piece added to collection')
            dialog.value = false
            fetchProducts()
          })
          .catch((error) => {
            showMessage(error.message, 'error')
          })
          .finally(() => {
            saveLoading.value = false
          })
      }

      if (selectedFile.value) {
        SupabaseService.uploadProductImage(selectedFile.value)
          .then((url) => {
            proceedSave(url)
          })
          .catch((error) => {
            showMessage('Image upload failed', 'error')
            saveLoading.value = false
          })
      } else {
        proceedSave(editedItem.value.image_url)
      }
    })
}

const confirmDelete = (item) => {
  selectedItem.value = item
  deleteDialog.value = true
}

const deleteProduct = () => {
  SupabaseService.deleteProduct(selectedItem.value.id)
    .then(() => {
      showMessage('Piece removed from active list')
      deleteDialog.value = false
      fetchProducts()
    })
    .catch((error) => {
      showMessage(error.message, 'error')
    })
}

// Subscriptions
let prodSub = null

onMounted(() => {
  fetchProducts()
  prodSub = SupabaseService.subscribeToProducts(() => {
    fetchProducts()
  })
})

onUnmounted(() => {
  if (prodSub) prodSub.unsubscribe()
})
</script>

<style scoped>
.product-card {
  transition: all 0.3s ease;
  border: 1px solid rgba(0,0,0,0.05) !important;
}
.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.05) !important;
}
.max-width-200 {
  max-width: 200px;
}
.gap-4 {
  gap: 16px;
}
</style>
