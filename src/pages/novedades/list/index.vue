<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/views/js/userStore'

const novedades = ref([])
const isLoading = ref(false)
const warning = ref(null)

const userStore = useUserStore()
const user = computed(() => userStore.user)
const userRole = computed(() => user.value?.role?.name || '')
const userId = computed(() => user.value?.id)
const userInmuebleId = computed(() => user.value?.inmueble_id || null)

const getNovedades = async () => {
  isLoading.value = true
  warning.value = null
  try {
    let endpoint = '/novedades'
    // Ajusta los nombres de los roles según tu sistema
    if (userRole.value !== 'super-admin' && userRole.value !== 'administrador') {
      // Si es propietario o inquilino, filtra por user_id o inmueble_id
      endpoint = `/novedades?user_id=${userId.value}`
      // O si es por inmueble: endpoint = `/novedades?inmueble_id=${userInmuebleId.value}`
    }
    const resp = await $api(endpoint, { method: 'GET' })
    novedades.value = resp.novedades || resp || []
  } catch (error) {
    warning.value = 'Error al cargar las novedades.'
  } finally {
    isLoading.value = false
  }
}

onMounted(getNovedades)
</script>

<template>
  <div>
    <h2>Listado de Novedades</h2>
    <VAlert v-if="warning" type="error">{{ warning }}</VAlert>
    <VProgressCircular v-if="isLoading" indeterminate color="primary" />
    <VList v-else>
      <VListItem v-for="novedad in novedades" :key="novedad.id">
        <VListItemTitle>{{ novedad.titulo }}</VListItemTitle>
        <VListItemSubtitle>{{ novedad.descripcion }}</VListItemSubtitle>
      </VListItem>
    </VList>
    <p v-if="!isLoading && novedades.length === 0" class="text-grey text-center mt-6">
      No hay novedades registradas.
    </p>
  </div>
</template>
