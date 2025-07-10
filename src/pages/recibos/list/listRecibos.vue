<script setup>
import { ref, onMounted, computed } from 'vue'
import { VCardText } from 'vuetify/components' 
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/views/js/useAuthStore'
import { useUserStore } from '@/views/js/userStore'

const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()
const user = computed(() => userStore.user)
console.log('user inicial', user.value);

const userRole = computed(() => user.value?.role?.name?.toLowerCase() || '')
const userId = computed(() => user.value?.idUser)
const userInmuebleId = computed(() => user.value?.inmueble_id)

const canCreateRecibo = computed(() => (authStore.permissions || []).includes('create_recibos'))
const searchQuery = ref(null)
const isListUserVisible = ref(true)
const recibos = ref([])
// Configuración de las columnas de la tabla
const headers = [
  { title: 'Id', key: 'id' },
  { title: 'Propietario', key: 'userFullName' },
  { title: 'Inqulino', key: '' },
  { title: 'Fecha', key: 'fecha' },
  { title: 'Total', key: 'total' },
  { title: 'Acciones', key: 'actions' },
]

// 🚀 Traer los recibos según el rol
const fetchRecibos = async () => {
  let endpoint = '/recibos-list?'
  if (searchQuery.value) endpoint += `search=${searchQuery.value}&`

  if (userRole.value === 'super-admin' || userRole.value === 'administrador') {
    // No agregar filtros, mostrar todo
    console.log('user final', userRole.value, userId.value);
    
  } else if (userRole.value === 'propietario') {
    endpoint += `propietario_id=${userId.value}&`
  } else if (userRole.value === 'arrendatario' || userRole.value === 'inquilino') {
    endpoint += `inquilino_id=${userId.value}&`
  }
  const resp = await $api(endpoint, { method: 'GET' })
  recibos.value = resp.recibos
}

onMounted(fetchRecibos)

// 👉 Función de impresión
const invoicePreviewRef = ref(null)

const printInvoice = (id) => {
  router.push({ name: 'recibo-print', params: { id }, query: { imprimir: 'true' } })
  setTimeout(() => {
    const section = invoicePreviewRef.value?.printSection
    if (!section) return alert('No se encontró la sección de impresión')
    const originalContent = document.body.innerHTML
    const printContent = section.innerHTML
    document.body.innerHTML = printContent
    window.print()
    document.body.innerHTML = originalContent
  }, 1000)
}

// Configuración de la página (sin cambios)
definePage({
  meta: {
    permissions: 'list_inmuebles',
  },
})
</script>

<template>
  <VCard v-if="isListUserVisible" title="Recibos">
    <VCardText class="d-flex flex-wrap gap-4">
      <div class="d-flex align-center">
        <VTextField v-model="searchQuery" placeholder="Buscar" style="inline-size: 200px" density="compact" class="me-3"
          @keyup.enter="fetchRecibos" />
      </div>

      <VBtn v-if="canCreateRecibo" prepend-icon="ri-add-line" :to="{ name: 'agregar-recibos' }">
        Crear Recibo
      </VBtn>

      <VSpacer />

      <VDataTable :headers="headers" :items="recibos" :items-per-page="5" class="text-no-wrap">
        <!-- 👉 Acciones -->
        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <!-- <VBtn @click="$router.push({ name: 'ver-recibo', params: { id: item.id } })">Ver</VBtn> -->
            <VBtn @click="printInvoice(item.id)" variant="outlined">Ver/Imprimir</VBtn>

            <!-- <v-tooltip location="top">
              <template #activator="{ props }">
                <VBtn v-bind="props" variant="outlined" icon>
                  <v-icon>mdi-close</v-icon>  
                </VBtn>
              </template>
<span>Anular</span>
</v-tooltip> -->
          </div>
        </template>
        <template #item.total="{ item }">
          {{ new Intl.NumberFormat('es-CO', {
            style: 'currency', currency: 'COP', maximumFractionDigits: 0
          }).format(Number(item.total)) }}
        </template>
      </VDataTable>
    </VCardText>
  </VCard>
</template>
