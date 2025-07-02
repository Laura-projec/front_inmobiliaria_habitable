<script setup>
const props = defineProps({
  userData: {
    type: Object,
    required: true,
  },
})
const isActivarMode = ref();
const isLoading = ref(false)
const alertMessage = ref('')
const alertType = ref('')
const emit = defineEmits(['edit']);  // Definir el evento 'edit'

const onEditClick = () => {
  emit('edit');  // Emitir el evento 'edit' al hacer clic en el botón
};

// Computed para determinar el texto y color del estado
const estadoConfig = computed(() => {
  if (props.userData?.status === 'A') {
    return {
      texto: 'Activo',
      color: 'success', // Verde
    }
  } else if (props.userData?.status === 'I') {
    return {
      texto: 'Inactivo',
      color: 'warning', // Amarillo/Naranja
    }
  }
  return {
    texto: 'Desconocido',
    color: 'grey', // Por defecto
  }
})


const resolveUserRoleVariant = role => {
  return {
    color: 'primary',
    icon: 'ri-user-line',
  }
}

onMounted(() => {
  console.log('moun', props.userData.status);
  
  if (props.userData.status =='A') {
    isActivarMode.value = true
  } else {
    isActivarMode.value = false
  }
})

const onEditStatusClick = async () => {
  try {
    isLoading.value = true
    console.log('props.userData.id', props.userData);

    let estado = ''

    if (props.userData.status === 'A') {
      estado = 'I'
    } else {
      estado = 'A'
    }

    const response = await $api('/cambiar-estado', {
      method: 'POST',
      body: {
        user_id: props.userData.id,
        status: estado,
      }
    })

    if (response?.success) {
      alertMessage.value = 'Estado cambiado correctamente'
      alertType.value = 'success'

      // Actualiza el estado en el front-end
      props.userData.status = estado;
      console.log('estado',estado); 
    } else {
      alertMessage.value = response?.message || "Error al cambiar el estado"
      alertType.value = 'error'
    }
  } catch (error) {
    console.error('Error en API:', error)
    alertMessage.value = error?.response?._data?.message || "Error de conexión con el servidor"
    alertType.value = 'error'
  } finally {
    isLoading.value = false
  }
}

</script>

<template>
  <VRow>
    <!-- SECTION User Details -->
    <VCol cols="12">
      <!-- v-if="props.userData" -->
      <VCard>
        <VCardText class="text-center pt-12 pb-6">
          <!-- 👉 Avatar -->
          <VAvatar rounded="lg" :size="120" :color="!props.userData.avatar ? 'primary' : undefined"
            :class="props.userData.avatar ? '' : 'v-avatar-light-bg primary--text'"
            :variant="!props.userData.avatar ? 'tonal' : undefined">
            <VImg v-if="props.userData.avatar" :src="props.userData.avatar" />
            <span v-else class="text-lg">{{ avatarText(props.userData.full_name) }}</span>
            <!-- <span v-else class="text-5xl font-weight-medium">
              {{ avatarText(props.userData.fullName) }}
            </span> -->
          </VAvatar>

          <!-- 👉 User fullName -->
          <h5 class="text-h5 mt-4 text-uppercase">
            {{ props.userData.full_name }}
          </h5>

          <!-- 👉 Role chip -->
          <VChip :color="resolveUserRoleVariant(props.userData.role.name).color" size="small"
            class="text-capitalize mt-4">
            {{ props.userData.role.name }}
          </VChip>
        </VCardText>


        <!-- 👉 Details -->
        <VCardText class="pb-6">
          <h5 class="text-h5">
            Detalles
          </h5>

          <VDivider class="my-4" />

          <!-- 👉 User Details list -->
          <VList class="card-list">
            <VListItem>
              <VListItemTitle class="text-sm">
                <span class="font-weight-medium">Username:</span>
                <span class="text-body-1 text-uppercase">
                  @{{ props.userData.name }}
                </span>
              </VListItemTitle>
            </VListItem>

            <VListItem>
              <VListItemTitle class="text-sm">
                <span class="font-weight-medium">
                  Cedula:
                </span>
                <span class="text-body-1 text-capitalize">{{ props.userData.numero_documento }}</span>
              </VListItemTitle>
            </VListItem>

            <VListItem>
              <VListItemTitle class="text-sm">
                <span class="font-weight-medium">Estado:</span>
                <VChip :color="estadoConfig.color" class="ml-2 text-uppercase">
                  {{ estadoConfig.texto }}
                </VChip>
              </VListItemTitle>
            </VListItem>

            <VListItem>
              <VListItemTitle class="text-sm">
                <span class="font-weight-medium">
                  Celular:
                </span>
                <span class="text-body-1">{{ props.userData.celular }}</span>
              </VListItemTitle>
            </VListItem>

            <VListItem>
              <VListItemTitle class="text-sm">
                <span class="font-weight-medium">
                  Direccion:
                </span>
                <span class="text-body-1 text-uppercase">{{ props.userData.direccion }}</span>
              </VListItemTitle>
            </VListItem>
          </VList>
        </VCardText>

        <!-- 👉 Edit and Suspend button -->
        <VCardText class="d-flex justify-center">
          <VBtn variant="elevated" class="me-4" @click="onEditClick">
            Edit
          </VBtn>
          <VBtn v-if="props.userData.status === 'A'" variant="outlined" color="error" @click="onEditStatusClick">
            Inactivar
          </VBtn>
          <VBtn v-else variant="outlined" color="success" @click="onEditStatusClick">
            Activar
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
    <!-- !SECTION -->
  </VRow>



</template>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 0.5rem;
}

.current-plan {
  border: 2px solid rgb(var(--v-theme-primary));
}

.text-capitalize {
  text-transform: capitalize !important;
}
</style>
