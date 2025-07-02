<script setup>
import { ref, computed, defineExpose, onMounted } from 'vue'
import { themeConfig } from '@themeConfig'
import logo from './../../../assets/images/logo-habitable-inmobiliaria.png'

const localData = ref({
  invoice: {},
  purchasedProducts: [],
  note: '',
  thanksNote: '',
})

const props = defineProps({
  data: {
    type: Object,
    required: false,
    default: null,
  },
})
const sourceData = computed(() => props.data || localData.value)

const invoice = computed(() => sourceData.value.invoice)
const products = computed(() => sourceData.value.purchasedProducts || [])
const note = computed(() => sourceData.value.note)
const thanksNote = computed(() => sourceData.value.thanksNote)

const numberFormat = new Intl.NumberFormat('es-CO', {
  style: 'decimal',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const printSection = ref(null)

defineExpose({ printSection })

const totalCreditos = computed(() =>
  products.value.reduce((acc, item) => {
    if (item.tipo === 'credito') {
      return acc + (Number(item.precio || 0) * Number(item.cantidad || 1))
    }
    return acc
  }, 0)
)

const totalDebitos = computed(() =>
  products.value.reduce((acc, item) => {
    if (item.tipo === 'debito') {
      return acc + (Number(item.precio || 0) * Number(item.cantidad || 1))
    }
    return acc
  }, 0)
)

const totalNeto = computed(() => totalCreditos.value - totalDebitos.value)

const route = useRoute()

onMounted(async () => {
  const reciboId = route.params.id
  const shouldPrint = route.query.imprimir === 'true'
  if (!props.data && reciboId) {
    try {
      const resp = await $api(`/recibos/${reciboId}`, { method: 'GET' })

      const recibo = resp.recibo || resp.data // ← ¡ahora sí!

      // Adaptar los datos al formato esperado
      localData.value = {
        invoice: {
          ...recibo,
          client: {
            nombre_completo: `${recibo.cliente?.name || ''} ${recibo.cliente?.surname || ''}`.trim(),
            datos_doc: `${recibo.cliente?.tipo_documento || ''} ${recibo.cliente?.numero_documento || ''}`.trim(),
            direccion: recibo.cliente?.direccion,
            celular: recibo.cliente?.celular,
            email: recibo.cliente?.email,
          },
          property: recibo.inmueble || {},
          issuedDate: recibo.fecha,
        },
        purchasedProducts: recibo.detalles?.map(det => ({
          title: det.item?.nombre || 'Producto',
          tipo: det.tipo,
          cantidad: Number(det.cantidad),
          precio: Number(det.precio_unitario),
        })) || [],
        note: recibo.nota,
        thanksNote: recibo.nota_agradecimiento,
      }

      if (shouldPrint) {
        setTimeout(() => {
          window.print()
        }, 2000)
      }
    } catch (e) {
      console.error('Error al cargar el recibo:', e)
    }
  }
})

onMounted(() => {
  window.onafterprint = () => {
    console.log('Printed');
  }
})
</script>

<template>
  <div v-if="invoice && invoice.id" ref="printSection">
    <VCard class="pa-sm-12 pa-6">
      <!-- Header -->

      <body onafterprint="console.log('Printed');"></body>
      <div class="print-header rounded bg-var-theme-background pa-6 mb-6">
        <div class="header-container">
          <!-- Left: Logo + Contacto -->
          <div class="header-left">
            <div class="logo-container">
              <!-- <div class="logo-img">
                <VNodeRenderer :nodes="themeConfig.app.logo" />
              </div> -->
              <div class="logo-img">
                <img :src="logo" alt="Logo Habitable Inmobiliaria" />
              </div>
              <h1 class="app-logo-title">{{ themeConfig.app.title }}</h1>
            </div>
            <div class="contact-info">
              <p>Armenia, Quindío</p>
              <p>(+57) 312 809 7256</p>
              <p>habitableinmobiliaria@gmail.com</p>
            </div>
          </div>

          <!-- Right: Recibo + Fecha alineados en fila -->
          <div class="invoice-info">
            <div>
              <span class="label">Recibo</span>
              <strong>#{{ invoice.id }}</strong>
            </div>
            <div>
              <span class="label">Fecha:</span>
              <span>{{ invoice.issuedDate }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Cliente e Inmueble -->
      <VRow class="mb-6">
        <VCol>
          <h5>Cliente:</h5>
          <p>{{ invoice.client?.nombre_completo }} <br>
            {{ invoice.client?.datos_doc }} <br>
            {{ invoice.client?.direccion }} <br>
            {{ invoice.client?.celular }} <br>
            {{ invoice.client?.email }} <br>
          </p>
        </VCol>
        <VCol>
          <h5>Inmueble:</h5>
          <p>{{ invoice.property?.direccion || 'No seleccionado' }}</p>
        </VCol>
      </VRow>

      <!-- Productos -->
      <VDivider class="my-4" />
      <h5 class="mb-4">Items:</h5>

      <!-- Tabla de items con columna de débitos y créditos -->
      <table class="invoice-table">
        <thead>
          <tr>
            <th class="text-start">Descripción</th>
            <th class="text-center">Cant.</th>
            <th class="text-end">Devengado</th>
            <th class="text-end">Deducidos</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in products" :key="i">
            <td>{{ item.title }}</td>
            <td class="text-center">{{ item.cantidad }}</td>
            <td class="text-end">
              <span v-if="item.tipo === 'credito'">
                ${{ numberFormat.format(item.precio * item.cantidad) }}
              </span>
            </td>
            <td class="text-end">
              <span v-if="item.tipo === 'debito'">
                ${{ numberFormat.format(item.precio * item.cantidad) }}
              </span>
            </td>

          </tr>
        </tbody>
      </table>
      <!-- Totales -->
      <div class="text-end totals mt-4">
        <p><strong>Total Devengado:</strong> ${{ numberFormat.format(totalCreditos) }}</p>
        <p><strong>Total Deducidos:</strong> ${{ numberFormat.format(totalDebitos) }}</p>
        <p><strong>Total Neto:</strong> ${{ numberFormat.format(totalNeto) }}</p>
      </div>

      <!-- Notas -->
      <VDivider class="my-4" />
      <div v-if="note">
        <h6>Nota:</h6>
        <p>{{ note }}</p>
      </div>

      <div v-if="thanksNote">
        <h6>Gracias:</h6>
        <p>{{ thanksNote }}</p>
      </div>

    </VCard>
  </div>

  <div v-else class="pa-6">
    <VAlert type="info" border="start" variant="tonal">
      Cargando recibo...
    </VAlert>
  </div>
</template>

<style scoped>
.invoice-table {
  width: 100%;
  margin-bottom: 1rem;
  border-collapse: collapse;
}

.invoice-table th,
.invoice-table td {
  border: 1px solid #ddd;
  padding: 0.75rem;
}

.invoice-table th {
  background-color: #f9f9f9;
  font-weight: 600;
}

.text-start {
  text-align: left;
}

.text-center {
  text-align: center;
}

.text-end {
  text-align: right;
}

.header-container {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 2rem;
  align-items: flex-start;
  /* ← Esto alinea los bloques en la parte superior */
}

.logo-img {
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
}

.logo-img :deep(svg),
.logo-img img {
  width: 100%;
  height: auto;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.app-logo-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.contact-info p {
  margin: 0;
  font-size: 1rem;
  color: #444;
}

.invoice-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 1rem;
  color: #444;
  margin-top: 0.5rem;
}

.info-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.label {
  font-weight: 500;
  color: #666;
  min-width: 4.5rem;
}

.totals p {
  margin: 0.25rem 0;
  font-size: 1rem;
}

@media print {
  @page {
    size: A4;
    margin: 0;
  }

  body {
    background: white !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  

  .receipt-card {
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
    border: none !important;
    background: white !important;
  }

  .full-width-header {
    width: 100% !important;
    margin: 0 !important;
    padding: 1rem !important;
    background: #f2f2f4 !important;
  }

  /* Evitar recortes */
  .receipt-card, .invoice-table, .totals {
    page-break-inside: avoid !important;
  }

  /* OCULTAR elementos no deseados */
  .v-navigation-drawer,
  .layout-navbar,
  .layout-footer,
  .v-footer,
  .v-toolbar,
  .v-avatar,
  .user-avatar,
  .user-menu,
  .app-customizer-toggler,
  img[src*="avatar"] {
    display: none !important;
  }

  /* Puedes incluso ocultar todo el layout si lo usas en Vue */
  .layout-wrapper {
    display: none !important;
  }
}

/* Header full-width separado del resto */
.print-header {
  background-color: #f2f2f4 !important;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  width: 100% !important;
  margin: 0 !important;
  padding: 1rem !important;
  box-sizing: border-box !important;
}



.contact-info {
  margin-top: 1rem !important;
}

/* Tabla con bordes */
.invoice-table th,
.invoice-table td {
  border: 1px solid black !important;
}

.invoice-table th {
  background-color: #e0e0e0 !important;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}

.invoice-table,
.text-end {
  page-break-inside: avoid;
}

[class*="avatar"],
[class*="user"],
[class*="profile"],
img[src*="avatar"],
.v-avatar {
  display: none !important;
}

.v-avatar,
.v-avatar-group,
.user-avatar,
.layout-footer,
.user-menu,
.layout-navbar,
.layout-nav,
.v-toolbar,
.v-footer {
  display: none !important;
}

/* Oculta todo lo demás */
.v-navigation-drawer,
.layout-navbar,
.layout-footer,
.layout-vertical-nav,
.app-customizer-toggler,
.layout-navbar-and-nav-container,
.product-buy-now {
  display: none !important;
}

.invoice-table td {
  vertical-align: middle;
}
</style>
