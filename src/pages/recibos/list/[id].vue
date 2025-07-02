<script setup>
import { ref, onMounted } from 'vue'
import InvoicePreview from '@/views/pages/invoice/InvoicePreview.vue'
import { useRoute } from 'vue-router'

const recibo = ref(null)
const invoicePreviewRef = ref(null)

const route = useRoute()

onMounted(async () => {
  const resp = await $api(`/recibos/${route.params.id}`)
  recibo.value = resp.data
})
</script>

<template>
<!-- <InvoicePreview v-if="recibo" :data="recibo" ref="invoicePreviewRef" /> -->
<InvoicePreview ref="invoicePreviewRef" />
</template>
