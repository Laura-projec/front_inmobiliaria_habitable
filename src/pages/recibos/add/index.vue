<script setup>
import { ref } from 'vue'
import InvoiceEditable from '@/views/pages/invoice/InvoiceEditable.vue'
import InvoicePreviewDrawer from '@/views/pages/invoice/InvoiceSendInvoiceDrawer.vue'
import { VAlert } from 'vuetify/components'

const invoiceData = ref({
  invoice: {
    id: 5037,
    issuedDate: '',
    service: '',
    total: 0,
    avatar: '',
    invoiceStatus: '',
    dueDate: '',
    balance: 0,
    client: {
      address: '112, Lorem Ipsum, Florida',
      company: 'Greeva Inc',
      companyEmail: 'johndoe@greeva.com',
      contact: '+1 123 3452 12',
      country: 'USA',
      name: 'John Doe',
    },
  },
  paymentDetails: {
    totalDue: '$12,110.55',
    bankName: 'American Bank',
    country: 'United States',
    iban: 'ETD95476213',
    swiftCode: 'BR91905',
  },
  purchasedProducts: [],
  note: '',
  paymentMethod: '',
  salesperson: '',
  thanksNote: '',
})
const invoiceEditableRef = ref(null) // ref para el componente
const isPreviewOpen = ref(false)
const previewDrawerRef = ref(null) // ref al componente de previsualización
const warning = ref(null);
const error_exists = ref(null)
const success_exists = ref(null)

const addProduct = product => {
  invoiceData.value.purchasedProducts.push(product)
}

const removeProduct = index => {
  invoiceData.value.purchasedProducts.splice(index, 1)
}

const printInvoice = () => {
  const section = previewDrawerRef.value?.printSection

  if (!section) return alert('No se encontró la sección de impresión')

  const originalContent = document.body.innerHTML
  const printContent = section.innerHTML

  // Reemplaza el contenido del body por el que deseas imprimir
  document.body.innerHTML = printContent

  // Imprime y luego restaura
  window.print()
  document.body.innerHTML = originalContent
  // window.location.reload() // recarga para restaurar estado de Vue
}

const guardarRecibo = async () => {
  // console.log('invocando guardar recibo', invoiceData.value.purchasedProducts);

  // Validación rápida
  if (!invoiceData.value.invoice.client?.id) {
    return warning.value = 'Debes seleccionar un cliente.'
  }

  if (!invoiceData.value.invoice.issuedDate) {
    return warning.value = 'Debes seleccionar una fecha.'
  }

  if (!invoiceData.value.purchasedProducts.length) {
    return warning.value = 'Agrega al menos un item al recibo.'
  }

  for (const [i, product] of invoiceData.value.purchasedProducts.entries()) {
    if (!product.title || product.precio == null || product.cantidad == null) {
      return warning.value = `Falta información en el ítem #${i + 1}`
    }
  }

  // Si pasa validación...
  isSaving.value = true // activamos loading 
  const payload = {
    cliente_id: invoiceData.value.invoice.client.id,
    inmueble_id: invoiceData.value.invoice.property?.id || null,
    fecha: invoiceData.value.invoice.issuedDate,
    nota: invoiceData.value.note,
    nota_agradecimiento: invoiceData.value.thanksNote,
    productos: invoiceData.value.purchasedProducts.map(product => ({
      producto_id: product.item_id,
      title: product.title,
      precio: product.precio,
      cantidad: product.cantidad,
      tipo: product.tipo,
      descuento: product.descuento || 0,
      porcentaje: product.porcentaje || 0,
    })),
  }

  try {
    const resp = await $api('/recibos', {
      method: 'POST',
      body: payload,
    })

    success_exists.value = 'Recibo guardado correctamente 🚀'
    setTimeout(() => {
      router.push('/recibos') // Redirige a la lista de recibos
    }, 2000)

  } catch (error) {
    console.error('Error al guardar recibo', error)
    warning.value = 'Error al guardar el recibo. Verifica los campos.'
  } finally {
    isSaving.value = false // desactivamos loading
  }
}
const isSaving = ref(false)

const getUltimoRecibo = async () => {
  try {
    const ultimo = await $api('/recibos/ultimo', { method: 'GET' })

    invoiceData.value.invoice.id = ultimo.ultimo_id + 1
  } catch (error) {
    console.error('No se pudo obtener el último recibo:', error)
  }
}

onMounted(() => {
  getUltimoRecibo()
})

</script>

<template>
  <VRow>
    <VCol cols="12" md="9">
      <InvoiceEditable :data="invoiceData" @push="addProduct" @remove="removeProduct"
        @update:data="invoiceData = $event" />
    </VCol>

    <VCol cols="12" md="3">
      <VCard class="mb-6">
        <VCardText>
          <VBtn block :loading="isSaving" prepend-icon="ri-send-plane-line" class="mb-4" @click="guardarRecibo">
            GUARDAR
          </VBtn>

          <!-- <VBtn block variant="outlined" color="secondary" class="mb-4" @click="printInvoice">
            Imprimir
          </VBtn> -->

          <VBtn block color="secondary" variant="outlined" class="mb-4" @click="isPreviewOpen = true">
            Previsualizar
          </VBtn>
        </VCardText>

        <VAlert type="warning" v-if="warning" class="mt-3"> <strong>{{ warning }}</strong> </VAlert>
        <VAlert type="success" v-if="success_exists" class="mt-3">
          <strong>{{ success_exists }}</strong>
        </VAlert>
      </VCard>
    </VCol>
  </VRow>

  <!-- Drawer con la vista previa -->
  <InvoicePreviewDrawer ref="previewDrawerRef" :is-drawer-open="isPreviewOpen" :invoice-data="invoiceData"
    @update:isDrawerOpen="isPreviewOpen = $event" />
</template>
