<script setup>
import EcommerceSalesOverview from '@/views/pages/dashboardAdmin/EcommerceSalesOverview.vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'


definePage({
  meta: {
    permissions: 'ver_dashboard_admin'
  },
})

// Recibos pendientes
const recibosPendientes = ref([])
const isLoadingRecibos = ref(false)
const reciboSeleccionado = ref(null)
const showReciboModal = ref(false)
const aprobando = ref(false)
const aprobacionMsg = ref(null)
const router = useRouter()
// Dashboard profesional por inmueble
const reportes = ref([])
const isLoadingReportes = ref(false)

const getRecibosPendientes = async () => {
  isLoadingRecibos.value = true
  try {
    const resp = await $api('pagos/pendientes-aprobacion', { method: 'GET' })
    recibosPendientes.value = resp.pagos || resp || []
  } catch (e) {
    recibosPendientes.value = []
  } finally {
    isLoadingRecibos.value = false
  }
}

const verRecibo = (recibo) => {
  reciboSeleccionado.value = recibo
  aprobacionMsg.value = null
  showReciboModal.value = true
}

// Cargar reportes agrupados por inmueble usando el endpoint novedades/reporte-completo (sin parámetro)
const cargarReportes = async () => {
  isLoadingReportes.value = true
  try {
    const resp = await $api('novedades/reporte-completo', { method: 'GET' })
    // El backend retorna { reporte: [...] }
    reportes.value = Array.isArray(resp.reporte) ? resp.reporte : []
  } catch (e) {
    reportes.value = []
  } finally {
    isLoadingReportes.value = false
  }
}

const aprobarRecibo = async () => {
  aprobando.value = true
  aprobacionMsg.value = null
  try {
    await $api(`/pagos/${reciboSeleccionado.value.id}/aprobar`, { method: 'POST' })
    aprobacionMsg.value = 'Recibo aprobado correctamente.'
    await getRecibosPendientes()
    showReciboModal.value = false
    aprobacionMsg.value = 'Redirigiendo...'
    setTimeout(() => {
      router.push("/AgregarRecibos");
      aprobacionMsg.value = null
    }, 1000)
  } catch (e) {
    aprobacionMsg.value = 'No se pudo aprobar el recibo.'
  } finally {
    aprobando.value = false
  }
}

onMounted(getRecibosPendientes )
onMounted(cargarReportes)
const BASE_URL = import.meta.env.VITE_API_LARAVEL_BASE_URL

</script>

<template>
  <VRow class="match-height">
    <!-- 👉 Sales Overview -->
    <VCol cols="12" md="6">
      <EcommerceSalesOverview />
    </VCol>

    <!-- 👉 Recibos Pendientes Panel -->
    <VCol cols="12" md="6">
      <VCard class="mb-6">
        <VCardTitle class="font-weight-bold">Recibos Pendientes</VCardTitle>
        <VCardText>
          <div v-if="isLoadingRecibos" class="text-center my-4">
            <VProgressCircular indeterminate color="primary" />
          </div>
          <VAlert v-if="recibosPendientes.length === 0 && !isLoadingRecibos" type="info" class="mb-2">
            No hay recibos pendientes.
          </VAlert>
          <VList v-else>
            <VListItem v-for="recibo in recibosPendientes" :key="recibo.id" @click="verRecibo(recibo)"
              class="recibo-list-item" style="cursor:pointer">
              <VListItemTitle>
                {{ recibo.inmueble_direccion || 'Inmueble #' + recibo.inmueble_id }}
              </VListItemTitle>
              <VListItemSubtitle>
                {{ recibo.item_nombre || 'Concepto #' + recibo.item_id }}<br>
                <span class="text-grey">Valor: {{ new Intl.NumberFormat('es-CO', {
                  style: 'currency', currency: 'COP'
                }).format(recibo.valor) }}</span>
              </VListItemSubtitle>
              <template #append>
                <VChip color="warning" size="small">Pendiente</VChip>
              </template>
            </VListItem>
          </VList>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Popup Detalle Recibo -->
    <VDialog v-model="showReciboModal" max-width="600px">
      <VCard>
        <VCardTitle class="font-weight-bold">
          Detalle del Recibo
        </VCardTitle>
        <VCardText>
          <VAlert v-if="aprobacionMsg" type="success" class="mb-2">{{ aprobacionMsg }}</VAlert>
          <div v-if="reciboSeleccionado">
            <p><strong>Inmueble:</strong> {{ reciboSeleccionado.inmueble_direccion || reciboSeleccionado.inmueble_id }}
            </p>
            <p><strong>Concepto:</strong> {{ reciboSeleccionado.item_nombre || reciboSeleccionado.item_id }}</p>
            <p><strong>Valor:</strong> {{ new Intl.NumberFormat('es-CO', {
              style: 'currency', currency: 'COP'
            }).format(reciboSeleccionado.valor) }}</p>
            <p><strong>Descripción:</strong> {{ reciboSeleccionado.descripcion }}</p>
            <p><strong>Estado:</strong>
              <VChip color="warning" size="small">Pendiente</VChip>
            </p>
            <div v-if="reciboSeleccionado.ruta_imagen_pago">
              <img :src="reciboSeleccionado.ruta_imagen_pago" alt="Comprobante"
                style="max-width:100%;border-radius:10px;border:1px solid #eee;" />
              <div class="mt-2">
                <a :href="reciboSeleccionado.ruta_imagen_pago.startsWith('http') ? reciboSeleccionado.ruta_imagen_pago : BASE_URL + reciboSeleccionado.ruta_imagen_pago"
                  target="_blank" rel="noopener" style="color: #1976d2; text-decoration: underline;">
                  Ver imagen en nueva pestaña
                </a>
              </div>
            </div>
          </div>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn color="success" :loading="aprobando" @click="aprobarRecibo">
            Aprobar
          </VBtn>
          <VBtn color="secondary" variant="outlined" @click="showReciboModal = false">
            Cerrar
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
    <!-- Card profesional por inmueble -->
    <VRow class="mt-4">
      <VCol cols="12">
        <div v-if="isLoadingReportes" class="text-center my-8">
          <VProgressCircular indeterminate color="primary" size="48" />
        </div>
        <VAlert v-else-if="!isLoadingReportes && reportes.length === 0" type="info" class="my-8">
          No hay reportes de inmuebles disponibles.
        </VAlert>
      </VCol>
      <VCol v-for="reporte in reportes" :key="reporte.inmueble_id + '-' + reporte.user_id" cols="12" md="6" lg="4">
        <VCard elevation="2" class="pa-4 mb-6">
          <VCardTitle class="font-weight-bold text-h6 mb-2">
            Inmueble #{{ reporte.inmueble_id }} - {{ reporte.inmueble_direccion || 'Sin dirección' }}
          </VCardTitle>
          <VCardText>
            <div class="mb-2">
              <strong>Arrendatario:</strong> {{ reporte.usuario_nombre || '-' }}
            </div>
            <div>
              <span>Total novedades: </span>
              <strong>{{ reporte.total }}</strong>
            </div>
            <div class="mt-2">
              <strong>Listado de novedades:</strong>
              <VList density="compact" class="mt-1">
                <VListItem v-for="novedad in reporte.novedades" :key="novedad.id">
                  <VListItemTitle>
                    <span class="font-weight-bold">{{ novedad.nombre }}</span> - {{ novedad.item_nombre }}
                  </VListItemTitle>
                  <VListItemSubtitle>
                    <span class="text-grey">{{ novedad.descripcion }}</span><br>
                    <span>Fecha: {{ novedad.fecha }}</span> |
                    <span>Estado: <VChip :color="novedad.estado && novedad.estado.toLowerCase() === 'pendiente' ? 'warning' : 'success'" size="x-small">{{ novedad.estado }}</VChip></span> |
                    <span>Valor: {{ new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(Number(novedad.valor)) }}</span>
                  </VListItemSubtitle>
                </VListItem>
              </VList>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </VRow>
</template>