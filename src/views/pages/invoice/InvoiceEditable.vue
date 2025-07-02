<script setup>
import { onMounted, ref, watch, computed } from 'vue';
import { $api } from '@/utils/api';
import InvoiceProductEdit from './InvoiceProductEdit.vue';
import { VNodeRenderer } from '@layouts/components/VNodeRenderer';
import { themeConfig } from '@themeConfig';

// Props y Emits
const props = defineProps({
  data: {
    type: null,
    required: true,
  },
});
const emit = defineEmits(['push', 'remove']);

// Variables Reactivas
const products = ref([...props.data.purchasedProducts]);
const invoice = ref(props.data.invoice);
const thanksNote = ref(props.data.thanksNote);
const note = ref(props.data.note);
const inquilinosList = ref([]) // Para el select multiple
const inquilinoSeleccionado = ref(null) // ID del inquilino seleccionado



// Se agrega property_id
if (!invoice.value.property_id && invoice.value.property) {
  invoice.value.property_id = invoice.value.property.id
}

const properties = ref([]);
const searchInmueble = ref('');
const novedades = ref([]);
const items = ref([]);

const propietario = ref(null)
const inquilino = ref(null)
const userType = ref('')
const userId = ref('')

// Traer items
const getItems = async () => {
  try {
    const resp = await $api('/items', { method: 'GET' })
    items.value = resp || []
  } catch (error) {
    console.error('Error al obtener los items:', error)
  }
}

// Traer inmuebles
const getInmuebles = async () => {
  try {
    const resp = await $api('/inmuebles', { method: 'GET' })
    properties.value = resp.inmuebles || []
  } catch (error) {
    console.error('Error al obtener inmuebles:', error)
  }
}

// Computado para buscar inmuebles
const filteredProperties = computed(() =>
  properties.value.filter((inm) =>
    inm.direccion?.toLowerCase().includes(searchInmueble.value.toLowerCase())
  )
)

// Obtener propietario/inquilino
const getPropietarioInquilino = async (inmuebleId) => {
  if (!inmuebleId) {
    propietario.value = null
    inquilino.value = null
    userType.value = ''
    userId.value = ''
    inquilinosList.value = []
    inquilinoSeleccionado.value = null
    return
  }
  try {
    const resp = await $api(`/inmuebles/${inmuebleId}/propietario-inquilino`, { method: 'GET' })
    propietario.value = resp.propietario
    inquilino.value = resp.inquilino

    // Combina inquilino actual e históricos, sin duplicados
    const historicos = resp.inquilinos_historicos || []
    const actual = resp.inquilino ? [resp.inquilino] : []
    const todos = [...actual, ...historicos].reduce((acc, curr) => {
      if (!acc.some(i => i.id === curr.id)) acc.push(curr)
      return acc
    }, [])
    inquilinosList.value = todos.map(u => ({
      id: u.id,
      fullName: u.nombre_completo || u.name
    }))

    // Selecciona por defecto el inquilino actual
    if (resp.inquilino) {
      inquilinoSeleccionado.value = resp.inquilino.id
      userType.value = 'inquilino'
      userId.value = resp.inquilino.id
    } else {
      inquilinoSeleccionado.value = null
    }
  } catch (error) {
    propietario.value = null
    inquilino.value = null
    userType.value = ''
    userId.value = ''
    inquilinosList.value = []
    inquilinoSeleccionado.value = null
    console.error('Error al obtener propietario/inquilino:', error)
  }
}
// Cuando cambia el userType, actualiza el userId
watch(userType, (val) => {
  if (val === 'propietario' && propietario.value) {
    userId.value = propietario.value.id
  } else if (val === 'inquilino' && inquilino.value) {
    userId.value = inquilino.value.id
  } else {
    userId.value = ''
  }
  // Limpiar productos al cambiar de usuario
  products.value = []
  // Trae novedades cada vez que cambia el usuario seleccionado
  if (invoice.value.property?.id && userId.value) {
    getNovedadesActivas(invoice.value.property.id, userId.value)
  } else {
    novedades.value = []
  }
})

const getNovedadesActivas = async (inmuebleId, usuarioId) => {
  if (!inmuebleId || !usuarioId) {
    novedades.value = []
    return
  }
  try {
    const resp = await $api(`/novedades/activas/${inmuebleId}/${usuarioId}`, { method: 'GET' })
    novedades.value = resp.novedades || []
  } catch (error) {
    novedades.value = []
    console.error('Error al obtener novedades activas:', error)
  }
}

// Obtener item por ID
const getItemNameById = (id) => {
  const item = items.value.find((item) => item.id === id);
  return item ? item.title : 'Desconocido';
};

// Agregar productos
const addNovedadCredito = (novedad) => {
  products.value.push({
    item_id: novedad.item_id,
    title: getItemNameById(novedad.item_id),
    precio: novedad.valor,
    cantidad: 1,
    tipo: 'debito',
    description: novedad.descripcion,
  });
};

const addItemCredito = () => {
  products.value.push({
    title: 'Crédito',
    precio: 0,
    cantidad: 1,
    tipo: 'credito',
    description: '',
  });
};

const addItemDebito = () => {
  products.value.push({
    title: 'Débito',
    precio: 0,
    cantidad: 1,
    tipo: 'debito',
    description: '',
  });
};

const removeProduct = id => {
  products.value.splice(id, 1);
};

// Watch para actualizar property al cambiar property_id
watch(() => invoice.value.property_id, (id) => {
  if (id) {
    invoice.value.property = properties.value.find(p => p.id === id)
    getPropietarioInquilino(id)
  } else {
    invoice.value.property = null
    propietario.value = null
    inquilino.value = null
    userType.value = ''
    userId.value = ''
    novedades.value = []
  }
})

// Actualizar novedades activas si cambia el tipo de usuario
watch(() => userType.value, () => {
  if (invoice.value.property?.id && userId.value) {
    getNovedadesActivas(invoice.value.property.id, userId.value)
  }
})

const subtotal = computed(() =>
  products.value.reduce((acc, product) => {
    const precio = Number(product.precio || 0);
    const cantidad = Number(product.cantidad || 1);
    return acc + precio * cantidad;
  }, 0)
);

// const total = computed(() =>
//   products.value.reduce((acc, product) => {
//     const precio = Number(product.precio || 0);
//     const cantidad = Number(product.cantidad || 1);
//     return acc + precio * cantidad;
//   }, 0)
// );

const totalCreditos = computed(() =>
  products.value.reduce((acc, product) => {
    if (product.tipo === 'credito') {
      const precio = Number(product.precio || 0);
      const cantidad = Number(product.cantidad || 1);
      return acc + precio * cantidad;
    }
    return acc;
  }, 0)
);

const totalDebitos = computed(() =>
  products.value.reduce((acc, product) => {
    if (product.tipo === 'debito') {
      const precio = Number(product.precio || 0);
      const cantidad = Number(product.cantidad || 1);
      return acc + precio * cantidad;
    }
    return acc;
  }, 0)
);

const total = computed(() =>
  totalCreditos.value - totalDebitos.value
);

const numberFormat = new Intl.NumberFormat('es-CO', {
  style: 'decimal',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const totalCreditosFormatted = computed(() => numberFormat.format(totalCreditos.value));
const totalDebitosFormatted = computed(() => numberFormat.format(totalDebitos.value));
const totalFormatted = computed(() => numberFormat.format(total.value));

const updateProduct = ({ id, data }) => {
  products.value[id] = { ...products.value[id], ...data }
}

watch([invoice, products, note, thanksNote], () => {
  emit('update:data', {
    invoice: invoice.value,
    purchasedProducts: products.value,
    note: note.value,
    thanksNote: thanksNote.value,
  });
}, { deep: true });

watch([userType, propietario, inquilino], () => {
  let usuario = null
  if (userType.value === 'propietario' && propietario.value) {
    usuario = propietario.value
  } else if (userType.value === 'inquilino' && inquilino.value) {
    usuario = inquilino.value
  }
  if (usuario) {
    invoice.value.client = {
      id: usuario.id,
      nombre_completo: usuario.name,
      datos_doc: usuario.documento,
      direccion: usuario.direccion,
      celular: usuario.celular,
      email: usuario.email,
    }
  }
})

// Cuando cambia el inquilino seleccionado, actualiza userType y userId
watch(inquilinoSeleccionado, (val) => {
  if (val) {
    userType.value = 'inquilino'
    userId.value = val
    inquilino.value = inquilinosList.value.find(i => i.id === val)
    // Trae novedades del nuevo inquilino seleccionado
    if (invoice.value.property?.id && userId.value) {
      getNovedadesActivas(invoice.value.property.id, userId.value)
    }
  }
})

onMounted(() => {
  getInmuebles();
  getItems();
});
</script>


<template>
  <VCard class="pa-sm-12 pa-6">
    <!-- SECTION Header -->
    <div
      class="d-flex flex-wrap justify-space-between flex-column rounded bg-var-theme-background flex-sm-row gap-6 pa-6 mb-6">
      <!-- 👉 Left Content -->
      <div>
        <div class="app-logo mb-1">
          <VNodeRenderer :nodes="themeConfig.app.logo" />
          <h1 class="app-logo-title">
            {{ themeConfig.app.title }}
          </h1>
        </div>
        <p class="text-high-emphasis mb-0 text-body-1">Armenia, Quindío</p>
        <p class="text-high-emphasis mb-0 text-body-1">(+57) 3128097256</p>
        <p class="text-high-emphasis mb-0 text-body-1">habitableinmobiliaria@gmail.com</p>
      </div>
      <!-- 👉 Right Content -->
      <div class="d-flex gap-2 flex-column">
        <div
          class="d-flex align-start align-sm-center font-weight-medium justify-sm-end flex-column flex-sm-row text-lg">
          <span class="text-high-emphasis me-4" style="inline-size: 5.625rem ;">Recibo #</span>
          <span>
            <VTextField v-model="invoice.id" disabled density="compact" prefix="#" style="inline-size: 9.5rem;" />
          </span>
        </div>
        <div class="d-flex align-start align-sm-center justify-sm-end flex-column flex-sm-row">
          <span class="text-high-emphasis me-4" style="inline-size: 5.625rem;">Fecha:</span>
          <span style="inline-size: 9.5rem;">
            <AppDateTimePicker v-model="invoice.issuedDate" density="compact" placeholder="YYYY-MM-DD"
              :config="{ position: 'auto right' }" />
          </span>
        </div>
      </div>
    </div>
    <!-- !SECTION -->

    <VRow>
      <!-- Buscar inmueble -->
      <VCol cols="12" md="6">
        <VTextField v-model="searchInmueble" label="Buscar inmueble" class="mb-4" outlined clearable
          placeholder="Escribe para buscar inmueble" />

        <VSelect v-model="invoice.property_id" :items="filteredProperties" item-title="direccion" item-value="id"
          label="Inmueble" outlined class="mb-4" />
        <!-- Selector propietario/inquilino si ambos existen -->
        <VSelect  v-model="userType" :items="[
          { value: 'propietario', title: 'Propietario' },
          { value: 'inquilino', title: 'Inquilino' }
        ]" label="¿A quién asociar las novedades?" outlined class="mb-4" @update:modelValue="val => {
          userId.value = val === 'propietario' ? propietario.id : inquilino.id
        }" required />

        <!-- Mostrar usuario seleccionado -->
        <VSelect v-if="inquilinosList.length" v-model="inquilinoSeleccionado" :items="inquilinosList"
          item-title="fullName" item-value="id" label="Inquilino actual o histórico" outlined class="mb-4" />

        <!-- Datos del usuario seleccionado -->
        <div v-show="false">
          <div v-if="userType && (propietario || inquilino)">
            <h6 class="text-h6 mb-2">Datos del usuario:</h6>
            <p class="mb-0 text-body-1">
              <strong>Nombre:</strong>
              {{ userType === 'propietario' ? propietario?.name : inquilino?.name }}
            </p>
            <p class="mb-0 text-body-1" v-if="userType === 'propietario' && propietario?.email">
              <strong>Email:</strong> {{ propietario.email }}
            </p>
            <p class="mb-0 text-body-1" v-if="userType === 'inquilino' && inquilino?.email">
              <strong>Email:</strong> {{ inquilino.email }}
            </p>
            <p class="mb-0 text-body-1" v-if="userType === 'propietario' && propietario?.celular">
              <strong>Celular:</strong> {{ propietario.celular }}
            </p>
            <p class="mb-0 text-body-1" v-if="userType === 'inquilino' && inquilino?.celular">
              <strong>Celular:</strong> {{ inquilino.celular }}
            </p>
          </div>
          <div v-else-if="propietario || inquilino">
            <h6 class="text-h6 mb-2">Datos del usuario:</h6>
            <p class="mb-0 text-body-1">
              <strong>Nombre:</strong> {{ propietario?.name || inquilino?.name }}
            </p>
            <p class="mb-0 text-body-1" v-if="propietario?.email || inquilino?.email">
              <strong>Email:</strong> {{ propietario?.email || inquilino?.email }}
            </p>
            <p class="mb-0 text-body-1" v-if="propietario?.celular || inquilino?.celular">
              <strong>Celular:</strong> {{ propietario?.celular || inquilino?.celular }}
            </p>
          </div>
        </div>
      </VCol>
      <!-- Datos del cliente (siempre visibles) -->
      <VCol class="text-no-wrap">
        <h6 class="text-h6 mb-4">Datos del cliente:</h6>
        <p class="mb-0 text-body-1">{{ invoice.client?.nombre_completo }}</p>
        <p class="mb-0 text-body-1">{{ invoice.client?.datos_doc }}</p>
        <p v-if="invoice.client?.direccion" class="mb-0 text-body-1">
          {{ invoice.client?.direccion }}
        </p>
        <p class="mb-0 text-body-1">{{ invoice.client?.celular }}</p>
        <p class="mb-0 text-body-1">{{ invoice.client?.email }}</p>
      </VCol>
    </VRow>

    <VDivider class="my-6 border-dashed" />
    <h6 class="text-h6 mb-4">Novedades Activas</h6>
    <VTable dense>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Precio</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(novedad, index) in novedades" :key="index">
          <td>{{ novedad.descripcion }}</td>
          <td>${{ numberFormat.format(novedad.valor) }}</td>
          <td>
            <VBtn size="small" color="primary" @click="addNovedadCredito(novedad)">
              Agregar
            </VBtn>
          </td>
        </tr>
        <tr v-if="novedades.length === 0">
          <td colspan="4" class="text-center">No hay novedades activas</td>
        </tr>
      </tbody>
    </VTable>
    <!-- 👉 Add purchased products -->
    <div class="add-products-form">
      <div v-for="(product, index) in products" :key="index" class="mb-4">
        <InvoiceProductEdit :id="index" :data="product" @remove-product="removeProduct"
          @update-product="updateProduct" />
      </div>
      <VBtn size="small" prepend-icon="ri-add-line" @click="addItemCredito">
        Agregar Item
      </VBtn>
    </div>

    <VDivider class="my-6 border-dashed" />

    <!-- 👉 Total Amount -->
    <div class="d-flex justify-space-between flex-wrap flex-column flex-sm-row">
      <div class="d-flex justify-space-between flex-wrap flex-column flex-sm-row">
        <div>
          <table class="w-100">
            <tbody>
              <tr>
                <td class="pe-16 text-body-1">Total Créditos:</td>
                <td :class="$vuetify.locale.isRtl ? 'text-start' : 'text-end'">
                  <h6 class="text-h6 text-success">${{ totalCreditosFormatted }}</h6>
                </td>
              </tr>
              <tr>
                <td class="pe-16 text-body-1">Total Débitos:</td>
                <td :class="$vuetify.locale.isRtl ? 'text-start' : 'text-end'">
                  <h6 class="text-h6 text-error">-${{ totalDebitosFormatted }}</h6>
                </td>
              </tr>
              <tr>
                <td class="pe-16 text-body-1">Total Neto:</td>
                <td :class="$vuetify.locale.isRtl ? 'text-start' : 'text-end'">
                  <h6 class="text-h6">${{ totalFormatted }}</h6>
                </td>
              </tr>
            </tbody>
          </table>
          <VDivider class="my-2" />
          <table class="w-100">
            <tbody>
              <tr>
                <td class="pe-16 text-body-1">Total:</td>
                <td :class="$vuetify.locale.isRtl ? 'text-start' : 'text-end'">
                  <h6 class="text-h6" :class="total < 0 ? 'text-error' : 'text-success'">
                    ${{ totalFormatted }}
                  </h6>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <VDivider class="my-6 border-dashed" />

    <div>
      <h6 class="text-h6 mb-1">
        Note:
      </h6>
      <VTextarea v-model="note" placeholder="Write note here..." :rows="2" />
    </div>
  </VCard>
</template>

<style scoped>
.app-logo {
  display: flex;
  align-items: center;
  column-gap: 0.5rem;

  .app-logo-title {
    font-size: 1.25rem;
    font-weight: 600;
    letter-spacing: 0.27px;
    line-height: 1.5rem;
    text-transform: capitalize;
  }
}
</style>