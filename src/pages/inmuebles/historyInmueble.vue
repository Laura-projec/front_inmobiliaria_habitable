<script setup>
// filepath: c:\Panel_inmobiliaria\admin-inmobiliaria\src\pages\inmuebles\historyInmueble.vue
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/views/js/userStore'
import { watch } from 'vue'

const router = useRouter()
const userStore = useUserStore()
const user = computed(() => userStore.user)
const isOwner = computed(() => {
   const roleId = user.value.role.id;
   return roleId === 39; // 39: Propietario, 1: Administrador, 2: Super Admin
})
const isTenant = computed(() => user.value?.role_id === 40) // Rol de inquilino

// Lista de inmuebles del usuario
const inmuebles = ref([])
const inmuebleSeleccionado = ref(null)
const propietario = ref(null)
const inquilino = ref(null)
const caracteristicas = ref([])
const activeTab = ref('danos')
const direccion = ref('')
const observaciones = ref('')
const valor = ref(0) // <-- Asegura que sea número por defecto
const tabs = [
   { value: 'danos', label: 'Daños', icon: 'ri-tools-line' },
   { value: 'novedades', label: 'Novedades', icon: 'ri-file-list-line' },
   { value: 'pagos', label: 'Pagos', icon: 'ri-money-dollar-circle-line' },
   { value: 'recibos', label: 'Servicios Publicos', icon: 'ri-file-text-line' },
   { value: 'contratos', label: 'Contratos', icon: 'ri-file-paper-line' },
]

const getColorByTab = (tab) => {
   return {
      danos: 'error',
      novedades: 'info',
      pagos: 'success',
      recibos: 'warning',
      contratos: 'primary',
   }[tab] || 'primary'
}

const getIconByTab = (tab) => {
   return {
      danos: 'ri-tools-line',
      novedades: 'ri-file-list-line',
      pagos: 'ri-money-dollar-circle-line',
      recibos: 'ri-file-text-line',
      contratos: 'ri-file-paper-line',
   }[tab] || 'ri-information-line'
}

// Datos de la línea de tiempo
const timelineData = ref([])
const modalData = ref(null)
const showModal = ref(false)

// Obtener inmuebles del usuario según el rol
const getInmuebles = async () => {
   try {
      let endpoint = '/inmuebles'
      if (userRole.value === 'propietarios') {
         endpoint = `/inmuebles?user_id=${userId.value}`
      } else if (userRole.value === 'arrendatario' || userRole.value === 'inquilino') {
         endpoint = `/inmuebles?inquilino_id=${userId.value}`
      }
      const resp = await $api(endpoint, { method: 'GET' })
      inmuebles.value = resp.inmuebles || []
      inmuebleSeleccionado.value = inmuebles.value[0] || null
      if (inmuebleSeleccionado.value) {
         if (userRole.value !== 'arrendatario') {
            await getPropietario(inmuebleSeleccionado.value.users_id)
            await getInquilino(inmuebleSeleccionado.value.id)
         }
         await getCaracteristicas(inmuebleSeleccionado.value.id)
         await getTimelineData(activeTab.value)
         direccion.value = inmuebleSeleccionado.value.direccion
         observaciones.value = inmuebleSeleccionado.value.observaciones
         valor.value = Number(inmuebleSeleccionado.value.valor_arrendamiento) || 0
      }
   } catch (error) {
      console.error('Error al obtener inmuebles:', error)
   }
}

// Obtener datos del propietario
const getPropietario = async (userId) => {
   try {
      const resp = await $api(`/${userId}/propietario`, { method: 'GET' })
      propietario.value = resp.propietario || null
   } catch (error) {
      console.error('Error al obtener el propietario:', error)
   }
}

// Obtener datos del inquilino
const getInquilino = async (inmuebleId) => {
   try {
      const resp = await $api(`/${inmuebleId}/inquilino`, { method: 'GET' })
      console.log('Respuesta de inquilino:', resp);

      inquilino.value = resp.inquilino || null
   } catch (error) {
      console.error('Error al obtener el inquilino:', error)
   }
}

// Obtener características del inmueble
const getCaracteristicas = async (inmuebleId) => {
   try {
      const resp = await $api(`/inmuebles/${inmuebleId}/caracteristicas`, { method: 'GET' })
      caracteristicas.value = resp.caracteristicas || []
   } catch (error) {
      console.error('Error al obtener las características del inmueble:', error)
   }
}

const userRole = computed(() => user.value?.role?.name?.toLowerCase() || '')
const userId = computed(() => user.value?.idUser || user.value?.id)

// Obtener datos de la línea de tiempo según el rol
const getTimelineData = async (tab) => {
   try {
      let inmuebleId = inmuebleSeleccionado.value?.id || inmuebleSeleccionado.value;
      if (!inmuebleId) {
         console.error('No se pudo determinar el ID del inmueble seleccionado.');
         return;
      }
      let endpoint = `/${inmuebleId}/${tab}`
      // Si es propietario, filtra por user_id
      if (userRole.value === 'propietarios') {
         endpoint += `?user_id=${userId.value}`
      } else if (userRole.value === 'arrendatario' || userRole.value === 'inquilino') {
         endpoint += `?inquilino_id=${userId.value}`
      }
      // Si es admin o super-admin, endpoint queda igual
      const resp = await $api(endpoint, { method: 'GET' });
      timelineData.value = (resp || []).map((item) => ({
         id: item.id,
         titulo: item.titulo,
         descripcion: item.descripcion,
         fecha: item.fecha,
         Precio: item.extra?.Precio,
         extra: item.extra || {},
      }));
   } catch (error) {
      console.error(`Error al obtener datos de ${tab}:`, error);
   }
};

// Mostrar detalles en el modal
const verDetallesEnModal = (item) => {
   modalData.value = item
   showModal.value = true
}

onMounted(getInmuebles)

watch(activeTab, (newTab) => {
   if (newTab) {
      getTimelineData(newTab)
   }
})

watch(inmuebleSeleccionado, async (nuevoInmuebleId) => {
   if (nuevoInmuebleId) {
      // Buscar el objeto completo del inmueble en la lista
      const nuevoInmueble = inmuebles.value.find((inmueble) => inmueble.id === nuevoInmuebleId);

      if (!nuevoInmueble) {
         console.error('No se encontró el inmueble en la lista.');
         return;
      }

      // Limpiar datos anteriores
      propietario.value = null;
      inquilino.value = null;
      caracteristicas.value = [];
      timelineData.value = [];

      // Cargar nuevos datos del inmueble
      if (userRole.value !== 'arrendatario') {
         await getPropietario(nuevoInmueble.users_id);
         await getInquilino(nuevoInmueble.id);
      }
      await getCaracteristicas(nuevoInmueble.id);
      await getTimelineData(activeTab.value);
      direccion.value = nuevoInmueble.direccion;
      observaciones.value = nuevoInmueble.observaciones;
      valor.value = Number(nuevoInmueble.valor_arrendamiento) || 0; // <-- asegura número
   }
});
const BASE_URL = import.meta.env.VITE_API_LARAVEL_BASE_URL

</script>

<template>
   <div>
      <!-- Título y selección de inmueble -->
      <div class="d-flex justify-space-between align-center mb-6">
         <h2 class="text-h5 font-weight-bold text-primary">Historial del Inmueble</h2>

      </div>

      <!-- Detalles del inmueble seleccionado -->
      <VCard class="mb-6 elevation-1">
         <VCardText>
            <VSelect v-model="inmuebleSeleccionado" :items="inmuebles" item-title="direccion" item-value="id"
               label="Seleccionar Inmueble" outlined dense class="w-50" />
            <VRow dense>
               <VCol cols="12" md="6">
                  <h4 class="text-subtitle-1 font-weight-bold mb-2 text-primary">Información del Inmueble</h4>
                  <p>
                     <strong>Valor del Inmueble:</strong>
                     {{
                        valor
                           ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'COP' }).format(valor)
                           : 'No disponible'
                     }}
                  </p>
                  <p><strong>Dirección:</strong> {{ direccion }}</p>
                  <p><strong>Observaciones:</strong> {{ observaciones }}</p>
                  <p><strong>Características:</strong></p>
                  <ul>
                     <li v-for="caracteristica in caracteristicas" :key="caracteristica.id">
                        {{ caracteristica.caracteristica.nombre }} (x{{ caracteristica.cantidad }})
                     </li>
                  </ul>
               </VCol>

               <VCol cols="12" md="6" v-if="userRole !== 'arrendatario'">
                  <h4 class="text-subtitle-1 font-weight-bold mb-2 text-success">👤 Propietario</h4>
                  <p><strong>Nombre:</strong> {{ propietario?.name }} {{ propietario?.surname }}</p>
                  <p><strong>Email:</strong> {{ propietario?.email }}</p>
                  <p><strong>Teléfono:</strong> {{ propietario?.celular }}</p>

                  <!-- <div v-if="inquilino" class="mt-4">
                     <h4 class="text-subtitle-1 font-weight-bold mb-2 text-info">👥 Arrendatario</h4>
                     <p><strong>Nombre:</strong> {{ inquilino?.titular }} {{ inquilino?.surname }}</p>
                     <p><strong>Email:</strong> {{ inquilino?.email }}</p>
                     <p><strong>Teléfono:</strong> {{ inquilino?.celular }}</p>
                  </div> -->
               </VCol>
            </VRow>
         </VCardText>
      </VCard>

      <!-- Tabs de historial -->
      <VRow>
         <VCol cols="12" md="3">
            <VTabs v-model="activeTab" direction="vertical" class="v-tabs-pill styled-tabs" color="primary">
               <VTab v-for="tab in tabs" :key="tab.value" :value="tab.value">
                  <VIcon :icon="tab.icon" class="me-2" />
                  {{ tab.label }}
               </VTab>
            </VTabs>
         </VCol>

         <VCol cols="12" md="9">
            <VCard>
               <VCardText>
                  <h4 class="text-h6 mb-4">Línea de Tiempo</h4>
                  <div class="timeline-scroll">
                     <VTimeline class="timeline-custom">
                        <VTimelineItem v-for="item in timelineData" :key="item.id" :color="getColorByTab(activeTab)"
                           :icon="getIconByTab(activeTab)" size="small">
                           <template #opposite>
                              <span class="text-caption text-grey">{{ item.fecha }}</span>
                           </template>
                           <template #default>
                              <div class="timeline-custom-item">
                                 <h5 class="text-subtitle-2 font-weight-bold mb-1">{{ item.titulo }}</h5>
                                 <p class="text-body-2 mb-2">{{ item.descripcion }}</p>
                                 <VBtn color="primary" variant="tonal" size="small" class="mt-2"
                                    @click="verDetallesEnModal(item)">
                                    Ver Detalles
                                 </VBtn>
                              </div>
                           </template>
                        </VTimelineItem>
                     </VTimeline>
                  </div>
               </VCardText>
            </VCard>
         </VCol>
      </VRow>

      <VDialog v-model="showModal" max-width="700px">
         <VCard>
            <VCardTitle class="text-h5 font-weight-bold">
               {{ modalData?.titulo }}
            </VCardTitle>

            <VCardText>
               <VRow dense>
                  <VCol cols="12">
                     <p><strong>Descripción:</strong> {{ modalData?.descripcion }}</p>
                  </VCol>

                  <VCol cols="12" sm="6">
                     <p><strong>Fecha:</strong> {{ modalData?.fecha }}</p>
                  </VCol>

                  <VCol cols="12" sm="6" v-if="modalData?.extra?.Precio">
                     <p><strong>Precio:</strong> {{ new Intl.NumberFormat('es-ES', {
                        style: 'currency', currency: 'COP'
                     }).format(modalData.extra.Precio) }}</p>
                  </VCol>

                  <VCol cols="12" v-if="modalData?.extra">
                     <h5 class="text-h6 font-weight-bold mb-2">Detalles Adicionales</h5>
                     <ul>
                        <li v-for="(value, key) in modalData.extra" :key="key">
                           <strong>{{ key }}:</strong>
                           <template
                              v-if="typeof value === 'string' && (value.endsWith('.jpg') || value.endsWith('.png') || value.endsWith('.jpeg') || value.endsWith('.pdf') || value.startsWith('/storage/'))">
                              <a
                                :href="value.replace(/^http:\/\/localhost:8000/, BASE_URL.replace(/\/$/, ''))"
                                target="_blank"
                                rel="noopener"
                                style="color: #1976d2; text-decoration: underline;"
                              >
                                Ver
                              </a>
                           </template>
                           <template v-else>
                              {{ value }}
                           </template>
                        </li>
                     </ul>
                  </VCol>

                  <!-- <VCol cols="12" v-if="modalData?.extra">
                     <h5 class="text-h6 font-weight-bold mb-2">Detalles Adicionales</h5>
                     <ul>
                        <li v-for="(value, key) in modalData.extra" :key="key">
                           <strong>{{ key }}:</strong> {{ value }}
                        </li>
                     </ul>
                  </VCol> -->
               </VRow>
            </VCardText>

            <VCardActions>
               <VSpacer />
               <VBtn color="primary" variant="tonal" @click="showModal = false">Cerrar</VBtn>
            </VCardActions>
         </VCard>
      </VDialog>




   </div>
</template>

<style scoped>
.styled-tabs .v-tab {
   border-radius: 8px;
   margin-bottom: 0.5rem;
   padding: 0.75rem 1rem;
   font-weight: 500;
}

.styled-tabs .v-tab.v-tab--selected {
   background-color: #e3f2fd;
   color: #1976d2;
}

.timeline-custom-item {
   background-color: #fafafa;
   border-radius: 10px;
   padding: 1rem;
   border-left: 4px solid #e0e0e0;
   transition: box-shadow 0.3s ease;
}

.timeline-custom-item:hover {
   box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

ul {
   list-style-type: disc;
   margin: 0;
   padding-left: 1.25rem;
}

.v-dialog .v-card {
   border-radius: 16px;
   box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.v-img {
   border-radius: 10px;
   border: 2px solid #e0e0e0;
   object-fit: cover;
}

.timeline-scroll {
   max-height: 400px;
   /* Ajusta la altura máxima según tus necesidades */
   overflow-y: auto;
   /* Habilita el scroll vertical */
   padding-right: 1rem;
   /* Espaciado para evitar que el scroll tape contenido */
}

.timeline-scroll::-webkit-scrollbar {
   width: 8px;
   /* Ancho del scrollbar */
}

.timeline-scroll::-webkit-scrollbar-thumb {
   background-color: #c0c0c0;
   /* Color del scrollbar */
   border-radius: 4px;
   /* Bordes redondeados */
}

.timeline-scroll::-webkit-scrollbar-thumb:hover {
   background-color: #a0a0a0;
   /* Color del scrollbar al pasar el mouse */
}
</style>