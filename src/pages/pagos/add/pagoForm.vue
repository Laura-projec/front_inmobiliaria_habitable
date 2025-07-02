<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/views/js/userStore'

const router = useRouter()
const isLoading = ref(false)
const warning = ref(null)
const successMessage = ref(null)

const search = ref('')
const clients = ref([])
const properties = ref([])
const items = ref([])
const arriendo = ref(null) // Nuevo: para el arriendo del inquilino

const pago = ref({
  propietario: '',
  inmueble_id: '',
  item_id: '',
  valor: '',
  descripcion: '',
  imagen_pago: null,
})

// User & roles
const userStore = useUserStore()
const user = computed(() => userStore.user)
console.log(`Usuario actual:`, user.value);

const isOwner = computed(() => user.value?.role?.id === 39)
const isTenant = computed(() => user.value?.role?.id === 40)
const isAdmin = computed(() => user.value?.role?.id === 1 || user.value?.role?.id === 2)
const userId = computed(() => user.value?.idUser || user.value?.id)

// Obtener arriendo del inquilino
const getArriendoByTitular = async () => {   
  const resp = await $api(`/arriendos?titular=${userId.value}`, { method: 'GET' })
  // Suponiendo que solo puede tener un arriendo activo
  arriendo.value = Array.isArray(resp.arriendos) ? resp.arriendos[0] : resp.arriendo
  
  if (arriendo.value) {
    pago.value.inmueble_id = arriendo.value.inmueble_id
    pago.value.valor = arriendo.value.valor_arriendo // Puedes sugerir el valor del arriendo
  }
}

// Obtener items/conceptos de pago
const getItems = async () => {
  try {
    const resp = await $api('/items', { method: 'GET' })
    items.value = resp || []
  } catch (error) {
    console.error('Error al obtener los items:', error)
  }
}

const crearPago = async () => {
  warning.value = null
  successMessage.value = null

  // Validaciones manuales
  if (!pago.value.inmueble_id) {
    warning.value = 'Debe tener un inmueble asociado al arriendo.'
    return
  }
  if (!pago.value.item_id) {
    warning.value = 'Debe seleccionar un concepto.'
    return
  }
  if (!pago.value.valor || Number(pago.value.valor) <= 0) {
    warning.value = 'El valor es obligatorio y debe ser mayor a 0.'
    return
  }
  if (!pago.value.imagen_pago) {
    warning.value = 'Debe adjuntar el comprobante de pago (imagen obligatoria).'
    return
  }

  isLoading.value = true
  try {
    const formData = new FormData()
    formData.append('user_id', userId.value)
    formData.append('inmueble_id', pago.value.inmueble_id)
    formData.append('item_id', pago.value.item_id)
    formData.append('valor', pago.value.valor)
    formData.append('descripcion', pago.value.descripcion)
    formData.append('imagen_pago', pago.value.imagen_pago)

    await $api('/pagos', {
      method: 'POST',
      body: formData,
    })

    successMessage.value = 'Pago registrado correctamente.'
    setTimeout(() => router.push('/pagos'), 1500)
  } catch (error) {
    warning.value = 'Hubo un error al registrar el pago. Verifica los datos e intenta nuevamente.'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  console.log(isOwner.value, isTenant.value, isAdmin.value);
  
  if (isTenant.value) {
    await getArriendoByTitular()
  }
  await getItems()
})
</script>

<template>
  <div class="add-dano-bg">
    <VCard class="pa-8 add-dano-card mb-6">
      <div class="d-flex flex-wrap justify-space-between align-center mb-6">
        <h3 class="mb-0 font-weight-bold">Registrar Pago</h3>
        <div>
          <VBtn color="secondary" variant="outlined" @click="router.push('/pagos')" class="me-2">
            Cancelar
          </VBtn>
          <VBtn color="primary" :loading="isLoading" prepend-icon="ri-save-line" @click="crearPago">
            Registrar Pago
          </VBtn>
        </div>
      </div>

      <VAlert type="warning" v-if="warning" class="mb-4">
        <strong>{{ warning }}</strong>
      </VAlert>
      <VAlert type="success" v-if="successMessage" class="mb-4">
        {{ successMessage }}
      </VAlert>

      <VForm @submit.prevent="crearPago">
        <VRow dense>
          <VCol cols="12" md="6">
            <VSelect v-model="pago.item_id" :items="items" item-title="title" item-value="id" label="Concepto"
              class="mb-4" outlined />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="pago.valor" label="Valor" type="number" class="mb-4" outlined />
          </VCol>
          <VCol cols="12">
            <VTextarea v-model="pago.descripcion" label="Descripción" class="mb-4" outlined />
          </VCol>
          <VCol cols="12" md="6">
            <VFileInput v-model="pago.imagen_pago" label="Comprobante de pago (obligatorio)" class="mb-4" outlined
              accept="image/*" />
          </VCol>
        </VRow>
      </VForm>
    </VCard>
  </div>
</template>
<style lang="scss" scoped>
.add-dano-bg {
  background: #f3f4f6;
  min-height: 100vh;
  padding: 2rem 0;
}

.add-dano-card {
  background: #fff !important;
  border-radius: 18px;
  box-shadow: 0 2px 12px 0 rgba(60, 60, 60, 0.07);
  max-width: 1100px;
  margin-left: 2rem;
  margin-right: 2rem;
}

.mb-4 {
  margin-bottom: 1rem !important;
}

.me-2 {
  margin-right: 0.5rem !important;
}
</style>