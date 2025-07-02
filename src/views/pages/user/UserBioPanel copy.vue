<script setup>
const props = defineProps({
  userData: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['edit']);  // Definir el evento 'edit'

const onEditClick = () => {
  emit('edit');  // Emitir el evento 'edit' al hacer clic en el botón
};


const resolveUserRoleVariant = role => {
  if (role === 'subscriber')
    return {
      color: 'primary',
      icon: 'ri-user-line',
    }
  if (role === 'author')
    return {
      color: 'warning',
      icon: 'ri-settings-2-line',
    }
  if (role === 'maintainer')
    return {
      color: 'success',
      icon: 'ri-database-2-line',
    }
  if (role === 'editor')
    return {
      color: 'info',
      icon: 'ri-pencil-line',
    }
  if (role === 'admin')
    return {
      color: 'error',
      icon: 'ri-server-line',
    }
  
  return {
    color: 'primary',
    icon: 'ri-user-line',
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
          <VAvatar
            rounded="lg"
            :size="120"
            :color="!props.userData.avatar ? 'primary' : undefined"
            :variant="!props.userData.avatar ? 'tonal' : undefined"
          >
            <VImg
              v-if="props.userData.avatar"
              :src="props.userData.avatar"
            />
            <span
              v-else
              class="text-5xl font-weight-medium"
            >
              {{ avatarText(props.userData.fullName) }}
            </span>
          </VAvatar>

          <!-- 👉 User fullName -->
          <h5 class="text-h5 mt-4">
            {{ props.userData.name  }}
          </h5>

          <!-- 👉 Role chip -->
          <VChip
            :color="resolveUserRoleVariant(props.userData.role.name).color"
            size="small"
            class="text-capitalize mt-4"
          >
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
                <span class="text-body-1">
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
                <span class="font-weight-medium">
                  Estado:
                </span>
                <span class="text-body-1 text-capitalize">{{ props.userData.status }}</span>
              </VListItemTitle>
            </VListItem>

            <VListItem>
              <VListItemTitle class="text-sm">
                <span class="font-weight-medium">Rol: </span>
                <span class="text-capitalize text-body-1">{{ props.userData.role.name }}</span>
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
                <span class="text-body-1">{{ props.userData.direccion }}</span>
              </VListItemTitle>
            </VListItem>  
          </VList>
        </VCardText>

        <!-- 👉 Edit and Suspend button -->
        <VCardText class="d-flex justify-center">
          <VBtn
            variant="elevated"
            class="me-4"
            @click="onEditClick"
          >
            Edit
          </VBtn>
          <VBtn
            variant="outlined"
            color="error"
          >
            Suspend
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
