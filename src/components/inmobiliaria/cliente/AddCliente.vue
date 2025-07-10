<script setup>
import { VAlert, VCheckbox, VCol, VImg, VSelect, VTable, VTextField } from 'vuetify/components'
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


const clientData = ref({
  name: '',
  surname: '',
  tipo_documento: '',
  numero_documento: '',
  direccion: '',
  fecha_cumpleaños: '',
  celular: '',
  email: '',
  password: '',
  status: '',
  genero: '',
  avatar: '',
  role_id: '',
  inmuebles: [],
});

const onFormSubmit = () => {
  warning.value = null;

  if (!clientData.value.name) {
    warning.value = "Se debe llenar el nombre del cliente";
    return
  }
  if (!clientData.value.surname) {
    warning.value = "Se debe llenar los apellidos del cliente";
    return
  }
  if (!clientData.value.numero_documento) {
    warning.value = "Se debe llenar el numero de documento del cliente";
    return
  }
  if (!clientData.value.tipo_documento) {
    warning.value = "Se debe llenar el tipo de documento del cliente";
    return
  }
  if (!clientData.value.celular) {
    warning.value = "Se debe llenar el celular del cliente";
    return
  }
  if (!clientData.value.fecha_cumpleaños) {
    warning.value = "Se debe llenar la fecha de nacimiento del cliente";
    return
  }
  if (!clientData.value.email) {
    warning.value = "Se debe llenar el correo/email del cliente";
    return
  }
  if (!clientData.value.password) {
    warning.value = "Se debe llenar ingresar una contraseña";
    return
  }
  if (!clientData.value.genero) {
    warning.value = "Se debe llenar el genero del cliente";
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
  clientData.value = {
    name: '',
    email: '',
    password: '',
    surname: '',
    avatar: '',
    celular: '',
    tipo_documento: '',
    numero_documento: '',
    fecha_cumpleaños: '',
    direccion: '',
    status: '',
    role_id: '',
    inmuebles: [],
  };
  // Emitir el evento 'close' para cerrar el formulario cuando se cancela
  emit('close', false);  // Aquí puedes pasar un `false` si no quieres hacer nada más
};

const save = async () => {

  let formData = new FormData();
  formData.append("name", clientData.value.name)
  formData.append("surname", clientData.value.surname)
  formData.append("tipo_documento", clientData.value.tipo_documento)
  formData.append("numero_documento", clientData.value.numero_documento)
  formData.append("direccion", clientData.value.direccion)
  // Convierte la fecha de cumpleaños a formato 'YYYY-MM-DD' si no está vacío
  if (clientData.value.fecha_cumpleaños) {
    formData.append("fecha_cumpleaños", new Date(clientData.value.fecha_cumpleaños).toISOString().split('T')[0]);
  } else {
    formData.append("fecha_cumpleaños", '');
  }
  formData.append("celular", clientData.value.celular)
  formData.append("email", clientData.value.email)
  formData.append("password", clientData.value.password)
  formData.append("status", clientData.value.status.charAt(0))
  formData.append("genero", clientData.value.genero)
  formData.append("role_id", clientData.value.role_id)
  if (FILE_AVATAR) {
    formData.append("avatar", clientData.value.avatar)
  }

  try {

    const resp = await $api('/user', {
      method: 'POST',
      body: formData,
      onResponseError(response) {
        console.log(response);
        console.log(response.response);

        if (response.response.status == 403 || response.response.status == 500) {
          console.log('entra aca');
          if (response.response.status == 403) {
            warning.value = response.response.message_text;
          } else {
            warning.value = 'No se pudo enviar el formulario, intente nuevamente'
          }
          // 
        }
      }
    })

    if (resp.status == 200) {
      success_exists.value = resp.message_text;
      // 🔄 Emitir evento para recargar la lista de roles en el componente padre
      emit('close', true);
      onFormReset();
    } else {
      if (resp.status == "403") {
        warning.value = resp.message_text;
      } else {
        warning.value = 'No se pudo enviar el formulario, intente nuevamente'
      }
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
watch(() => clientData.value.numero_documento, (newValue) => {
  if (newValue) {
    clientData.value.password = newValue; // Establecer el número de documento como contraseña
  }
});

</script>
<template>
  <VCard class="pa-sm-11 pa-3">
    <VCardText class="pt-5">
      <div class="text-center pb-6">
        <h4 class="text-h4 mb-2">Agregar Nuevo cliente</h4>
        <!-- <div class="text-body-1">
          Updating user details will receive a privacy audit.
        </div> -->
      </div>

      <!-- 👉 Form -->
      <VForm class="mt-4" @submit.prevent="onFormSubmit">
        <VRow>
          <VCol cols="12" md="6">
            <VTextField v-model="clientData.name" label="Nombres" placeholder="John" />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField v-model="clientData.surname" label="Apellidos" placeholder="Doe" />
          </VCol>

          <VCol cols="12" md="6">
            <VSelect v-model="clientData.tipo_documento" :items="['CC', 'TI', 'NIT', 'PASAPORTE', 'PP']"
              label="Tipo Documento" />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField v-model="clientData.numero_documento" label="Nro documento" placeholder="1097****" :rules="[
              v => !!v || 'El número de documento es requerido',
              v => /^[A-Za-z0-9]+$/.test(v) || 'No se permiten espacios, puntos ni caracteres especiales'
            ]" @input="clientData.numero_documento = clientData.numero_documento.replace(/[^A-Za-z0-9]/g, '')" />
          </VCol>

          <VCol cols="12">
            <VTextField v-model="clientData.direccion" label="Direccion" placeholder="Calle 50 # 1-12" />
          </VCol>

          <VCol cols="12" md="6">
            <AppDateTimePicker v-model="clientData.fecha_cumpleaños" label="Fecha de nacimiento"
              placeholder="Seleccione fecha" />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField v-model="clientData.celular" type="number" label="celular" placeholder="311312****" />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField v-model="clientData.email" type="email" label="Email" placeholder="johndoe@email.com" />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField v-model="clientData.password" label="Password" placeholder="············"
              :type="isPasswordVisible ? 'text' : 'password'"
              :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
              @click:append-inner="isPasswordVisible = !isPasswordVisible"
              hint="La contraseña corresponderá al número de documento." readonly="true" />
          </VCol>

          <VCol cols="12" md="6">
            <VSelect v-model="clientData.status" :items="['Activo', 'Inactivo']" label="estado" />
          </VCol>

          <VCol cols="12" md="6">
            <VSelect v-model="clientData.role_id" label="Rol" :items="props.roles" item-title="name" item-value="id" />
          </VCol>

          <VCol cols="12" md="6">
            <VRadioGroup v-model="clientData.genero" inline>
              <VRadio label="Femenino" value="F" />
              <VRadio label="Masculino" value="M" />
            </VRadioGroup>
          </VCol>

          <!-- <VCol cols="12" md="6">
            <VRow>
              <VCol>
                <VFileInput label="File input" @change="loadFile($event)" />
              </VCol>
              <VCol v-if="IMAGEN_PREVIZUALIZA">
                <VImg width="120" height="150" :src="IMAGEN_PREVIZUALIZA" />
              </VCol>
            </VRow>
          </VCol> -->
          <VAlert type="warning" v-if="warning" class="mt-3"> <strong>{{ warning }}</strong> </VAlert>
          <VCol cols="12" class="d-flex flex-wrap justify-center gap-4">
            <VBtn type="submit">Guardar</VBtn>
            <VBtn color="secondary" variant="outlined" @click="onFormReset">Cancel</VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCardText>
  </VCard>
</template>