<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const servicioId = ref(route.params.id)
const servicio = ref({
  niu: '',
  servicio: '',
  urlpago: '',
})

const isLoading = ref(false)
const warning = ref(null)
const successMessage = ref(null)

const getServicio = async () => {
  isLoading.value = true
  warning.value = null

  try {
    const resp = await $api(`/public-services/${servicioId.value}`, { method: 'GET' })
    servicio.value = resp || {}
  } catch (error) {
    console.error('Error al obtener el servicio:', error)
    warning.value = 'Hubo un error al cargar los datos del servicio.'
  } finally {
    isLoading.value = false
  }
}

const guardarCambios = async () => {
  isLoading.value = true
  warning.value = null

  try {
    await $api(`/public-services/${servicioId.value}`, {
      method: 'PUT',
      body: servicio.value,
    })
    successMessage.value = 'Servicio actualizado correctamente.'
    setTimeout(() => router.push('/serviciosPublicos/list'), 2000)
  } catch (error) {
    console.error('Error al guardar los cambios:', error)
    warning.value = 'Hubo un error al guardar los cambios.'
  } finally {
    isLoading.value = false
  }
}

onMounted(getServicio)
</script>

<template>
  <VRow>
    <VCol cols="12" md="8" class="mx-auto">
      <VCard>
        <VCardText>
          <h3 class="mb-4">Editar Servicio Público</h3>

          <VAlert type="warning" v-if="warning" class="mb-4">
            <strong>{{ warning }}</strong>
          </VAlert>

          <VAlert type="success" v-if="successMessage" class="mb-4">
            {{ successMessage }}
          </VAlert>

          <VTextField v-model="servicio.niu" label="NIU" class="mb-4" outlined />
          <VSelect v-model="servicio.servicio" :items="['Agua', 'Energia', 'Gas']" label="Tipo de Servicio" class="mb-4"
            outlined />
          <VTextField v-model="servicio.urlpago" label="URL de Pago" class="mb-4" outlined />

          <VBtn block :loading="isLoading" prepend-icon="ri-save-line" color="primary" @click="guardarCambios">
            Guardar Cambios
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
