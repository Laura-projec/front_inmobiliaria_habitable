<script setup>
import { ref, watch, onMounted } from 'vue'

const isSaving = ref(false)
const warning = ref(null)
const successMessage = ref(null)

const form = ref({
  propietario: '',
  inmueble: '',
  niu: '',
  servicio: '',
  url: '',
})

const clients = ref([])
const properties = ref([])
const serviciosAgregados = ref([])
const search = ref('')

// 👉 Obtener clientes
const getClientes = async () => {
  try {
    const resp = await $api('/activos', { method: 'GET' })
    clients.value = resp.clients
  } catch (error) {
    console.error('Error al obtener clientes:', error)
  }
}

// 👉 Obtener inmuebles del cliente seleccionado
const getInmueblesByCliente = async (clienteId) => {
  console.log('Cliente seleccionado:', clienteId)
  if (!clienteId) return
  try {
    const resp = await $api(`/clientes/${clienteId}/inmuebles`, { method: 'GET' })
    
    properties.value = resp.inmuebles || []
  } catch (error) {
    console.error('Error al obtener inmuebles:', error)
  }
}

// 👁️ Observar cambio de propietario
watch(() => form.value.propietario, getInmueblesByCliente)

// 🔃 Montar clientes al iniciar
onMounted(() => getClientes())

// ✅ Guardar en API
const guardarServicio = async () => {
  if (serviciosAgregados.value.length === 0) {
    warning.value = 'Debes agregar al menos un servicio antes de guardar.'
    return
  }

  isSaving.value = true
  warning.value = null

  try {
    for (const servicio of serviciosAgregados.value) {
      await $api('/public-services', {
        method: 'POST',
        body: {
          user_id: form.value.propietario,
          inmueble_id: form.value.inmueble,
          ...servicio,
        },
      })
    }

    successMessage.value = 'Servicios públicos guardados correctamente 🚀'
    serviciosAgregados.value = []
    form.value.niu = ''
    form.value.servicio = ''
    form.value.url = ''
  } catch (error) {
    console.error('Error al guardar servicios:', error)
    warning.value = 'Hubo un error al guardar. Verifica los datos.'
  } finally {
    isSaving.value = false
  }
}

// ➕ Agregar servicio temporalmente a la lista
const agregarServicio = () => {
  warning.value = null

  if (!form.value.servicio) {
    warning.value = 'Debes seleccionar un tipo de servicio.'
    return
  }

  if (!form.value.niu || !form.value.url) {
    warning.value = 'Debes completar todos los campos del servicio.'
    return
  }

  const duplicado = serviciosAgregados.value.some(
    s => s.servicio === form.value.servicio
  )

  if (duplicado) {
    warning.value = 'Este tipo de servicio ya fue agregado.'
    return
  }

  serviciosAgregados.value.push({
    niu: form.value.niu,
    servicio: form.value.servicio,
    urlpago: form.value.url,
  })

  form.value.niu = ''
  form.value.servicio = ''
  form.value.url = ''
}

// 🗑️ Eliminar servicio
const eliminarServicio = index => {
  serviciosAgregados.value.splice(index, 1)
}

const filteredClients = computed(() => {
  return clients.value.filter(client =>
    client.name.toLowerCase().includes(search.value.toLowerCase())
  )
})
</script>

<template>
  <VRow>
    <!-- FORMULARIO -->
    <VCol cols="12" md="9">
      <VCard class="mb-6">
        <VCardText>
          <!-- Buscar cliente -->
          <VTextField
            v-model="search"
            label="Buscar cliente"
            class="mb-4"
            outlined
            clearable
          />

          <!-- Seleccionar propietario -->
          <VSelect
            v-model="form.propietario"
            :items="filteredClients"
            item-title="name"
            item-value="id"
            label="Propietario"
            class="mb-4"
            outlined
          />

          <!-- Seleccionar inmueble -->
          <VSelect
            v-model="form.inmueble"
            :items="properties"
            item-title="direccion"
            item-value="id"
            label="Inmueble"
            class="mb-4"
            outlined
          />

          <!-- Datos del servicio -->
          <VTextField v-model="form.niu" label="NIU" class="mb-4" outlined />
          <VSelect
            v-model="form.servicio"
            :items="['Agua', 'Energia', 'Gas']"
            label="Tipo de Servicio"
            class="mb-4"
            outlined
          />
          <VTextField v-model="form.url" label="URL del servicio" class="mb-4" outlined />
        </VCardText>
      </VCard>
    </VCol>

    <!-- BOTONES -->
    <VCol cols="12" md="3">
      <VCard class="mb-6">
        <VCardText>
          <VBtn
            block
            :loading="isSaving"
            prepend-icon="ri-send-plane-line"
            class="mb-4"
            @click="guardarServicio"
          >
            GUARDAR
          </VBtn>

          <VBtn
            block
            prepend-icon="ri-add-line"
            class="mb-4"
            @click="agregarServicio"
          >
            AGREGAR SERVICIO
          </VBtn>

          <VAlert type="warning" v-if="warning" class="mt-3">
            <strong>{{ warning }}</strong>
          </VAlert>
          <VAlert type="success" v-if="successMessage">
            {{ successMessage }}
          </VAlert>
        </VCardText>
      </VCard>
    </VCol>

    <!-- LISTADO DE SERVICIOS -->
    <VCol cols="12">
      <VCard>
        <VCardText>
          <h3 class="mb-4">Servicios Agregados</h3>

          <VList v-if="serviciosAgregados.length">
            <VListItem
              v-for="(servicio, index) in serviciosAgregados"
              :key="index"
              class="d-flex align-center justify-space-between mb-2"
            >
              <div>
                <strong>Servicio:</strong> {{ servicio.servicio }} |
                <strong>NIU:</strong> {{ servicio.niu }} |
                <strong>URL:</strong> {{ servicio.url }}
                <VBtn
                  color="red"
                  prepend-icon="ri-delete-bin-line"
                  @click="() => eliminarServicio(index)"
                >
                  Eliminar servicio
                </VBtn>
              </div>
              
            </VListItem>
          </VList>

          <p v-else class="text-grey">No hay servicios agregados aún.</p>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

