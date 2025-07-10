<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/views/js/userStore'

const route = useRoute()
const router = useRouter()

const danoId = ref(route.params.id)

const isLoading = ref(false)
const warning = ref(null)
const successMessage = ref(null)

const search = ref('')
const clients = ref([])
const properties = ref([])

const dano = ref({
  propietario: '',
  idinmueble: '',
  tipo: '',
  fotoAntes: null,
  fotoDespues: null,
  observaciones: '',
  precio: '',
})

const fotoAntesUrl = ref(null)
const fotoDespuesUrl = ref(null)

// 🚀 User Store
const userStore = useUserStore()
const user = computed(() => userStore.user)
const userRole = computed(() => user.value?.role?.name || '')
const userInmuebleId = computed(() => user.value?.inmueble_id || null)

// 🔍 Filtrar clientes
const filteredClients = computed(() => {
  return clients.value.filter(client =>
    client.name.toLowerCase().includes(search.value.toLowerCase())
  )
})

const getClientes = async () => {
  const resp = await $api('/propietarios', {
    method: 'GET',
    onResponseError(response) {
      console.log('Error al cargar propietarios:', response.response);
    }
  });
  clients.value = resp.propietarios || [];
};

// 🏘️ Obtener inmuebles del cliente
const getInmueblesByCliente = async (clienteId) => {
  if (!clienteId) return
  try {
    const resp = await $api(`/clientes/${clienteId}/inmuebles`, { method: 'GET' })
    properties.value = resp.inmuebles || []
  } catch (error) {
    console.error('Error al obtener inmuebles:', error)
  }
}

// 👁️ Observar cambio de propietario
watch(() => dano.value.propietario, getInmueblesByCliente)

const getInmuebleById = async (inmuebleId) => {
  if (!inmuebleId) return
  try {
    const resp = await $api(`/inmuebles/${inmuebleId}`, { method: 'GET' })
    // Si el inmueble no está en la lista, lo agregamos
    if (resp && resp.id && !properties.value.some(p => p.id === resp.id)) {
      properties.value.push(resp)
    }
  } catch (error) {
    console.error('Error al obtener inmueble por ID:', error)
  }
}

const getDano = async () => {
  isLoading.value = true
  try {
    const resp = await $api(`/damages/${danoId.value}`, { method: 'GET' })

    dano.value.tipo = resp.tipo || ''
    dano.value.idinmueble = resp.inmueble_id || ''
    dano.value.observaciones = resp.observations || ''
    dano.value.precio = resp.price || ''

    fotoAntesUrl.value = resp.before_damage_photo_url || null
    fotoDespuesUrl.value = resp.after_damage_photo_url || null

    // Si eres superadmin o administrador, busca el propietario y setea el select
    if ((userRole.value === 'super-admin' || userRole.value === 'administrador') && resp.propietario_id) {
      dano.value.propietario = resp.propietario_id
      await getInmueblesByCliente(resp.propietario_id)
    } else if (resp.inmueble_id) {
      // Si no es superadmin, asegurarse de que el inmueble esté en la lista
      await getInmuebleById(resp.inmueble_id)
    }
  } catch (error) {
    console.error('Error al obtener el daño:', error)
    warning.value = 'Hubo un error al cargar los datos del daño.'
  } finally {
    isLoading.value = false
  }
}

const previewFotoAntes = (e) => {
  const file = e.target?.files?.[0]
  if (file) {
    dano.value.fotoAntes = file
    fotoAntesUrl.value = URL.createObjectURL(file)
  }
}

const previewFotoDespues = (e) => {
  const file = e.target?.files?.[0]
  if (file) {
    dano.value.fotoDespues = file
    fotoDespuesUrl.value = URL.createObjectURL(file)
  }
}

const guardarCambios = async () => {
  isLoading.value = true
  warning.value = null

  try {
    const formData = new FormData()

    // Añadir datos de texto
    // formData.append('tipo', dano.value.tipo)
    formData.append('inmueble_id', dano.value.idinmueble)
    formData.append('observations', dano.value.observaciones)
    formData.append('price', dano.value.precio)
    if (userRole.value === 'super-admin') {
      formData.append('user_id', dano.value.propietario)
    }

    // Si hay fotos, agregarlas al FormData
    if (dano.value.fotoAntes instanceof File) {
      formData.append('before_damage_photo', dano.value.fotoAntes)
    }
    if (dano.value.fotoDespues instanceof File) {
      formData.append('after_damage_photo', dano.value.fotoDespues)
    }

    formData.append('_method', 'PUT')

    await $api(`/damages/${danoId.value}`, {
      method: 'POST',
      body: formData,
    })

    await getDano()
    successMessage.value = 'Daño actualizado correctamente.'
    setTimeout(() => router.push('/danos/list'), 2000)
  } catch (error) {
    console.error('Error al guardar los cambios:', error)
    warning.value = 'Hubo un error al guardar los cambios.'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  if (userRole.value === 'super-admin' || userRole.value === 'Administrador') {
    await getClientes()
  }
  await getDano()
  if (userRole.value !== 'super-admin' && userRole.value !== 'Administrador') {
    dano.value.idinmueble = userInmuebleId.value
  }
})
</script>

<template>
  <div class="add-dano-bg">
    <VCard class="pa-8 add-dano-card mb-6">
      <div class="d-flex flex-wrap justify-space-between align-center mb-6">
        <h3 class="mb-0 font-weight-bold">Editar Daño</h3>
        <div>
          <VBtn color="secondary" variant="outlined" @click="router.push('/danos/list')" class="me-2">
            Cancelar
          </VBtn>
          <VBtn color="primary" :loading="isLoading" prepend-icon="ri-save-line" @click="guardarCambios">
            Guardar Cambios
          </VBtn>
        </div>
      </div>

      <VAlert type="warning" v-if="warning" class="mb-4">
        <strong>{{ warning }}</strong>
      </VAlert>
      <VAlert type="success" v-if="successMessage" class="mb-4">
        {{ successMessage }}
      </VAlert>

      <!-- Dirección del inmueble como título -->
      <h4 v-if="dano.idinmueble" class="mb-4">
        Inmueble:
        {{
          (properties.find(p => p.id == dano.idinmueble) && properties.find(p => p.id == dano.idinmueble).direccion)
          || 'Sin dirección'
        }}
      </h4>

      <VForm @submit.prevent="guardarCambios">
        <VRow dense>
          <!-- Solo para super-admin -->
          <template v-if="userRole === 'super-admin'">
            <VCol cols="12" md="6">
              <VTextField v-model="search" label="Buscar cliente" class="mb-4" clearable outlined />
            </VCol>
            <VCol cols="12" md="6">
              <VSelect v-model="dano.propietario" :items="filteredClients" item-title="name" item-value="id"
                label="Propietario" class="mb-4" outlined />
            </VCol>
            <VCol cols="12" md="6">
              <VSelect v-model="dano.idinmueble" :items="properties" item-title="direccion" item-value="id"
                label="Inmueble" class="mb-4" outlined />
            </VCol>
          </template>

          <VCol cols="12" md="6" v-if="userRole !== 'super-admin' && userRole !== 'Administrador'">
            <VTextField v-model="dano.idinmueble" label="ID del Inmueble" class="mb-4" readonly outlined />
          </VCol>

          <!-- <VCol cols="12" md="6">
            <VTextField v-model="dano.tipo" label="Tipo de Daño" class="mb-4" outlined />
          </VCol> -->
          <VCol cols="12">
            <VTextarea v-model="dano.observaciones" label="Observaciones" class="mb-4" outlined />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="dano.precio" label="Precio" class="mb-4" outlined />
          </VCol>

          <!-- FOTO ANTES -->
          <VCol cols="12" md="6">
            <label class="mb-2 d-block">Foto Antes</label>
            <div v-if="fotoAntesUrl" class="mb-2">
              <img :src="fotoAntesUrl" alt="Foto Antes" class="img-fluid" style="max-width: 100%; height: auto;" />
            </div>
            <p v-else class="text-grey">No hay foto antes disponible.</p>
            <VFileInput label="Subir nueva foto antes" outlined accept="image/*" @change="previewFotoAntes" />
          </VCol>

          <!-- FOTO DESPUÉS -->
          <VCol cols="12" md="6">
            <label class="mb-2 d-block">Foto Después</label>
            <div v-if="fotoDespuesUrl" class="mb-2">
              <img :src="fotoDespuesUrl" alt="Foto Después" class="img-fluid" style="max-width: 100%; height: auto;" />
            </div>
            <p v-else class="text-grey">No hay foto después disponible.</p>
            <VFileInput label="Subir nueva foto después" outlined accept="image/*" @change="previewFotoDespues" />
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
.mb-4 { margin-bottom: 1rem !important; }
.me-2 { margin-right: 0.5rem !important; }
</style>