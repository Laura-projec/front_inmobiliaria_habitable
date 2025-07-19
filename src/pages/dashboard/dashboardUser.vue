<script setup>
import { ref, computed, onMounted, toRaw } from 'vue'
import { useUserStore } from '@/views/js/userStore'
import UserBioPanel from '@/views/pages/user/UserBioPanel.vue'
import UserTabOverview from '@/views/pages/user/UserTabOverview.vue'
import UserTabSecurity from '@/views/pages/user/UserTabSecurity.vue'

const userStore = useUserStore()
const userData = ref(null) // Datos del usuario desde la API
const isLoading = ref(true) // Estado de carga
const errorMessage = ref(null) // Para manejar errores

// Obtener información del usuario logueado
const user = computed(() => userStore.user)
const id = computed(() => user.value?.idUser) // Aseguramos que id exista antes de usarlo
const userTab = ref(0); 
const isEditMode = ref(false);  // Controla si estamos en modo edición
const tabs = [
  {
    icon: 'ri-lock-2-line',
    title: 'Seguridad',
  },
  {
    icon: 'ri-group-line',
    title: 'Editar',
  },
  {
    icon: 'ri-notification-4-line',
    title: 'Notificaciones',
  },
]

// Notificaciones y saldos pendientes
const notificaciones = ref({ saldos_pendientes: [], alertas: [] })
const isLoadingNotificaciones = ref(false)

const fetchNotificaciones = async () => {
  isLoadingNotificaciones.value = true
  try {
    const resp = await $api(`/notificaciones/${id.value}`, { method: 'GET' })
    notificaciones.value = resp || { saldos_pendientes: [], alertas: [] }
  } catch (e) {
    notificaciones.value = { saldos_pendientes: [], alertas: [] }
  } finally {
    isLoadingNotificaciones.value = false
  }
}

// Detecta cambios en userTab
watch(userTab, (newVal) => {
  if (newVal === 2) fetchNotificaciones()
  if (newVal === 0) {
    toggleSecurityMode();
  } else if (newVal === 1) {
    isEditMode.value = true;
  }
});
// ✅ Función para obtener los datos del usuario con `$api`
const fetchUserData = async () => {
  if (!id.value) {
    errorMessage.value = 'No se encontró un ID de usuario válido.'
    isLoading.value = false
    return
  }

  try {
    const response = await $api(`/clients/${id.value}`, {
      method: 'GET',
      onResponseError(response) {
        if (response.response.status === 403 || response.response.status === 500) {
          errorMessage.value = response.response._data.message
        }
      }
    }) 

    // console.log('Respuesta completa:', response)

    if (response.status === 200) {
      // ✅ Solución para hacer `userData` reactivo y visible en la UI
      userData.value = Object.assign({}, toRaw(response.data || response._data || {}))
      // console.log('userData después de asignación:', userData.value)
    } else {
      errorMessage.value = 'No se pudo obtener la información del cliente.'
    }
  } catch (error) {
    console.error('Error en la solicitud:', error)
    errorMessage.value = 'Ocurrió un error al obtener los datos.'
  } finally {
    isLoading.value = false
  }
}

// Función para activar el modo de edición
const toggleEditMode = () => {
  userTab.value = 1;
    isEditMode.value = !isEditMode.value;
};
// Función para activar la pestaña de seguridad
const toggleSecurityMode = () => {
    userTab.value = 0; 
};


// ✅ Llamar a la función cuando el componente se monta
onMounted(fetchUserData)


definePage({
  meta: {
    permissions: 'ver_dashboard_propietario',
  },
})
</script>

<template>
  <VRow v-if="!isLoading && userData && Object.keys(userData).length > 0">
    <VCol cols="12" md="5" lg="4">
      <UserBioPanel :user-data="userData" @edit="toggleEditMode" />
    </VCol>

    <VCol cols="12" md="7" lg="8">
      <VTabs v-model="userTab" class="v-tabs-pill">
        <VTab v-for="tab in tabs" :key="tab.icon">
          <VIcon start :icon="tab.icon" />
          <span>{{ tab.title }}</span>
        </VTab>
      </VTabs>

      <VWindow v-model="userTab" class="mt-6 disable-tab-transition">
        <VWindowItem :value="0">
          <UserTabSecurity :user-data="userData" />
        </VWindowItem>
        <VWindowItem :value="1">
          <UserTabOverview :user-data="userData" />
        </VWindowItem>
        <VWindowItem :value="2">
          <VRow>
            <VCol cols="12" md="6">
              <VCard class="mb-4" color="error" variant="tonal">
                <VCardTitle>
                  <VIcon icon="ri-error-warning-line" class="me-2" />
                  Saldos Pendientes
                </VCardTitle>
                <VCardText>
                  <div v-if="isLoadingNotificaciones">
                    <VProgressCircular indeterminate color="primary" />
                  </div>
                  <div v-else-if="notificaciones.saldos_pendientes.length">
                    <VList>
                      <VListItem v-for="(saldo, i) in notificaciones.saldos_pendientes" :key="i">
                        <VListItemTitle>
                          {{ saldo.concepto }}:
                          <span class="font-weight-bold text-error">
                            {{ new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(saldo.valor) }}
                          </span>
                        </VListItemTitle>
                        <VListItemSubtitle>
                          Vence: {{ saldo.vencimiento }}
                        </VListItemSubtitle>
                      </VListItem>
                    </VList>
                  </div>
                  <div v-else>
                    <span class="text-success">No tienes saldos pendientes 🎉</span>
                  </div>
                </VCardText>
              </VCard>
            </VCol>
            <VCol cols="12" md="6">
              <VCard class="mb-4" color="info" variant="tonal">
                <VCardTitle>
                  <VIcon icon="ri-notification-4-line" class="me-2" />
                  Alertas
                </VCardTitle>
                <VCardText>
                  <div v-if="notificaciones.alertas.length">
                    <VList>
                      <VListItem v-for="(alerta, i) in notificaciones.alertas" :key="i">
                        <VListItemTitle>{{ alerta.mensaje }}</VListItemTitle>
                        <VListItemSubtitle>{{ alerta.fecha }}</VListItemSubtitle>
                      </VListItem>
                    </VList>
                  </div>
                  <div v-else>
                    <span class="text-success">Sin alertas importantes</span>
                  </div>
                </VCardText>
              </VCard>
            </VCol>
          </VRow>
        </VWindowItem>
      </VWindow>
    </VCol>
  </VRow>

  <!-- Loader mientras carga los datos -->
  <VProgressCircular v-else-if="isLoading" indeterminate color="primary" />

  <!-- Mostrar error si la API no responde -->
  <VAlert v-else-if="errorMessage" type="error" variant="tonal">
    {{ errorMessage }}
  </VAlert>

  <!-- Mostrar si no hay datos disponibles -->
  <VAlert v-else type="warning">
    No se encontraron datos para el usuario con ID {{ id }}
  </VAlert>
</template>
