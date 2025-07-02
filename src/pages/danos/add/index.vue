<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/views/js/userStore'

const router = useRouter()
const token = localStorage.getItem('token') // o de donde lo estés sacando 

const isLoading = ref(false)
const warning = ref(null)
const successMessage = ref(null)

const search = ref('')
const clients = ref([])
const properties = ref([])

// Formulario
const dano = ref({
  propietario: '',
  idinmueble: '',
  tipo: '',
  fotoAntes: null,
  fotoDespues: null,
  observaciones: '',
  precio: '',
})

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
  // Transformamos los datos para incluir fullName
  clients.value = resp.propietarios || [];
};


// 📡 Obtener clientes activos
// const getClientes = async () => {
//   try {
//     const resp = await $api('/activos', { method: 'GET' })
//     clients.value = resp.clients || []
//   } catch (error) {
//     console.error('Error al obtener clientes:', error)
//   }
// }

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

const getItems = async () => {
  try {
    const resp = await $api('/items', {
      method: 'GET',
      onResponseError(response) {
        console.error('Error cargando items:', response.response)
      },
    })
    items.value = resp || []
  } catch (error) {
    console.error('Error al obtener los items:', error)
  }
}

// 👁️ Observar cambio de propietario
watch(() => dano.value.propietario, getInmueblesByCliente)

const crearDano = async () => {
  warning.value = null
  isLoading.value = true

  try {
    const formData = new FormData()

    formData.append('inmueble_id', dano.value.idinmueble)
    formData.append('user_id', dano.value.propietario) // ← corregido aquí

    formData.append('before_damage_photo', dano.value.fotoAntes)
    if (dano.value.fotoDespues) {
      formData.append('after_damage_photo', dano.value.fotoDespues)
    }
    formData.append('observations', dano.value.observaciones)
    formData.append('price', dano.value.precio)

    const resp = await $api('/damages', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`
      },
      onResponseError(response) {
        if (response.response.status == 403 || response.response.status == 500) {
          // console.log('entra aca');
          if (response.response.status == 403) {
            warning.value = response.response.message_text;
          } else {
            // warning.value = 'No se pudo enviar el formulario, intente nuevamente'
          }
          // 
        }
      }
    })

    if (resp.status == 200) {
      successMessage.value = resp.message_text
      // Emitir evento para recargar la lista de daños en el componente padre
      router.push('/danos/list')
    } else {
      if (resp.status == "403") {
        warning.value = resp.message_text
      } else {
        warning.value = 'No se pudo enviar el formulario, intente nuevamente'
      }
    }
    successMessage.value = 'Daño creado correctamente.'
    setTimeout(() => router.push('/danos/list'), 2000)
  } catch (error) {
    console.error('Error al crear el daño:', error)
    warning.value = 'Hubo un error al crear el daño.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (userRole.value === 'super-admin') {
    getClientes()
  } else {
    // Si no es superadmin, setear el inmueble automáticamente
    dano.value.idinmueble = userInmuebleId.value
  }
})
</script>

<template>
  <div class="add-dano-bg">
    <VCard class="pa-8 add-dano-card mb-6">
      <div class="d-flex flex-wrap justify-space-between align-center mb-6">
        <h3 class="mb-0 font-weight-bold">Crear Daño</h3>
        <div>
          <VBtn color="secondary" variant="outlined" @click="router.push('/danos/list')" class="me-2">
            Cancelar
          </VBtn>
          <VBtn color="primary" :loading="isLoading" prepend-icon="ri-save-line" @click="crearDano">
            Crear Daño
          </VBtn>
        </div>
      </div>

      <VAlert type="warning" v-if="warning" class="mb-4">
        <strong>{{ warning }}</strong>
      </VAlert>
      <VAlert type="success" v-if="successMessage" class="mb-4">
        {{ successMessage }}
      </VAlert>

      <VForm @submit.prevent="crearDano">
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

          <VCol cols="12" md="6" v-if="userRole !== 'super-admin'">
            <VTextField v-model="dano.idinmueble" label="ID del Inmueble" class="mb-4" readonly outlined />
          </VCol>

          <VCol cols="12" md="6">
            <VFileInput v-model="dano.fotoAntes" label="Foto Antes" class="mb-4" outlined />
          </VCol>
          <VCol cols="12" md="6">
            <VFileInput v-model="dano.fotoDespues" label="Foto Después" class="mb-4" outlined />
          </VCol>
          <VCol cols="12">
            <VTextarea v-model="dano.observaciones" label="Observaciones" class="mb-4" outlined />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="dano.precio" label="Precio" class="mb-4" outlined />
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

.mb-4 {
  margin-bottom: 1rem !important;
}

.me-2 {
  margin-right: 0.5rem !important;
}
</style>