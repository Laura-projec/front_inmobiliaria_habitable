<script setup>
import { VAlert, VCheckbox, VCol, VImg, VTable, VTextField } from 'vuetify/components'
import { ref, defineEmits } from 'vue'
import AppDateTimePicker from '@/@core/components/app-form-elements/AppDateTimePicker.vue';

// Emitir el evento 'close' para indicar que se debe cerrar el formulario
const emit = defineEmits();
// Definir la prop `roles` que se recibe desde el componente padre
const props = defineProps({
  roles: Array,  // Asegúrate de que sea un Array, ya que los roles son una lista
});


const warning = ref(null);
const error_exists = ref(null)
const success_exists = ref(null)
const isPasswordVisible = ref(false)
const FILE_AVATAR = ref(null)
const IMAGEN_PREVIZUALIZA = ref(null)
const isSaving = ref(false)


const userData = ref({
  name: '',
  surname: '',
  tipo_documento: '',
  numero_documento: '',
  direccion: '',
  fecha_cumpleaños: '',
  celular: '',
  email: '',
  password: '',
  role_id: '',
  status: '',
  genero: '',
  avatar: '',
});

const onFormSubmit = () => {
  warning.value = null;

  if (!userData.value.name) {
    warning.value = "Se debe llenar el nombre del usuario";
    return
  }
  if (!userData.value.surname) {
    warning.value = "Se debe llenar los apellidos del usuario";
    return
  }
  if (!userData.value.numero_documento) {
    warning.value = "Se debe llenar el numero de documento del usuario";
    return
  }
  if (!userData.value.tipo_documento) {
    warning.value = "Se debe llenar el tipo de documento del usuario";
    return
  }
  if (!userData.value.celular) {
    warning.value = "Se debe llenar el celular del usuario";
    return
  }
  if (!userData.value.fecha_cumpleaños) {
    warning.value = "Se debe llenar la fecha de nacimiento del usuario";
    return
  }
  if (!userData.value.email) {
    warning.value = "Se debe llenar el correo/email del usuario";
    return
  }
  if (!userData.value.password) {
    warning.value = "Se debe llenar ingresar una contraseña";
    return
  }
  if (!userData.value.genero) {
    warning.value = "Se debe llenar el genero del usuario";
    return
  }
  if (!userData.value.role_id) {
    warning.value = "Se debe llenar el rol del usuario";
    return
  }

  try {
    save();

  } catch (error) {

  }

};

const validateEmail = (email) => {
  warning.value = "El correo electrónico debe ser válido y contener @";
  return email.includes('@');
};

const onFormReset = () => {
  userData.value = {
    name: '',
    email: '',
    password: '',
    surname: '',
    role_id: '',
    avatar: '',
    celular: '',
    tipo_documento: '',
    numero_documento: '',
    fecha_cumpleaños: '',
    direccion: '',
    status: '',
  };
  // Emitir el evento 'close' para cerrar el formulario cuando se cancela
  emit('close', false);  // Aquí puedes pasar un `false` si no quieres hacer nada más
};

function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

const save = async () => {

  let formData = new FormData();
  formData.append("name", userData.value.name)
  formData.append("surname", userData.value.surname)
  formData.append("tipo_documento", userData.value.tipo_documento)
  formData.append("numero_documento", userData.value.numero_documento)
  formData.append("direccion", userData.value.direccion)
  // Convierte la fecha de cumpleaños a formato 'YYYY-MM-DD' si no está vacío
  if (userData.value.fecha_cumpleaños) {
    formData.append("fecha_cumpleaños", new Date(userData.value.fecha_cumpleaños).toISOString().split('T')[0]);
  } else {
    formData.append("fecha_cumpleaños", '');
  }
  formData.append("role_id", userData.value.role_id)
  formData.append("celular", userData.value.celular)
  formData.append("email", userData.value.email)
  formData.append("password", userData.value.password)
  formData.append("status", userData.value.status ? userData.value.status.charAt(0) : '')
  formData.append("genero", userData.value.genero)
  if (FILE_AVATAR) {
    formData.append("avatar", userData.value.avatar)
  }

  isSaving.value = true;
  try {
    const resp = await $api('/user', {
      method: 'POST',
      body: formData,
      onResponseError(response) {
        isSaving.value = false;
        if (response.response.status == 403 || response.response.status == 500) {
          error_exists.value = response.response._data.message;
        }
      }
    })

    isSaving.value = false;
    if (resp.status == 200) {
      success_exists.value = 'Guardado con éxito';
      // 🔄 Emitir evento para recargar la lista de roles en el componente padre
      emit('close', true);
      onFormReset();
    }

    setTimeout(() => {
      success_exists.value = null
      warning.value = null
      error_exists.value = null
    }, 2500);
  } catch (error) {
    isSaving.value = false;
  }
}

const loadFile = ($event) => {
  if ($event.target.files[0].type.indexOf("image") < 0) {
    FILE_AVATAR.value = null
    IMAGEN_PREVIZUALIZA.value = null
    warning.value = "SOLAMENTE PUEDEN SER ARCHIVOS DE TIPO IMAGEN";
    return;
  }
  warning.value = '';
  FILE_AVATAR.value = $event.target.files[0];
  let reader = new FileReader();
  reader.readAsDataURL(FILE_AVATAR.value);
  reader.onloadend = () => IMAGEN_PREVIZUALIZA.value = reader.result;
}
// Watcher para actualizar el password cuando cambia el numero_documento
watch(() => userData.value.numero_documento, (newValue) => {
  if (newValue) {
    userData.value.password = newValue; // Establecer el número de documento como contraseña
  }
});

</script>
<template>
  <VCard class="pa-sm-11 pa-3">
    <VCardText class="pt-5">
      <div class="text-center pb-6">
        <h4 class="text-h4 mb-2">Agregar Nuevo Usuario</h4>
        <!-- <div class="text-body-1">
          Updating user details will receive a privacy audit.
        </div> -->
      </div>

      <!-- 👉 Form -->
      <VForm class="mt-4" @submit.prevent="onFormSubmit">
        <VRow>
          <VCol cols="12" md="6">
            <VTextField v-model="userData.name" label="Nombres" placeholder="John" />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField v-model="userData.surname" label="Apellidos" placeholder="Doe" />
          </VCol>

          <VCol cols="12" md="6">
            <VSelect v-model="userData.tipo_documento" :items="['CC', 'TI', 'NIT', 'PASAPORTE', 'PP']"
              label="Tipo Documento" />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField v-model="userData.numero_documento" label="Nro documento" placeholder="1097****" :rules="[
              v => !!v || 'El número de documento es requerido',
              v => /^[A-Za-z0-9]+$/.test(v) || 'No se permiten espacios, puntos ni caracteres especiales'
            ]" @input="userData.numero_documento = userData.numero_documento.replace(/[^A-Za-z0-9]/g, '')" />
          </VCol>

          <VCol cols="12">
            <VTextField v-model="userData.direccion" label="Direccion" placeholder="Calle 50 # 1-12" />
          </VCol>

          <VCol cols="12" md="6">
            <AppDateTimePicker v-model="userData.fecha_cumpleaños" label="Fecha de nacimiento"
              placeholder="Seleccione fecha" />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField v-model="userData.celular" type="number" label="celular" placeholder="311312****" />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField v-model="userData.email" type="email" label="Email" placeholder="johndoe@email.com" />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField v-model="userData.password" label="Password" placeholder="············"
              :type="isPasswordVisible ? 'text' : 'password'"
              :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
              @click:append-inner="isPasswordVisible = !isPasswordVisible"
              hint="La contraseña corresponderá al número de documento." readonly="true" />
          </VCol>

          <VCol cols="12" md="6">
            <VSelect v-model="userData.role_id" label="Rol" :items="props.roles" item-title="name" item-value="id" />
          </VCol>

          <VCol cols="12" md="6">
            <VSelect v-model="userData.status" :items="['Activo', 'Inactivo']" label="estado" />
          </VCol>

          <VCol cols="12" md="6">
            <VRadioGroup v-model="userData.genero" inline>
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
          <VAlert type="info" v-if="isSaving" class="mt-3">Guardando...</VAlert>
          <VAlert type="success" v-if="success_exists" class="mt-3">{{ success_exists }}</VAlert>

          <!-- <VCol cols="12" md="6">
            <VSelect v-model="userData.country" :items="['United States', 'United Kingdom', 'France']"
              label="Country" />
          </VCol> -->

          <VCol cols="12" class="d-flex flex-wrap justify-center gap-4">
            <VBtn type="submit">Guardar</VBtn>
            <VBtn color="secondary" variant="outlined" @click="onFormReset">Cancel</VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCardText>
  </VCard>
</template>