<script setup>
import { ref } from 'vue'

const props = defineProps({
  userData: {
    type: Object,
    required: true,
  },
})

const isNewPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const alertMessage = ref('')
const alertType = ref('')
 
const changePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    alertMessage.value = "Las contraseñas no coinciden"
    alertType.value = "error"
    return
  }
  try {
    isLoading.value = true
    console.log('props.userData.id', props.userData.id);

    const response = await $api('/cambiar-contrasena', {
      method: 'POST',
      body: {
        user_id: props.userData.id,  // Enviar el ID del usuario seleccionado
        current_password: currentPassword.value,
        new_password: newPassword.value,
        new_password_confirmation: confirmPassword.value,
      }
    })

    if (response?.success) {
      alertMessage.value = response.success
      alertType.value = "success"

      currentPassword.value = ''
      newPassword.value = ''
      confirmPassword.value = ''
    } else {
      alertMessage.value = response?.message || "Error al cambiar la contraseña"
      alertType.value = "error"
    }
  } catch (error) {
    console.error('Error en API:', error)
    alertMessage.value = error?.response?._data?.message || "Error de conexión con el servidor"
    alertType.value = "error"
  } finally {
    isLoading.value = false
  }
}

</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard title="Cambiar contraseña">
        <VCardText>
          <VAlert v-if="alertMessage" :type="alertType" variant="tonal" closable class="mb-4">
            {{ alertMessage }}
          </VAlert>

          <VAlert v-if="!alertMessage" variant="tonal" color="warning" closable class="mb-4">
            <VAlertTitle>Requisitos de la contraseña</VAlertTitle>
            <span>Mínimo 8 caracteres, mayúsculas y símbolos.</span>
          </VAlert>

          <VForm @submit.prevent="changePassword">
            <VRow>
              <VCol cols="12">
                <VTextField v-model="currentPassword" label="Contraseña actual" type="password" required />
              </VCol>

              <VCol cols="12" md="6">
                <VTextField v-model="newPassword" label="Nueva Contraseña"
                  :type="isNewPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isNewPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                  @click:append-inner="isNewPasswordVisible = !isNewPasswordVisible" required />
              </VCol>

              <VCol cols="12" md="6">
                <VTextField v-model="confirmPassword" label="Confirmar Contraseña"
                  :type="isConfirmPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isConfirmPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                  @click:append-inner="isConfirmPasswordVisible = !isConfirmPasswordVisible" required />
              </VCol>

              <VCol cols="12">
                <VBtn type="submit" :loading="isLoading">
                  Cambiar contraseña
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
