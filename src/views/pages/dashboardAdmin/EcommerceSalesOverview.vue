<script setup>
import { ref, onMounted } from 'vue'

const statistics = ref([])
const inquilinosNovedades = ref([])

onMounted(async () => {
  try {
    const data = await $api('/estadisticas', { method: 'GET' })
    statistics.value = [
      { title: 'Total Inmuebles', stats: data.total, icon: 'ri-building-line', color: 'primary' },
      { title: 'Venta', stats: data.venta, icon: 'ri-price-tag-line', color: 'warning' },
      { title: 'Vendidos', stats: data.vendidos, icon: 'ri-price-tag-3-line', color: 'info' },
      { title: 'Arriendo', stats: data.arriendo, icon: 'ri-home-line', color: 'warning' },
      { title: 'Sin arriendo', stats: data.sin_arriendo, icon: 'ri-arrow-left-right-line', color: 'info' },
      { title: 'En arriendo', stats: data.en_arriendo, icon: 'ri-arrow-left-right-line', color: 'info' },
    ]

    // Cargar inquilinos con novedades activas
    const inquilinos = await $api('/dashboard/inquilinos-novedades', { method: 'GET' })
    inquilinosNovedades.value = inquilinos
  } catch (error) {
    console.error('Error cargando estadísticas o inquilinos:', error)
  }
})
</script>

<template>
  <VCard>
    <VCardItem>
      <VCardTitle>Información total inmuebles</VCardTitle>
      <VCardSubtitle class="d-flex align-center gap-x-2">
        <div class="d-flex align-center text-success font-weight-medium">
          +18%
          <VIcon icon="ri-arrow-up-s-line" size="20" />
        </div>
      </VCardSubtitle>
    </VCardItem>

    <VCardText>
      <VRow>
        <VCol
          v-for="item in statistics"
          :key="item.title"
          cols="12"
          sm="4"
          class="d-flex align-center mb-4"
        >
          <VAvatar :color="item.color" rounded variant="tonal" size="44" class="me-3">
            <VIcon size="26" :icon="item.icon" />
          </VAvatar>
          <div class="d-flex flex-column">
            <h5 class="text-h5 mb-1">{{ item.stats }}</h5>
            <div class="text-body-1">{{ item.title }}</div>
          </div>
        </VCol>
      </VRow>

      <!-- Minimalista: Inquilinos con novedades activas -->
      <div v-if="inquilinosNovedades.length" class="mt-6">
        <h6 class="text-h6 mb-2">Inquilinos con novedades activas</h6>
        <VTable density="compact" class="elevation-1 rounded">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Celular</th>
              <th>Novedades activas</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inq in inquilinosNovedades" :key="inq.user_id">
              <td>{{ inq.name }}</td>
              <td>{{ inq.email }}</td>
              <td>{{ inq.celular }}</td>
              <td>
                <VChip color="primary" size="small" variant="tonal">
                  {{ inq.novedades_activas }}
                </VChip>
              </td>
            </tr>
          </tbody>
        </VTable>
      </div>
      <div v-else class="text-disabled text-center mt-6">
        <VIcon icon="ri-user-search-line" size="28" class="mb-1" />
        No hay inquilinos con novedades activas.
      </div>
    </VCardText>
  </VCard>
</template>