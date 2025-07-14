<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { $api } from '@/utils/api'

const router = useRouter()
const items = ref([])
const isLoading = ref(false)

const form = ref({
  user_id: '',
  inmueble_id: '',
  nombre: '',
  descripcion: '',
  fecha: '',
  estado: '',
  continua: false,
  item_id: '',
  valor: '',
  propietario: null,
  inquilino: null,
  user_type: '', // 'propietario' o 'inquilino'
  inquilino_historico_id: null, // Nuevo: para el select de inquilinos históricos
})

const inquilinosList = ref([]) // Lista de inquilinos históricos + actual

const estados = [
  { value: 'pendiente', text: 'Pendiente' },
  { value: 'finalizado', text: 'Finalizado' },
]

const properties = ref([])
const searchInmueble = ref('')

// Traer items
const getItems = async () => {
  try {
    const resp = await $api('/items', { method: 'GET' })
    items.value = resp || []
  } catch (error) {
    console.error('Error al obtener los items:', error)
  }
}

// Traer inmuebles
const getInmuebles = async () => {
  try {
    const resp = await $api('/inmuebles', { method: 'GET' })
    properties.value = resp.inmuebles || []
  } catch (error) {
    console.error('Error al obtener inmuebles:', error)
  }
}

const filteredProperties = computed(() =>
  properties.value.filter((inm) =>
    inm.direccion?.toLowerCase().includes(searchInmueble.value.toLowerCase())
  )
)

// Al seleccionar inmueble, traer propietario e inquilinos históricos
const onInmuebleSelected = async (inmuebleId) => {
  if (!inmuebleId) {
    form.value.propietario = null
    form.value.inquilino = null
    form.value.user_id = ''
    form.value.user_type = ''
    inquilinosList.value = []
    form.value.inquilino_historico_id = null
    return
  }
  try {
    const resp = await $api(`/inmuebles/${inmuebleId}/propietario-inquilino`, { method: 'GET' })
    form.value.propietario = resp.propietario
    form.value.inquilino = resp.inquilino

    // Combina inquilino actual e históricos, sin duplicados
    const historicos = resp.inquilinos_historicos || []
    const actual = resp.inquilino ? [resp.inquilino] : []
    const todos = [...actual, ...historicos].reduce((acc, curr) => {
      if (!acc.some(i => i.id === curr.id)) acc.push(curr)
      return acc
    }, [])
    inquilinosList.value = todos.map(u => ({
      id: u.id,
      fullName: u.nombre_completo || u.name
    }))

    // Por defecto selecciona propietario si existe, si no, el inquilino actual
    if (resp.propietario) {
      form.value.user_id = resp.propietario.id
      form.value.user_type = 'propietario'
      form.value.inquilino_historico_id = null
    } else if (resp.inquilino) {
      form.value.user_id = resp.inquilino.id
      form.value.user_type = 'inquilino'
      form.value.inquilino_historico_id = resp.inquilino.id
    } else {
      form.value.user_id = ''
      form.value.user_type = ''
      form.value.inquilino_historico_id = null
    }
  } catch (error) {
    form.value.propietario = null
    form.value.inquilino = null
    form.value.user_id = ''
    form.value.user_type = ''
    inquilinosList.value = []
    form.value.inquilino_historico_id = null
    console.error('Error al obtener propietario/inquilino:', error)
  }
}

// Cuando selecciona "inquilino", muestra el select de inquilinos históricos
watch(() => form.value.user_type, (val) => {
  if (val === 'inquilino' && inquilinosList.value.length) {
    // Si ya hay un inquilino seleccionado, lo mantiene, si no, selecciona el primero
    if (!form.value.inquilino_historico_id) {
      form.value.inquilino_historico_id = inquilinosList.value[0]?.id || null
    }
    form.value.user_id = form.value.inquilino_historico_id
  } else if (val === 'propietarios' && form.value.propietario) {
    form.value.user_id = form.value.propietario.id
    form.value.inquilino_historico_id = null
  }
})

// Cuando cambia el inquilino histórico seleccionado, actualiza user_id
watch(() => form.value.inquilino_historico_id, (val) => {
  if (form.value.user_type === 'inquilino') {
    form.value.user_id = val
  }
})

onMounted(() => {
  getInmuebles()
  getItems()
})

watch(
  () => form.value.item_id,
  (itemId) => {
    const item = items.value.find(i => i.id === itemId)
    if (item) {
      form.value.nombre = item.title
      form.value.valor = item.valor ?? 0
    } else {
      form.value.nombre = ''
      form.value.valor = 0
    }
  }
)

const enviarFormulario = async () => {
  isLoading.value = true
  try {
    const payload = {
      user_id: form.value.user_id,
      inmueble_id: form.value.inmueble_id,
      fecha: form.value.fecha,
      estado: form.value.estado,
      continua: form.value.continua,
      nombre: form.value.nombre,
      descripcion: form.value.descripcion,
      item_id: form.value.item_id,
      valor: form.value.valor,
    }
    await $api('/novedades', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    router.push('/historyInmueble')
  } catch (error) {
    console.error('Error al crear la novedad:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="add-novedad-bg">
    <VCard class="pa-8 add-inmueble-card mb-6">
      <div class="d-flex flex-wrap justify-space-between align-center mb-6">
        <h2 class="text-h5 font-weight-bold mb-0">Agregar Novedad</h2>
        <div>
          <VBtn color="secondary" variant="outlined" @click="router.push('/novedades')" class="me-2">Cancelar</VBtn>
          <VBtn color="primary" type="submit" form="novedadForm" :loading="isLoading">Guardar</VBtn>
        </div>
      </div>

      <VAlert v-if="warning" type="error" class="mb-4">{{ warning }}</VAlert>
      <VAlert v-if="success" type="success" class="mb-4">{{ success }}</VAlert>

      <VForm id="novedadForm" @submit.prevent="enviarFormulario">
        <VRow dense>
          <!-- Buscar inmueble -->
          <VCol cols="12" md="6">
            <VTextField v-model="searchInmueble" label="Buscar inmueble" class="mb-4" outlined clearable
              placeholder="Escribe para buscar inmueble" />
          </VCol>

          <!-- Seleccionar inmueble -->
          <VCol cols="12" md="6">
            <VSelect v-model="form.inmueble_id" :items="filteredProperties" item-title="direccion" item-value="id"
              label="Inmueble" outlined class="mb-4" @update:modelValue="onInmuebleSelected" required />
          </VCol>

          <!-- Selector propietario/inquilino si ambos existen -->
          <VCol cols="12" md="6">
            <VSelect v-model="form.user_type" :items="[
              { value: 'propietario', title: 'Propietario' },
              { value: 'inquilino', title: 'Inquilino' }
            ]" label="¿A quién asociar la novedad?" outlined class="mb-4" required />
          </VCol>

          <!-- Selector de inquilino histórico si corresponde -->
          <VCol cols="12" md="6" v-if="form.user_type === 'inquilino' && inquilinosList.length">
            <VSelect v-model="form.inquilino_historico_id" :items="inquilinosList" item-title="fullName" item-value="id"
              label="Inquilino actual o histórico" outlined chips class="mb-4" required />
          </VCol>

          <!-- Mostrar usuario seleccionado -->
          <VCol cols="12" md="6" v-if="form.user_type === 'propietarios' && form.propietario">
            <VTextField :value="form.propietario?.name" label="Propietario seleccionado" outlined readonly
              class="mb-4" />
          </VCol>
          <VCol cols="12" md="6" v-if="form.user_type === 'inquilino' && form.inquilino_historico_id">
            <VTextField :value="inquilinosList.find(i => i.id === form.inquilino_historico_id)?.fullName"
              label="Inquilino seleccionado" outlined readonly class="mb-4" />
          </VCol>

          <!-- Item -->
          <VCol cols="12" md="6">
            <VSelect v-model="form.item_id" :items="items" item-title="title" item-value="id" label="Item" outlined
              dense class="mb-4" required />
          </VCol>

          <!-- Descripción -->
          <VCol cols="12" md="6">
            <VTextarea v-model="form.descripcion" label="Descripción" outlined dense class="mb-4" required />
          </VCol>

          <!-- Fecha -->
          <VCol cols="12" md="6">
            <VTextField v-model="form.fecha" label="Fecha" type="date" outlined dense class="mb-4" required />
          </VCol>

          <!-- Valor -->
          <VCol cols="12" md="6">
            <VTextField v-model="form.valor" label="Valor" type="number" outlined dense class="mb-4" required />
          </VCol>

          <!-- Estado -->
          <VCol cols="12" md="6">
            <VSelect v-model="form.estado" :items="estados" item-value="value" item-title="text" label="Estado" outlined
              dense class="mb-4" required />
          </VCol>

          <!-- Continua -->
          <VCol cols="12" md="6">
            <VCheckbox v-model="form.continua" label="¿Continúa?" outlined dense class="mb-4" />
          </VCol>
        </VRow>
      </VForm>
    </VCard>
  </div>
</template>

<style lang="scss" scoped>
.add-novedad-bg {
  background: #f3f4f6;
  min-height: 100vh;
  padding: 2rem 0;
}

.add-inmueble-card {
  background: #fff !important;
  border-radius: 18px;
  box-shadow: 0 2px 12px 0 rgba(60, 60, 60, 0.07);
  max-width: 1100px;
  margin: 0 auto;
}

.mb-4 {
  margin-bottom: 1rem !important;
}

.me-2 {
  margin-right: 0.5rem !important;
}
</style>