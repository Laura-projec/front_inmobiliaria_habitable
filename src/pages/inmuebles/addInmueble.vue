<script setup>
import AppDateTimePicker from '@/@core/components/app-form-elements/AppDateTimePicker.vue'
import { ref } from 'vue'
import { VSelect, VTextarea, VTextField } from 'vuetify/components'
import { useRouter } from 'vue-router'

const propietarioList = ref([])
const caracteristicasList = ref([])
const opciones = ref([]); // Almacena las opciones seleccionadas
const warning = ref('')
const success = ref('')
const inquilinosList = ref([])

const direccion = ref('')
const matricula = ref('')
const selectedPropietario = ref(null)
const referenciaPersonal1 = ref('')
const celularReferencia1 = ref('')
const referenciaPersonal2 = ref('')
const celularReferencia2 = ref('')
const observaciones = ref('')
const actividad = ref(null);
const precio = ref(null);

const requiereAdministracion = ref(false);
const fechaPagoAdministracion = ref(null);
const valorAdministracion = ref(null);

const requiereAdminParqueadero = ref(false);
const fechaPagoAdminParqueadero = ref(null);
const valorAdminParqueadero = ref(null);
const porcentajeArriendo = ref(null);
const valorSeguro = ref(null);
const inStock = ref(false);

// const opcionVendido = ref(false);
const vendido = ref(null);
const porcentajeVenta = ref(null);
const fechaVenta = ref(null);
const titular = ref(null);
const coodeudor = ref(null);

const inicioContrato = ref(null)
const finContrato = ref(null)
const cuentaPropietario = ref(null)
const tipoCuenta = ref(null)
const fechaPagoInquilino = ref(null)

const medioPagoCuenta = ref(null)
const medioPagoTipoCuenta = ref(null)
const medioPagoFecha = ref(null)

// Computed para mostrar solo si "Arriendo" está seleccionado
const mostrarfechaPagoInquilino = computed(() => actividad.value === "Arriendo");
const mostrarAdministracion = computed(() => actividad.value === "Arriendo");
const mostrarAdministracionParqueadero = computed(() => actividad.value === "Arriendo");
const mostrarPorcentajeSeguro = computed(() => actividad.value === 'Arriendo' && inStock.value);

const archivoContrato = ref(null); // Archivo seleccionado
const archivoContratoNombre = ref(null); // Nombre del archivo cargado previamente
const archivoContratoRuta = ref(null); // Ruta del archivo cargado previamente
const archivoContratoArriendo = ref(null); // Archivo seleccionado
const archivoContratoArriendoNombre = ref(null); // Nombre del archivo cargado previamente
const archivoContratoArriendoRuta = ref(null); // Ruta del archivo cargado previamente

const opcionVendido = computed(() => actividad.value === "Venta");
const route = useRoute()
const router = useRouter()
const isEditing = ref(false)
const dialogConfirmar = ref(false)
const finalizando = ref(false)
const contratoId = ref(/* tu id aquí o pásalo como prop */)
const isLoading = ref(false)

const guardarInmueble = async () => {
   if (!direccion.value || !selectedPropietario.value || !actividad.value || !precio.value || !matricula.value) {
      warning.value = "Todos los campos obligatorios deben estar completos";
      return;
   }

   if (!opciones.value.length) {
      warning.value = "Debe agregar al menos una característica al inmueble.";
      return;
   }

   isLoading.value = true;
   // Crear un FormData para enviar los datos
   const formData = new FormData();

   // Datos generales del inmueble
   formData.append("users_id", selectedPropietario.value);
   formData.append("direccion", direccion.value);
   formData.append("matricula", matricula.value);
   formData.append("estado", "A");
   formData.append("stock", inStock.value);
   formData.append("pago_administracion", requiereAdministracion.value);
   formData.append("observaciones", observaciones.value);
   formData.append("actividad", actividad.value);
   formData.append("vendido", vendido.value);
   formData.append("porcentaje_venta", porcentajeVenta.value);
   formData.append("fecha_venta", fechaVenta.value);

   // Características del inmueble
   opciones.value.forEach((op, index) => {
      formData.append(`caracteristicas[${index}][caracteristica_id]`, op.caracteristica);
      formData.append(`caracteristicas[${index}][valor]`, op.valor);
   });

   // Datos de arriendo
   formData.append("valor_arriendo", precio.value);
   formData.append("fecha_pago_propietario", medioPagoFecha.value);
   formData.append("fecha_pago_inquilino", fechaPagoInquilino.value);
   formData.append("medio_pago_propietario", medioPagoCuenta.value);
   formData.append("cuenta_propietario", cuentaPropietario.value);
   formData.append("porcentaje_arriendo", porcentajeArriendo.value);
   formData.append("valor_seguro", valorSeguro.value);
   formData.append("titular", titular.value);
   formData.append("coodeudor", coodeudor.value);
   formData.append("referencia_personal_1", referenciaPersonal1.value);
   formData.append("tel_pers_1", celularReferencia1.value);
   formData.append("referencia_personal_2", referenciaPersonal2.value);
   formData.append("tel_pers_2", celularReferencia2.value);

   // Datos de administración
   formData.append("parqueadero", requiereAdminParqueadero.value);
   formData.append("valor_administracion", valorAdministracion.value);
   formData.append("valor_parqueadero", valorAdminParqueadero.value);
   formData.append("fecha_pago", fechaPagoAdministracion.value);
   formData.append("fecha_pago_parqueadero", fechaPagoAdminParqueadero.value);

   // Datos del contrato
   formData.append("fecha_ini", inicioContrato.value);
   formData.append("fecha_fin", finContrato.value);

   // Archivos

   if (archivoContrato.value) {
      formData.append("archivo_contrato", archivoContrato.value);
   }
   if (archivoContratoArriendo.value) {
      formData.append("archivo_contrato_arriendo", archivoContratoArriendo.value);
   }

   try {
      if (isEditing.value) {
         // Actualizar inmueble
         await $api(`/inmuebles/update/${route.params.id}`, {
            method: "POST",
            body: formData,
         });
         success.value = "Inmueble actualizado correctamente";
      } else {
         // Crear inmueble
         await $api("/inmuebles", {
            method: "POST",
            body: formData,
         });
         success.value = "Inmueble creado correctamente";
      }
      limpiarCamposFormulario(); // Limpia los campos del formulario
      router.push("/listAlquiler");
      // router.push("/dashboard"); // Redirigir a la lista de inmuebles
   } catch (error) {
      warning.value = "Error al guardar el inmueble";
      console.error("Error al guardar el inmueble:", error);
   } finally {
      isLoading.value = false;
   }
};

const loadFile = ($event) => {
   const file = $event.target.files[0];
   if (!file || file.type !== "application/pdf") {
      archivoContrato.value = null;
      warning.value = "Solo se permiten archivos PDF.";
      return;
   }
   archivoContrato.value = file;
   warning.value = '';
};

const loadFileArriendo = ($event) => {
   const file = $event.target.files[0];
   if (!file || file.type !== "application/pdf") {
      archivoContratoArriendo.value = null;
      warning.value = "Solo se permiten archivos PDF.";
      return;
   }
   archivoContratoArriendo.value = file;
   warning.value = '';
};

const getPropietarios = async () => {
   const resp = await $api('/propietarios', {
      method: 'GET',
      onResponseError(response) {
         console.log('Error al cargar propietarios:', response.response);
      }
   });
   // Transformamos los datos para incluir fullName
   propietarioList.value = resp.propietarios.map(p => ({
      ...p,
      fullName: `${p.name} ${p.surname}` // Ahora está correcto ✅
   }));
};

const getCaracteristicas = async () => {
   const resp = await $api('/caracteristicas', {
      method: 'GET',
      onResponseError(response) {
         console.log('Error al cargar caracteristicas:', response.response);
      }
   });
   caracteristicasList.value = JSON.parse(JSON.stringify(resp.caracteristicas));
};

const getInquilinos = async () => {
   try {
      const resp = await $api('/inquilinos', {
         method: 'GET',
         onResponseError(response) {
            console.error('Error al cargar inquilinos:', response.response)
         }
      })
      // Ajusta según la estructura de tu API
      inquilinosList.value = resp.inquilinos.map(u => ({
         id: u.id,
         fullName: `${u.name} ${u.surname}`
      }))
   } catch (error) {
      console.error('Error al obtener los inquilinos:', error)
   }
}
// Agregar una nueva opción
const agregarOpcion = () => {
   opciones.value.push({ caracteristica: null, valor: null });
};
// Eliminar una opción específica
const eliminarOpcion = (index) => {
   opciones.value.splice(index, 1);
};

// Función para calcular el porcentaje y seguro cuando cambia el precio
const calcularValores = () => {
   if (actividad.value === 'Arriendo' && precio.value) {
      porcentajeArriendo.value = (precio.value * 0.10).toFixed(2);
   } else {
      porcentajeArriendo.value = null;
   }
};

const limpiarCampos = () => {
   precio.value = null;
   requiereAdministracion.value = false;
   valorAdministracion.value = null;
   fechaPagoAdministracion.value = null;
   requiereAdminParqueadero.value = false;
   valorAdminParqueadero.value = null;
   fechaPagoAdminParqueadero.value = null;
   inStock.value = false;
   porcentajeArriendo.value = null;
   valorSeguro.value = null;
   fechaPagoInquilino.value = null;
};

const limpiarCamposFormulario = () => {
   selectedPropietario.value = '';
   direccion.value = '';
   matricula.value = '';
   referenciaPersonal1.value = '';
   celularReferencia1.value = '';
   referenciaPersonal2.value = '';
   celularReferencia2.value = '';
   inStock.value = '';
   requiereAdministracion.value = '';
   observaciones.value = '';
   // archivo.value = '';
   // ruta_archivo.value = '';
   actividad.value = '';
   opciones.value = [];

   precio.value = '';
   medioPagoFecha.value = '';
   fechaPagoInquilino.value = '';
   medioPagoCuenta.value = '';
   cuentaPropietario.value = '';
   porcentajeArriendo.value = '';
   valorSeguro.value = '';

   requiereAdminParqueadero.value = '';
   valorAdministracion.value = '';
   valorAdminParqueadero.value = '';
   fechaPagoAdministracion.value = '';
   fechaPagoAdminParqueadero.value = '';

   inicioContrato.value = '';
   finContrato.value = '';
   // archivo_contrato.value = '';
   // ruta_archivo_contrato.value = '';
};

// const BASE_URL = 'http://localhost:8000' // Cambia esto por tu dominio real en producción
// const BASE_URL = import.meta.env.VITE_API_LARAVEL_BASE_URL
const BASE_URL = 'https://api.inmobiliaria-habitable.com'
const getArchivoUrl = (ruta) => {
   if (!ruta) return '#'
   if (ruta.startsWith('http')) return ruta
   return BASE_URL + ruta
}

// Función para cargar los datos del inmueble si es edición
const loadInmueble = async (id) => {
   try {
      const resp = await $api(`/inmuebles/${id}`, { method: 'GET' });
      // Datos generales del inmueble
      contratoId.value = id

      direccion.value = resp.direccion;
      matricula.value = resp.matricula;
      selectedPropietario.value = resp.users_id;
      referenciaPersonal1.value = resp.referencia_personal_1;
      celularReferencia1.value = resp.tel_pers_1;
      referenciaPersonal2.value = resp.referencia_personal_2;
      celularReferencia2.value = resp.tel_pers_2;
      observaciones.value = resp.observaciones;
      actividad.value = resp.actividad;

      inStock.value = resp.stock
      vendido.value = resp.vendido;
      porcentajeVenta.value = resp.porcentaje_venta;
      fechaVenta.value = resp.fecha_venta;
      precio.value = resp.valor_arriendo;
      medioPagoCuenta.value = resp.medio_pago_propietario;
      cuentaPropietario.value = resp.numero_cuenta_propietario;
      porcentajeArriendo.value = resp.porcentaje_arriendo;
      valorSeguro.value = resp.valor_seguro;
      requiereAdministracion.value = resp.pago_administracion
      medioPagoFecha.value = resp.fecha_pago_propietario;


      // Características del inmueble
      opciones.value = resp.caracteristicas.map((caracteristica) => ({
         caracteristica: caracteristica.caracteristica_id,
         valor: caracteristica.valor,
      }));

      // Datos de arriendo (si existen)
      if (resp.arriendo) {
         // precio.value = numberFormat.format(resp.arriendo.valor_arriendo);

         fechaPagoInquilino.value = resp.arriendo.fecha_pago_inquilino;

         titular.value = resp.arriendo.titular;
         coodeudor.value = resp.arriendo.coodeudor;
      }

      // Datos de administración (si existen)
      if (resp.administracion) {

         // requiereAdministracion.value = resp.pago_administracion;
         valorAdministracion.value = resp.administracion.valor_administracion;
         valorAdminParqueadero.value = resp.administracion.valor_parqueadero;
         fechaPagoAdministracion.value = resp.administracion.fecha_pago;
         fechaPagoAdminParqueadero.value = resp.administracion.fecha_pago_parqueadero;
      }

      // Datos del contrato (si existen)
      if (resp.contratos) {
         // Datos del contrato propietario
         if (resp.contratos.propietario) {
            inicioContrato.value = resp.contratos.propietario.fecha_ini
            finContrato.value = resp.contratos.propietario.fecha_fin
            archivoContratoNombre.value = resp.contratos.propietario.archivo_contrato
            archivoContratoRuta.value = resp.contratos.propietario.ruta_archivo_contrato
         } else {
            inicioContrato.value = null
            finContrato.value = null
            archivoContratoNombre.value = null
            archivoContratoRuta.value = null
         }

         // Datos del contrato arriendo
         if (resp.contratos.arriendo) {
            archivoContratoArriendoNombre.value = resp.contratos.arriendo.archivo_contrato
            archivoContratoArriendoRuta.value = resp.contratos.arriendo.ruta_archivo_contrato
         } else {
            archivoContratoArriendoNombre.value = null
            archivoContratoArriendoRuta.value = null
            contratoId.value = null
         }
      }

      isEditing.value = true; // Indicar que estamos en modo edición
   } catch (error) {
      console.error('Error al cargar el inmueble:', error);
      warning.value = 'Error al cargar los datos del inmueble';
   }
};

const confirmarFinalizarContrato = () => {
   dialogConfirmar.value = true
}

const finalizarContrato = async (id) => {
   finalizando.value = true
   try {
      await $api(`/contratos/${id}/finalizar`, { method: 'POST' })
      dialogConfirmar.value = false // Cierra el modal
      success.value = 'Contrato finalizado correctamente'
      setTimeout(() => {
         router.push('/listAlquiler') // O la ruta que corresponda a tu listado
      }, 1500)
   } catch (error) {
      warning.value = 'Error al finalizar el contrato'
      console.error(error)
   } finally {
      finalizando.value = false
   }
}
const precioFormateado = ref('')

watch(precio, (val) => {
   if (val !== null && val !== '') {
      precioFormateado.value = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val)
   } else {
      precioFormateado.value = ''
   }
})

// Watch para actualizar valores cuando cambia el precio
watch(precio, calcularValores);
watch(inStock, calcularValores);
watch(actividad, (newValue) => {
   if (newValue === 'Venta') {
      limpiarCampos();
   }
});
onMounted(() => {
   const id = route.params.id
   if (id) {
      loadInmueble(id)
   }
})

onMounted(async () => {
   getPropietarios();
   getCaracteristicas();
   getInquilinos()
});
</script>

<template>
   <div>
      <div class="d-flex flex-wrap justify-space-between gap-4 mb-6">
         <div class="d-flex flex-column justify-center">
            <h4 class="text-h4 mb-1">
               {{ isEditing ? 'Editar Inmueble' : 'Agregar Inmueble' }}
            </h4>
         </div>
         <div class="d-flex gap-4 align-center flex-wrap">
            <VBtn variant="outlined" color="secondary" @click="router.push('/inmuebles')">
               Cancelar
            </VBtn>
            <VBtn variant="outlined" color="primary" @click="guardarInmueble" :loading="isLoading">
               {{ isEditing ? 'Actualizar' : 'Guardar' }}
            </VBtn>
         </div>
      </div>

      <VAlert v-if="warning" type="error" class="mb-4">{{ warning }}</VAlert>
      <VAlert v-if="success" type="success" class="mb-4">{{ success }}</VAlert>

      <VRow>
         <VCol md="8" cols="12">
            <VCard class="mb-6" title="Información del inmueble">
               <VCardText>
                  <VRow dense>
                     <VCol cols="12" md="6">
                        <VTextField v-model="direccion" required placeholder="calle 50">
                           <template #label>
                              Dirección <span style="color:red">*</span>
                           </template>
                        </VTextField>
                     </VCol>
                     <VCol cols="12" md="6">
                        <VTextField v-model="matricula" required placeholder="50***">
                           <template #label>
                              Matrícula <span style="color:red">*</span>
                           </template>
                        </VTextField>
                     </VCol>
                     <VCol cols="12" md="6">
                        <VSelect v-model="selectedPropietario" :items="propietarioList" item-title="fullName"
                           item-value="id" required>
                           <template #label>
                              Propietario <span style="color:red">*</span>
                           </template>
                        </VSelect>
                     </VCol>
                     <VCol cols="12">
                        <VTextarea v-model="observaciones" label="Observaciones"
                           placeholder="Ingrese cualquier observación relevante" />
                     </VCol>
                  </VRow>
               </VCardText>
            </VCard>

            <VCard title="Características" class="mb-6">
               <VCardText>
                  <template v-for="(opcion, index) in opciones" :key="index">
                     <VRow dense>
                        <VCol cols="12" md="4">
                           <VSelect v-model="opcion.caracteristica" :items="caracteristicasList" item-title="nombre"
                              item-value="id" required>
                              <template #label>
                                 Característica <span style="color:red">*</span>
                              </template>
                           </VSelect>
                        </VCol>
                        <VCol cols="12" md="6">
                           <VTextField v-model="opcion.valor" type="number" required placeholder="Ingrese una cantidad">
                              <template #label>
                                 Cantidad <span style="color:red">*</span>
                              </template>
                           </VTextField>
                        </VCol>
                        <VCol cols="12" md="2" class="d-flex align-center">
                           <VBtn color="red" @click="eliminarOpcion(index)">
                              <i class="ri-delete-bin-line"></i>
                           </VBtn>
                        </VCol>
                     </VRow>
                  </template>
                  <VBtn class="mt-6" prepend-icon="ri-add-line" @click="agregarOpcion">
                     Agregar Opción
                  </VBtn>
               </VCardText>
            </VCard>
         </VCol>

         <VCol md="4" cols="12">
            <VCard title="Estado Inmueble" class="mb-6">
               <VCardText>
                  <VRow dense>
                     <VCol cols="12">
                        <VSelect v-model="actividad" class="my-2" required :items="['Arriendo', 'Venta']">
                           <template #label>
                              Actividad <span style="color:red">*</span>
                           </template>
                        </VSelect>
                     </VCol>
                     <VCol cols="12">
                        <VTextField v-model="precio" required placeholder="Ingrese el precio" type="number"
                           @input="calcularValores">
                           <template #label>
                              Precio <span style="color:red">*</span>
                           </template>
                           <template #append-inner>
                              <span v-if="precio !== null && precio !== ''" class="text-success"
                                 style="white-space:nowrap;">
                                 {{ Number(precio).toLocaleString('es-CO') }}
                              </span>
                           </template>
                        </VTextField>
                     </VCol>
                     <VCol cols="12" v-if="mostrarfechaPagoInquilino">
                        <AppDateTimePicker v-model="fechaPagoInquilino" label="Fecha Pago Arriendo"
                           placeholder="Seleccione fecha" class="mb-6" />
                     </VCol>

                     <VTextField v-model="valorSeguro" required placeholder="Ingrese el valor del seguro" type="number"
                        class="mb-6">
                        <template #label>
                           Valor Fianza <span style="color:red">*</span>
                        </template>
                        <template #append-inner>
                           <span v-if="valorSeguro !== null && valorSeguro !== ''" class="text-success"
                              style="white-space:nowrap;">
                              {{ Number(valorSeguro).toLocaleString('es-CO') }}
                           </span>
                        </template>
                     </VTextField>
                     <template v-if="opcionVendido">
                        <VCol cols="12">
                           <VCheckbox v-model="vendido" label="¿Vendido?" @change="calcularValoresVenta" />
                        </VCol>
                        <VCol cols="12">
                           <VTextField v-model="porcentajeVenta" label="Porcentaje venta" placeholder="Ingrese el valor"
                              type="number" class="mb-6" />
                        </VCol>
                        <VCol cols="12">
                           <AppDateTimePicker v-model="fechaVenta" label="Fecha Venta" placeholder="Seleccione fecha"
                              class="mb-6" />
                        </VCol>
                     </template>
                     <template v-if="mostrarAdministracion == true || mostrarAdministracion == 'true'">
                        <VCol cols="12">
                           <VCheckbox v-model="requiereAdministracion" label="¿Requiere pago de administración?"
                              :true-value="true" :false-value="false" />
                        </VCol>
                        <VCol cols="12" v-if="requiereAdministracion == true || requiereAdministracion == 'true'">
                           <VTextField v-model="valorAdministracion" required placeholder="Ingrese el valor"
                              type="number" class="mb-6">
                              <template #label>
                                 Valor Administración <span style="color:red">*</span>
                              </template>
                              <template #append-inner>
                                 <span v-if="valorAdministracion !== null && valorAdministracion !== ''"
                                    class="text-success" style="white-space:nowrap;">
                                    {{ Number(valorAdministracion).toLocaleString('es-CO') }}
                                 </span>
                              </template>
                           </VTextField>
                        </VCol>
                        <VCol cols="12" v-if="requiereAdministracion == true || requiereAdministracion == 'true'">
                           <AppDateTimePicker v-model="fechaPagoAdministracion" label="Fecha Pago Administración"
                              placeholder="Seleccione fecha" class="mb-6" />
                        </VCol>
                     </template>
                     <template v-if="actividad === 'Arriendo'">
                        <VCol cols="12">
                           <VDivider class="my-2" />
                           <div class="d-flex flex-row align-center justify-space-between">
                              <span>In stock</span>
                              <VSwitch v-model="inStock" :true-value="true" :false-value="false" density="compact"
                                 @change="calcularValores" />
                           </div>
                        </VCol>
                        <template v-if="inStock === true || inStock === 'true'">
                           <VCol cols="12">
                              <VCol>
                                 <VSelect v-model="titular" :items="inquilinosList" item-title="fullName"
                                    item-value="id" label="Titular (Inquilino)" placeholder="Seleccione el titular"
                                    class="mb-2" />
                              </VCol>
                              <VCol>
                                 <VTextField v-model="coodeudor" label="Nombre Coodeudor" placeholder="Ingrese el coodeudor"
                                    type="text" class="mb-6" />
                              </VCol>
                              <VCol>
                                 <VTextField v-model="referenciaPersonal1" label="Correo Coodeudor" />
                              </VCol>
                              <VCol>
                                 <VTextField v-model="celularReferencia1" type="number" label="Celular Coodeudor"
                                    placeholder="311312****" />
                              </VCol>
                              <VCol>
                                 <VTextField v-model="referenciaPersonal2" label="Referencia personal" />
                              </VCol>
                              <VCol>
                                 <VTextField v-model="celularReferencia2" type="number" label="Celular referencia"
                                    placeholder="311312****" />
                              </VCol>

                              
                           </VCol>
                           <template v-if="mostrarPorcentajeSeguro">
                              <VDivider class="my-2" />
                              <VTextField v-model="porcentajeArriendo" label="Porcentaje Arriendo (10%)" type="number"
                                 readonly>
                                 <template #label>
                                    <span style="color:red">*</span>
                                 </template>
                                 <template #append-inner>
                                    <span v-if="porcentajeArriendo !== null && porcentajeArriendo !== ''"
                                       class="text-success" style="white-space:nowrap;">
                                       {{ Number(porcentajeArriendo).toLocaleString('es-CO') }}
                                    </span>
                                 </template>
                              </VTextField>
                           </template>
                        </template>
                        <VCol cols="12" md="12">
                           <VRow>
                              <VCol>
                                 <VFileInput v-model="archivoContratoArriendo" label="Subir Contrato de Arriendo"
                                    accept=".pdf" @change="loadFileArriendo" />
                                 <div v-if="archivoContratoArriendoRuta" class="mt-2">
                                    Archivo actual: <a :href="getArchivoUrl(archivoContratoArriendoRuta)"
                                       target="_blank">Documento</a>
                                 </div>
                              </VCol>
                           </VRow>
                        </VCol>
                     </template>
                  </VRow>
               </VCardText>
            </VCard>

            <VCard class="mb-6" title="Contrato Arrendamiento">
               <VCardText>
                  <div class="d-flex flex-column gap-y-5">
                     <AppDateTimePicker v-model="inicioContrato" label="Inicio Del contrato"
                        placeholder="Seleccione fecha" />
                     <AppDateTimePicker v-model="finContrato" label="Fin Del contrato" placeholder="Seleccione fecha" />
                  </div>
                  <VCol cols="12" md="12">
                     <VRow>
                        <VCol>
                           <VFileInput v-model="archivoContrato" label="Subir Contrato" accept=".pdf"
                              @change="loadFile" />
                           <div v-if="archivoContratoNombre" class="mt-2">
                              Archivo actual: <a :href="getArchivoUrl(archivoContratoRuta)"
                                 target="_blank">Documento</a>
                           </div>
                        </VCol>
                     </VRow>
                  </VCol>
               </VCardText>
               <VBtn class="mb-6 ml-5" v-if="contratoId" color="error" variant="outlined" :loading="finalizando"
                  @click="confirmarFinalizarContrato" prepend-icon="ri-close-circle-line">
                  Finalizar Contrato
               </VBtn>
               <VDialog v-model="dialogConfirmar" max-width="400">
                  <VCard>
                     <VCardTitle>¿Finalizar contrato?</VCardTitle>
                     <VCardText>
                        Esta acción marcará el contrato como finalizado y el arriendo como inactivo.<br>
                        ¿Deseas continuar?
                     </VCardText>
                     <VCardActions>
                        <VSpacer />
                        <VBtn text @click="dialogConfirmar = false">Cancelar</VBtn>
                        <VBtn color="error" @click="finalizarContrato(contratoId)">Finalizar</VBtn>
                     </VCardActions>
                  </VCard>
               </VDialog>
            </VCard>

            <VCard class="mb-6" title="Medio de pago A PROPIETARIO">
               <VCardText>
                  <div class="d-flex flex-column gap-y-5">
                     <VSelect v-model="medioPagoCuenta" class="my-2" placeholder="" required
                        :items="['Davivienda', 'Bancolombia', 'Nequi', 'Daviplata', 'Efectivo']">
                        <template #label>
                           Cuenta <span style="color:red">*</span>
                        </template>
                     </VSelect>
                     <VSelect v-model="medioPagoTipoCuenta" class="my-2" placeholder="" required
                        :items="['Ahorro', 'Corriente']">
                        <template #label>
                           Tipo Cuenta <span style="color:red">*</span>
                        </template>
                     </VSelect>
                     <AppDateTimePicker v-model="medioPagoFecha" label="Fecha de pago" placeholder="Seleccione fecha" />
                     <VTextField v-model="cuentaPropietario" label="Cuenta Propietario" placeholder="Ingrese cuenta"
                        class="mb-6" type="number" />
                  </div>
               </VCardText>
            </VCard>
         </VCol>
      </VRow>
   </div>
</template>

<style lang="scss" scoped>
.mb-2 {
   margin-bottom: 0.5rem !important;
}

.mb-4 {
   margin-bottom: 1rem !important;
}

.mb-6 {
   margin-bottom: 1.5rem !important;
}

.mt-2 {
   margin-top: 0.5rem !important;
}

.ml-5 {
   margin-left: 2rem !important;
}
</style>

<style lang="scss" scoped>
.drop-zone {
   border: 1px dashed rgba(var(--v-theme-on-surface), 0.12);
   border-radius: 8px;
}
</style>

<style lang="scss">
.inventory-card {

   .v-radio-group,
   .v-checkbox {
      .v-selection-control {
         align-items: start !important;
      }

      .v-label.custom-input {
         border: none !important;
      }
   }
}

.ProseMirror {
   p {
      margin-block-end: 0;
   }

   padding: 0.5rem;
   outline: none;

   p.is-editor-empty:first-child::before {
      block-size: 0;
      color: #adb5bd;
      content: attr(data-placeholder);
      float: inline-start;
      pointer-events: none;
   }
}
</style>