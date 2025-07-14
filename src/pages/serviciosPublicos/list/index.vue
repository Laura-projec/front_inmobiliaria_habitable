<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/views/js/userStore'

const isLoading = ref(false)
const warning = ref(null)
const serviciosPublicos = ref([])

const userStore = useUserStore()
const user = computed(() => userStore.user)
const userRole = computed(() => user.value?.role?.name?.toLowerCase() || '')
const userId = computed(() => user.value?.id)
const userInmuebleId = computed(() => user.value?.inmueble_id || null)

// Agrupar por inmueble_id
const serviciosPorInmueble = computed(() => {
  const grouped = {}

  serviciosPublicos.value.forEach(servicio => {
    const inmuebleId = servicio.inmueble_id
    if (!grouped[inmuebleId]) grouped[inmuebleId] = []
    grouped[inmuebleId].push(servicio)
  })

  return grouped
})

const getServiciosPublicos = async () => {
  isLoading.value = true
  warning.value = null

  try {
    let endpoint = '/public-services'
    if (userRole.value === 'propietarios') {
      endpoint = `/public-services?propietario_id=${userId.value}`
    } else if (userRole.value === 'arrendatario' || userRole.value === 'inquilino') {
      endpoint = `/public-services?inmueble_id=${userInmuebleId.value}`
    }
    // Si es super-admin o administrador, endpoint queda igual

    const resp = await $api(endpoint, { method: 'GET' })
    serviciosPublicos.value = resp || []
  } catch (error) {
    console.error('Error al obtener servicios públicos:', error)
    warning.value = 'Hubo un error al cargar los servicios públicos.'
  } finally {
    isLoading.value = false
  }
}

onMounted(getServiciosPublicos)

const noServicios = computed(() => !isLoading.value && serviciosPublicos.value.length === 0)

const currentPage = ref(1)
const itemsPerPage = ref(6)

// Servicios paginados
const paginatedServicios = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return Object.entries(serviciosPorInmueble.value).map(([inmuebleId, servicios]) => ({
    inmuebleId,
    servicios: servicios.slice(start, end),
    total: servicios.length,
  }))
})

// Cambiar página
const changePage = (page) => {
  currentPage.value = page
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardText>
          <h3 class="mb-4">Listado de Servicios Públicos</h3>

          <!-- Alerta de error -->
          <VAlert type="warning" v-if="warning" class="mb-4">
            <strong>{{ warning }}</strong>
          </VAlert>

          <!-- Cargando -->
          <div v-if="isLoading" class="text-center my-6">
            <VProgressCircular indeterminate color="primary" />
          </div>

          <!-- Servicios agrupados por inmueble -->
          <div v-else>
            <div v-for="({ inmuebleId, servicios, total }, index) in paginatedServicios" :key="index" class="mb-6">
              <h4 class="text-h6 mb-2">
                🏠 Inmueble ID: {{ inmuebleId }}
              </h4>

              <VRow>
                <VCol cols="12" md="4" v-for="(servicio, index) in servicios" :key="index">
                  <VCard class="mb-3">
                    <VCardText>
                      <p><strong>Servicio:</strong> {{ servicio.servicio }}</p>
                      <p><strong>NIU:</strong> {{ servicio.niu }}</p>
                      <p>
                        <strong>URL de Pago:</strong>
                        <a :href="servicio.urlpago" target="_blank" class="text-primary">
                          {{ servicio.urlpago }}
                        </a>
                      </p>
                      <!-- Botón Editar -->
                      <VBtn color="primary" size="small" prepend-icon="ri-edit-line"
                        :to="`/serviciosPublicos/edit/${servicio.id}`">
                        Editar
                      </VBtn>
                    </VCardText>
                  </VCard>
                </VCol>
              </VRow>

              <!-- Paginador -->
              <VPagination v-if="total > itemsPerPage" v-model="currentPage" :length="Math.ceil(total / itemsPerPage)"
                class="mt-4" />
            </div>

            <!-- Si no hay servicios -->
            <p v-if="noServicios" class="text-grey text-center mt-6">
              No hay servicios públicos disponibles.
            </p>
          </div>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>