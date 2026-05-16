<template>
  <v-container fluid class="pa-0">
    <!-- Search Bar -->
    <v-card class="pa-4 mb-6 d-flex flex-wrap align-center gap-4 border-thin shadow-sm">
      <v-text-field
        v-model="searchQuery"
        prepend-inner-icon="mdi-magnify"
        label="Search digital products..."
        hide-details
        clearable
        class="flex-grow-1"
        style="min-width: 200px"
      ></v-text-field>
    </v-card>

    <!-- Products Table -->
    <v-card class="border-thin shadow-sm overflow-hidden" :loading="loading">
      <div v-if="loading" class="pa-16 text-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>
      <div v-else class="overflow-x-auto">
        <v-table hover class="digital-table">
          <thead class="bg-grey-lighten-4">
            <tr>
              <th style="width: 60px">PREVIEW</th>
              <th>TITLE</th>
              <th style="width: 100px">PRICE</th>
              <th style="width: 120px">PDF</th>
              <th style="width: 100px">STATUS</th>
              <th style="width: 110px">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in filteredProducts" :key="product.id">
              <td class="py-2">
                <v-avatar size="44" class="rounded-lg border">
                  <v-img :src="product.preview_image_url" cover>
                    <template v-slot:placeholder>
                      <v-icon color="grey">mdi-image</v-icon>
                    </template>
                  </v-img>
                </v-avatar>
              </td>
              <td>
                <div class="font-weight-bold text-body-2">{{ product.title }}</div>
                <div class="text-caption text-grey text-truncate" style="max-width: 250px">
                  {{ product.description || 'No description' }}
                </div>
              </td>
              <td class="font-weight-bold">{{ CONFIG.CURRENCY_SYMBOL }}{{ product.price }}</td>
              <td>
                <v-chip size="small" :color="product.original_pdf_path ? 'success' : 'error'" variant="tonal">
                  <v-icon start size="14">{{ product.original_pdf_path ? 'mdi-check-circle' : 'mdi-alert' }}</v-icon>
                  {{ product.original_pdf_path ? 'Uploaded' : 'Missing' }}
                </v-chip>
              </td>
              <td>
                <v-switch
                  :model-value="product.is_active"
                  color="success"
                  hide-details
                  density="compact"
                  @update:model-value="toggleStatus(product, $event)"
                ></v-switch>
              </td>
              <td>
                <v-btn icon="mdi-pencil" size="small" variant="text" color="primary" @click="openDialog(product)"></v-btn>
                <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="confirmDelete(product)"></v-btn>
              </td>
            </tr>
            <tr v-if="filteredProducts.length === 0">
              <td colspan="6" class="text-center py-16 text-grey">
                <v-icon size="48" color="grey-lighten-2" class="mb-2">mdi-file-document-outline</v-icon>
                <div>No digital products found</div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>
    </v-card>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="700" persistent scrollable>
      <v-card class="rounded-xl">
        <v-toolbar flat class="border-b">
          <v-toolbar-title class="luxury-font font-weight-bold">
            {{ isEditing ? 'Edit Digital Product' : 'Add Digital Product' }}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="dialog = false"></v-btn>
        </v-toolbar>

        <v-card-text class="pa-6">
          <v-form ref="productForm" v-model="formValid">
            <v-text-field
              v-model="editedItem.title"
              label="Product Title"
              :rules="[v => !!v || 'Title is required']"
              class="mb-3"
            ></v-text-field>

            <v-text-field
              v-model="editedItem.price"
              label="Price"
              type="number"
              :prefix="CONFIG.CURRENCY_SYMBOL"
              :rules="[v => !!v || 'Price is required', v => v > 0 || 'Must be positive']"
              class="mb-3"
            ></v-text-field>

            <v-textarea
              v-model="editedItem.description"
              label="Description"
              rows="3"
              counter
              class="mb-4"
            ></v-textarea>

            <!-- Preview Image Upload -->
            <div class="mb-4">
              <div class="text-overline text-grey mb-2">PREVIEW IMAGE (watermarked, shown to customers)</div>
              <div v-if="editedItem.preview_image_url || previewImagePreview" class="mb-3">
                <v-img
                  :src="previewImagePreview || editedItem.preview_image_url"
                  max-height="150"
                  max-width="150"
                  class="rounded-lg border"
                  cover
                ></v-img>
              </div>
              <v-btn variant="outlined" prepend-icon="mdi-image" @click="$refs.previewInput.click()">
                {{ editedItem.preview_image_url ? 'Change Image' : 'Upload Preview' }}
              </v-btn>
              <input ref="previewInput" type="file" accept="image/*" hidden @change="handlePreviewSelect" />
            </div>

            <!-- PDF Upload -->
            <div class="mb-4">
              <div class="text-overline text-grey mb-2">ORIGINAL PDF (private — customers download this)</div>
              <v-chip v-if="editedItem.original_pdf_path || selectedPdf" color="success" variant="tonal" class="mb-3">
                <v-icon start>mdi-file-pdf-box</v-icon>
                {{ selectedPdf ? selectedPdf.name : 'PDF uploaded' }}
              </v-chip>
              <div v-if="!editedItem.original_pdf_path && !selectedPdf" class="text-caption text-error mb-2">
                * PDF file is required
              </div>
              <v-btn variant="outlined" color="error" prepend-icon="mdi-file-pdf-box" @click="$refs.pdfInput.click()">
                {{ editedItem.original_pdf_path ? 'Replace PDF' : 'Upload PDF' }}
              </v-btn>
              <input ref="pdfInput" type="file" accept=".pdf" hidden @change="handlePdfSelect" />
            </div>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="saveLoading"
            @click="saveProduct"
            class="px-8"
          >
            {{ isEditing ? 'Update' : 'Add Product' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation -->
    <v-dialog v-model="deleteDialog" max-width="450">
      <v-card class="pa-6 rounded-xl text-center">
        <v-icon color="error" size="64" class="mb-4">mdi-alert-circle-outline</v-icon>
        <h2 class="luxury-font mb-2">Deactivate Product?</h2>
        <p class="text-grey mb-6 text-body-1">
          <b>{{ selectedItem?.title }}</b> will be hidden from customers. Existing purchases remain valid.
        </p>
        <v-card-actions class="d-flex justify-end gap-4">
          <v-btn variant="tonal" color="grey" @click="deleteDialog = false" class="rounded-lg px-6">Keep it</v-btn>
          <v-btn color="error" variant="flat" @click="deleteProduct" class="rounded-lg px-6">Deactivate</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import { DigitalProductService } from '../services/DigitalProductService'
import { CONFIG } from '../config/constants'

const props = defineProps({
  showAddDialog: Boolean
})
const emit = defineEmits(['dialog-closed'])

const products = ref([])
const searchQuery = ref('')
const dialog = ref(false)
const deleteDialog = ref(false)
const isEditing = ref(false)
const formValid = ref(false)
const saveLoading = ref(false)
const loading = ref(true)
const selectedItem = ref(null)
const previewImagePreview = ref('')
const selectedPreviewFile = ref(null)
const selectedPdf = ref(null)
const productForm = ref(null)
const showMessage = inject('showMessage')

const editedItem = ref({
  title: '',
  price: '',
  description: '',
  preview_image_url: '',
  original_pdf_path: ''
})

// Watch for external trigger
import { watch } from 'vue'
watch(() => props.showAddDialog, (val) => {
  if (val) openDialog()
})
watch(dialog, (val) => {
  if (!val) emit('dialog-closed')
})

const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value
  const q = searchQuery.value.toLowerCase()
  return products.value.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.description?.toLowerCase().includes(q)
  )
})

const fetchProducts = () => {
  loading.value = true
  DigitalProductService.getAllDigitalProducts()
    .then((data) => { products.value = data })
    .catch(() => { showMessage('Error fetching digital products', 'error') })
    .finally(() => { loading.value = false })
}

const openDialog = (item = null) => {
  previewImagePreview.value = ''
  selectedPreviewFile.value = null
  selectedPdf.value = null
  if (item) {
    isEditing.value = true
    selectedItem.value = item
    editedItem.value = { ...item }
  } else {
    isEditing.value = false
    selectedItem.value = null
    editedItem.value = { title: '', price: '', description: '', preview_image_url: '', original_pdf_path: '' }
  }
  dialog.value = true
}

const handlePreviewSelect = (e) => {
  const file = e.target.files[0]
  if (file) {
    selectedPreviewFile.value = file
    previewImagePreview.value = URL.createObjectURL(file)
  }
}

const handlePdfSelect = (e) => {
  const file = e.target.files[0]
  if (file) {
    if (!file.name.endsWith('.pdf')) {
      showMessage('Only PDF files are allowed', 'error')
      return
    }
    selectedPdf.value = file
  }
}

const saveProduct = async () => {
  const { valid } = await productForm.value.validate()
  if (!valid) return

  // Require PDF for new products
  if (!isEditing.value && !selectedPdf.value) {
    showMessage('Please upload a PDF file', 'error')
    return
  }

  saveLoading.value = true
  try {
    let previewUrl = editedItem.value.preview_image_url
    let pdfPath = editedItem.value.original_pdf_path

    // Upload preview image if selected
    if (selectedPreviewFile.value) {
      previewUrl = await DigitalProductService.uploadPreviewImage(selectedPreviewFile.value)
    }

    // Upload PDF if selected
    if (selectedPdf.value) {
      pdfPath = await DigitalProductService.uploadOriginalPdf(selectedPdf.value)
    }

    const payload = {
      title: editedItem.value.title,
      price: parseFloat(editedItem.value.price),
      description: editedItem.value.description,
      preview_image_url: previewUrl,
      original_pdf_path: pdfPath
    }

    if (isEditing.value) {
      await DigitalProductService.updateDigitalProduct(selectedItem.value.id, payload)
      showMessage('Product updated!')
    } else {
      await DigitalProductService.createDigitalProduct(payload)
      showMessage('Product created!')
    }

    dialog.value = false
    fetchProducts()
  } catch (err) {
    showMessage(err.message || 'Error saving product', 'error')
  } finally {
    saveLoading.value = false
  }
}

const toggleStatus = (product, value) => {
  DigitalProductService.updateDigitalProduct(product.id, { is_active: value })
    .then(() => { showMessage(value ? 'Product activated' : 'Product deactivated'); fetchProducts() })
    .catch(() => { showMessage('Error updating status', 'error') })
}

const confirmDelete = (item) => {
  selectedItem.value = item
  deleteDialog.value = true
}

const deleteProduct = () => {
  DigitalProductService.deleteDigitalProduct(selectedItem.value.id)
    .then(() => { showMessage('Product deactivated'); deleteDialog.value = false; fetchProducts() })
    .catch((err) => { showMessage(err.message, 'error') })
}

let sub = null
onMounted(() => {
  try {
    fetchProducts()
    sub = DigitalProductService.subscribeToDigitalProducts('admin-digital-products', () => { fetchProducts() })
  } catch (err) {
    console.error('DigitalProductAdmin mount error:', err)
  }
})

onUnmounted(() => {
  if (sub) sub.unsubscribe()
})
</script>

<style scoped>
.digital-table { min-width: 700px; }
.gap-4 { gap: 16px; }
</style>
