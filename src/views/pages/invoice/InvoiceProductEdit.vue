<script setup>
import { onMounted, ref, watch, computed, toRaw } from 'vue'
import axios from 'axios'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  data: {
    type: Object,
    required: true,
    default: () => ({
      title: '',
      precio: 0,
      cantidad: 1,
      total: 0,
    }),
  },
})

const emit = defineEmits(['removeProduct', 'totalAmount'])

// Datos dinámicos desde BD
const itemsOptions = ref([])
const selectedItem = ref(null)
const localProductData = ref({
  ...structuredClone(toRaw(props.data)),
  tipo: props.data.tipo || 'credito', // por defecto es crédito
})

const getItems = async () => {
  const resp = await $api('/items', {
    method: 'GET',
    onResponseError(response) {
      console.error('Error cargando items:', response.response)
    }
  })

  itemsOptions.value = JSON.parse(JSON.stringify(resp))

  // Si hay un valor por defecto (viene de props), seleccionarlo
  if (props.data?.title) {
    selectedItem.value = props.data.title
  }
}
// Cargar datos al montar componente
onMounted(getItems)


// Escucha el cambio en selección
watch(selectedItem, (newVal) => {
  const selected = itemsOptions.value.find(item => item.title === newVal)
  if (selected) {
    localProductData.value = {
      ...localProductData.value, // Mantén cantidad y tipo actuales
      title: selected.title,
      precio: selected.precio,
      description: selected.description || '',
      item_id: selected.id,
    }
  }
})

// Calcular total
const totalPrice = computed(() => {
  const precio = Number(localProductData.value?.precio || 0)
  const cantidad = Number(localProductData.value?.cantidad || 1)
  const totalItem = precio * cantidad

  return localProductData.value.tipo === 'debito'
    ? (-totalItem).toFixed(2)
    : totalItem.toFixed(2)
})

watch(localProductData, (val) => {
  emit('update-product', { id: props.id, data: { ...val } })
}, { deep: true })

// Emitir total
watch(totalPrice, () => {
  emit('totalAmount', totalPrice.value)
}, { immediate: true })

// Eliminar producto
const removeProduct = () => {
  emit('removeProduct', props.id)
}

watchEffect(() => {
  if (props.data?.item_id && itemsOptions.value.length) {
    const item = itemsOptions.value.find(i => i.id === props.data.item_id)
    if (item) selectedItem.value = item.title
  } else if (props.data?.title) {
    selectedItem.value = props.data.title
  }
})

const totalPriceCOP = computed(() => {
  const value = Number(totalPrice.value)
  const absValue = Math.abs(value)
  const formatted = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(absValue)
  return localProductData.value.tipo === 'debito' ? `-${formatted}` : formatted
})
</script>


<template>
  <!-- Header -->
  <div class="add-products-header mb-2 d-none d-md-flex mb-4">
    <VRow class="me-0 w-100">
      <VCol cols="12" md="3">
        <h6 class="text-h6">Item</h6>
      </VCol>
      <VCol cols="12" md="2">
        <h6 class="text-h6">Precio</h6>
      </VCol>
      <VCol cols="12" md="2">
        <h6 class="text-h6">Cantidad</h6>
      </VCol>
      <VCol cols="12" md="2">
        <h6 class="text-h6">Total</h6>
      </VCol>
    </VRow>
  </div>

  <VCard flat border class="d-flex flex-sm-row flex-column-reverse">
    <!-- 👉 Left Form -->
    <div class="pa-5 flex-grow-1 w-100">
      <VRow>
        <!-- Item -->
        <!-- Item -->
        <VCol cols="12" md="3">
          <VSelect v-model="selectedItem" :items="itemsOptions" item-title="title" item-value="title"
            label="Select Item" placeholder="Select Item" class="mb-3" />
          <VTextarea v-model="localProductData.description" rows="2" label="Descripción"
            placeholder="Descripción del ítem" />
        </VCol>

        <!-- Precio -->
        <VCol cols="12" md="2">
          <VTextField v-model="localProductData.precio" type="number" label="Precio" placeholder="100" />
        </VCol>

        <!-- Cantidad -->
        <VCol cols="12" md="2">
          <VTextField v-model="localProductData.cantidad" type="number" label="Cantidad" placeholder="5" />
        </VCol>

        <!-- Tipo -->
        <VCol cols="12" md="2">
          <VSelect v-model="localProductData.tipo" :items="['credito', 'debito']" label="Tipo" item-title="Tipo"
            item-value="tipo" class="mb-3" />
        </VCol>

        <!-- Total -->
        <VCol cols="12" md="3" class="d-flex align-center">
          <div>
            <span class="d-inline d-md-none">Total: </span>
            <span class="text-high-emphasis text-h6">
              {{ totalPriceCOP }}
            </span>
          </div>
        </VCol>

      </VRow>
    </div>

    <!-- 👉 Item Actions -->
    <div class="d-flex flex-column align-end justify-start pa-2"
      :class="$vuetify.display.smAndUp ? 'border-s' : 'border-b'">
      <IconBtn @click="removeProduct">
        <VIcon :size="24" icon="ri-close-line" />
      </IconBtn>
    </div>
  </VCard>
</template>
