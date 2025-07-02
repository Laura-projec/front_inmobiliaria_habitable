<script setup>
import { ref, onMounted } from 'vue'
import { VCardText } from 'vuetify/components'

const router = useRouter()
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

// 🚀 Traer los recibos
const fetchRecibos = async () => {
  const resp = await $api('/recibos-list?search=' + (searchQuery.value ? searchQuery.value : ''), { method: 'GET' })
  recibos.value = resp.recibos
}

onMounted(fetchRecibos)

// 👉 Función de impresión
const invoicePreviewRef = ref(null)

const printInvoice = (id) => {
  // Navegar a la página de recibo con el ID correspondiente

  // router.push({ name: 'ver-recibo', params: { id }, query: { imprimir: 'true' } })
  router.push({ name: 'recibo-print', params: { id }, query: { imprimir: 'true' } })
  // Aquí asumimos que el componente InvoicePreview está en esa página,
  // y después se imprime automáticamente cuando el recibo se cargue
  setTimeout(() => {
    // Aquí puedes llamar al método de impresión del componente hijo si es necesario
    const section = invoicePreviewRef.value?.printSection
    if (!section) return alert('No se encontró la sección de impresión')
    const originalContent = document.body.innerHTML
    const printContent = section.innerHTML
    document.body.innerHTML = printContent
    window.print()
    document.body.innerHTML = originalContent
  }, 1000) // Esperar un poco para que la vista se cargue
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

      <VBtn prepend-icon="ri-add-line" :to="{ name: 'agregar-recibos' }">
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
