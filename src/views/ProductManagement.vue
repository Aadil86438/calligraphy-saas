<template>
  <v-container fluid class="pa-0">
    <!-- Search + Category Filter Bar -->
    <v-card class="border-thin shadow-sm mb-6 pa-4">
      <v-row align="center" no-gutters>
        <v-col cols="12" sm="6" md="5">
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            placeholder="Search products..."
            hide-details
            clearable
            density="comfortable"
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="6" md="3" class="pl-sm-4 mt-2 mt-sm-0">
          <v-select
            v-model="categoryFilter"
            :items="categoryOptions"
            label="All Categories"
            hide-details
            clearable
            density="comfortable"
          ></v-select>
        </v-col>
      </v-row>
    </v-card>

    <!-- Products Table -->
    <v-card class="border-thin shadow-sm overflow-hidden" :loading="loading">
      <div v-if="loading" class="pa-16 text-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>
      <div v-else class="overflow-x-auto">
        <v-table hover class="products-table">
          <thead class="bg-grey-lighten-4">
            <tr>
              <th class="font-weight-bold py-4" style="width: 70px">IMAGE</th>
              <th class="font-weight-bold py-4">NAME</th>
              <th class="font-weight-bold py-4">PRICE</th>
              <th class="font-weight-bold py-4">CATEGORY</th>
              <th class="font-weight-bold py-4 text-center">STATUS</th>
              <th class="font-weight-bold py-4 text-center" style="width: 120px">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in filteredProducts" :key="product.id">
              <td class="py-3">
                <v-avatar size="48" class="rounded-lg border">
                  <v-img :src="product.image_url" cover></v-img>
                </v-avatar>
              </td>
              <td>
                <div class="font-weight-bold text-body-1">{{ product.name }}</div>
              </td>
              <td>
                <span class="text-secondary font-weight-bold">{{ CONFIG.CURRENCY_SYMBOL }}{{ product.price }}</span>
              </td>
              <td>
                <v-chip
                  size="small"
                  variant="tonal"
                  color="secondary"
                  class="font-weight-medium"
                >
                  {{ product.category || 'General' }}
                </v-chip>
              </td>
              <td class="text-center">
                <v-switch
                  :model-value="product.is_active"
                  color="success"
                  hide-details
                  density="compact"
                  class="d-inline-flex"
                  @update:model-value="toggleProductStatus(product, $event)"
                ></v-switch>
              </td>
              <td class="text-center">
                <v-btn
                  icon="mdi-pencil-outline"
                  variant="text"
                  size="small"
                  color="grey-darken-1"
                  @click="openDialog(product)"
                ></v-btn>
                <v-btn
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
      </div>

      <!-- Empty State -->
      <div v-if="filteredProducts.length === 0" class="text-center pa-16">
        <v-icon size="64" color="grey-lighten-1">mdi-package-variant-closed</v-icon>
        <h2 class="luxury-font mt-4">{{ products.length === 0 ? 'Your collection is empty' : 'No matching products' }}</h2>
        <p class="text-grey">{{ products.length === 0 ? 'Add your first masterpiece to start selling.' : 'Try adjusting your search or filter.' }}</p>
        <v-btn v-if="products.length === 0" color="primary" class="mt-4" @click="openDialog()">Add Product</v-btn>
      </div>
    </v-card>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="800" persistent transition="dialog-bottom-transition">
      <v-card class="rounded-xl">
        <v-toolbar color="white" class="px-4 border-b">
          <v-toolbar-title class="luxury-font">{{ isEditing ? 'Edit Product' : 'New Product' }}</v-toolbar-title>
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
                  label="Product Name"
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

                <v-combobox
                  v-model="editedItem.category"
                  :items="categoryOptions"
                  label="Category"
                  variant="outlined"
                  hint="Type a new category or select existing"
                  persistent-hint
                ></v-combobox>
                
                <v-textarea
                  v-model="editedItem.description"
                  label="Description / Artist Notes"
                  rows="4"
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
            :loading="saveLoading"
            @click="saveProduct"
            class="px-8"
          >
            {{ isEditing ? 'Update Product' : 'Add Product' }}
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
          This will deactivate <b>{{ selectedItem?.name }}</b>. It will no longer be visible to customers.
        </p>
        <v-card-actions class="pa-6 pt-0 d-flex justify-end gap-4">
          <v-btn
            variant="tonal"
            color="grey"
            @click="deleteDialog = false"
            class="rounded-lg px-6"
          >
            Keep it
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            @click="deleteProduct"
            class="rounded-lg px-6"
          >
            Deactivate
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject, watch } from 'vue'
import { SupabaseService } from '../services/SupabaseService'
import { CONFIG } from '../config/constants'

const props = defineProps({
  showAddDialog: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['dialog-closed'])

const products = ref([])
const searchQuery = ref('')
const categoryFilter = ref(null)
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
const loading = ref(true)

const editedItem = ref({
  name: '',
  price: '',
  description: '',
  image_url: '',
  category: 'General'
})

// Watch for external trigger to open add dialog
watch(() => props.showAddDialog, (val) => {
  if (val) {
    openDialog()
  }
})

watch(dialog, (val) => {
  if (!val) {
    emit('dialog-closed')
  }
})

// Computed: unique categories from products
const categoryOptions = computed(() => {
  const cats = [...new Set(products.value.map(p => p.category || 'General'))]
  return cats.sort()
})

// Computed: filtered products
const filteredProducts = computed(() => {
  let result = products.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    )
  }
  if (categoryFilter.value) {
    result = result.filter(p => (p.category || 'General') === categoryFilter.value)
  }
  return result
})

const fetchProducts = () => {
  console.log('ProductManagement: fetchProducts started')
  loading.value = true
  SupabaseService.getAllProducts()
    .then((data) => {
      console.log('ProductManagement: fetchProducts success', data)
      products.value = data
    })
    .catch(() => {
      showMessage('Error fetching products', 'error')
    })
    .finally(() => {
      loading.value = false
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
    editedItem.value = { name: '', price: '', description: '', image_url: '', category: 'General' }
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
          image_url: imageUrl,
          is_active: editedItem.value.is_active !== undefined ? editedItem.value.is_active : true
        }

        if (editedItem.value.category) {
          payload.category = editedItem.value.category
        }

        const action = isEditing.value 
          ? SupabaseService.updateProduct(selectedItem.value.id, payload)
          : SupabaseService.createProduct(payload)

        action
          .then(() => {
            showMessage(isEditing.value ? 'Product updated' : 'Product added to collection')
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
          .catch(() => {
            showMessage('Image upload failed', 'error')
            saveLoading.value = false
          })
      } else {
        proceedSave(editedItem.value.image_url)
      }
    })
}

const toggleProductStatus = (product, newValue) => {
  SupabaseService.updateProduct(product.id, { is_active: newValue })
    .then(() => {
      showMessage(newValue ? 'Product activated' : 'Product deactivated')
      fetchProducts()
    })
    .catch(() => {
      showMessage('Error updating status', 'error')
    })
}

const confirmDelete = (item) => {
  selectedItem.value = item
  deleteDialog.value = true
}

const deleteProduct = () => {
  SupabaseService.deleteProduct(selectedItem.value.id)
    .then(() => {
      showMessage('Product deactivated')
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
  try {
    console.log('ProductManagement: mounted start')
    fetchProducts()
    prodSub = SupabaseService.subscribeToProducts('mgmt-products', () => {
      fetchProducts()
    })
  } catch (err) {
    console.error('ProductManagement: mounted error', err)
  }
})

onUnmounted(() => {
  if (prodSub) prodSub.unsubscribe()
})
</script>

<style scoped>
.products-table {
  min-width: 700px;
}
.gap-4 {
  gap: 16px;
}
</style>
