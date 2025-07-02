<script setup>
const props = defineProps({
  userData: {
    type: Object,
    required: true,
  },
  roles:{
    type: Array,
  }
})

const onFormSubmit = () => {
  warning.value = null; 

  if (!props.userData.name) {
    warning.value = "Se debe llenar el nombre del usuario";
    return
  }
  if (!props.userData.surname) {
    warning.value = "Se debe llenar los apellidos del usuario";
    return
  }
  if (!props.userData.numero_documento) {
    warning.value = "Se debe llenar el numero de documento del usuario";
    return
  }
  if (!props.userData.tipo_documento) {
    warning.value = "Se debe llenar el tipo de documento del usuario";
    return
  }
  if (!props.userData.celular) {
    warning.value = "Se debe llenar el celular del usuario";
    return
  }
  if (!props.userData.fecha_cumpleaños) {
    warning.value = "Se debe llenar la fecha de nacimiento del usuario";
    return
  }
  if (!props.userData.email) {
    warning.value = "Se debe llenar el correo/email del usuario";
    return
  }
  if (!props.userData.genero) {
    warning.value = "Se debe llenar el genero del usuario";
    return
  }
  if (!props.userData.role_id) {
    warning.value = "Se debe llenar el rol del usuario";
    return
  }

  try {
    edit();

  } catch (error) {

  }

};
const warning = ref(null);
const success_exists = ref(null)
const error_exists = ref(null)

const edit = async () => {

let formData = new FormData();
formData.append("name", props.userData.name)
formData.append("surname", props.userData.surname)
formData.append("tipo_documento", props.userData.tipo_documento)
formData.append("numero_documento", props.userData.numero_documento)
formData.append("direccion", props.userData.direccion)
formData.append("fecha_cumpleaños", props.userData.fecha_cumpleaños)

// Convierte la fecha de cumpleaños a formato 'YYYY-MM-DD' si no está vacío
// if (props.userData.fecha_cumpleaños) {
//   formData.append("fecha_cumpleaños", new Date(props.userData.fecha_cumpleaños).toISOString().split('T')[0]);
// } else {
//   formData.append("fecha_cumpleaños", '');
// }
formData.append("role_id", props.userData.role_id)
formData.append("celular", props.userData.celular)
formData.append("email", props.userData.email)
// formData.append("password", userData.value.password)
formData.append("status", props.userData.status)
formData.append("genero", props.userData.genero)
// if (FILE_AVATAR) {
//   formData.append("avatar", userData.value.avatar)
// }

try {

  const resp = await $api('/user/'+ props.userData.id, {
    method: 'POST',
    body: formData,
    onResponseError(response) {
      if (response.response.status == 403 || response.response.status == 500) {
        error_exists.value = response.response._data.message;
      }
    }
  })  

  if (resp.status == 200) {
    success_exists.value = resp.message_text;
    // 🔄 Emitir evento para recargar la lista de roles en el componente padre
    emit('close', true);
    onFormReset();
  }

  setTimeout(() => {
    success_exists.value = null
    warning.value = null
    error_exists.value = null
    // emit('update:isDialogVisible', false)
  }, 2500);


} catch (error) {

}
}
 
</script>

<template>
  <section>
    <VCard id="edit-list">
      <!-- 👉 Form -->
      <VForm class="mt-4 ml-4 mr-4" @submit.prevent="onFormSubmit">
        <VRow>
          <VCol cols="12" md="6">
            <VTextField v-model="props.userData.name" label="Nombres" placeholder="John" />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField v-model="props.userData.surname" label="Apellidos" placeholder="Doe" />
          </VCol>

          <VCol cols="12" md="6">
            <VSelect v-model="props.userData.tipo_documento" :items="['CC', 'TI', 'NIT', 'PASAPORTE', 'PP']"
              label="Tipo Documento" />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField v-model="props.userData.numero_documento" label="Nro documento" placeholder="1097****" />
          </VCol>

          <VCol cols="12">
            <VTextField v-model="props.userData.direccion" label="Direccion" placeholder="Calle 50 # 1-12" />
          </VCol>

          <VCol cols="12" md="6">
            <AppDateTimePicker v-model="props.userData.fecha_cumpleaños" label="Fecha de nacimiento"
              placeholder="Seleccione fecha" />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField v-model="props.userData.celular" type="number" label="celular" placeholder="311312****" />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField v-model="props.userData.email" type="email" label="Email" placeholder="johndoe@email.com" />
          </VCol>

          <!-- <VCol cols="12" md="6">
            <VTextField v-model="props.userData.password" label="Password" placeholder="············"
              :type="isPasswordVisible ? 'text' : 'password'"
              :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
              @click:append-inner="isPasswordVisible = !isPasswordVisible"
              hint="La contraseña corresponderá al número de documento." readonly="true" />
          </VCol> -->

          <VCol cols="12" md="6">
            <VSelect v-model="props.userData.role_id" label="Rol" :items="props.roles" item-title="name" item-value="id" />
          </VCol>

          <VCol cols="12" md="6">
            <VSelect v-model="props.userData.status" :items="['Activo', 'Inactivo']" label="estado" />
          </VCol>

          <VCol cols="12" md="6">
            <VRadioGroup v-model="props.userData.genero" inline>
              <VRadio label="Femenino" value="F" />
              <VRadio label="Masculino" value="M" />
            </VRadioGroup>
          </VCol>

          <VCol cols="12" md="6">
            <VRow>
              <VCol>
                <VFileInput label="File input" @change="loadFile($event)" />
              </VCol>
              <VCol v-if="IMAGEN_PREVIZUALIZA">
                <VImg width="120" height="150" :src="IMAGEN_PREVIZUALIZA" />
              </VCol>
            </VRow>
          </VCol>
          <VAlert type="warning" v-if="warning" class="mt-3"> <strong>{{ warning }}</strong> </VAlert>
          <VAlert type="success" v-if="success_exists" class="mt-3"> <strong>{{ success_exists }}</strong> </VAlert>

          <VCol cols="12" class="d-flex flex-wrap justify-center gap-4 mb-2" >
            <VBtn type="submit">Guardar</VBtn>
            <VBtn color="secondary" variant="outlined" @click="onFormReset">Cancel</VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCard>
  </section>
</template>

<style lang="scss">
#invoice-list {
  .invoice-list-actions {
    inline-size: 8rem;
  }

  .invoice-list-search {
    inline-size: 12rem;
  }
}
</style>
