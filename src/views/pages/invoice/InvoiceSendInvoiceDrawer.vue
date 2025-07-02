<script setup>
import { ref } from 'vue'
import InvoicePreview from './InvoicePreview.vue'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

const props = defineProps({
  isDrawerOpen: Boolean,
  invoiceData: Object,
})

const emit = defineEmits(['update:isDrawerOpen'])

// Maneja el cierre del drawer
const handleDrawerModelValueUpdate = val => {
  emit('update:isDrawerOpen', val)
}

const invoicePreviewRef = ref(null)
defineExpose({
  printSection: computed(() => invoicePreviewRef.value?.printSection?.$el ?? invoicePreviewRef.value?.printSection),
})
</script>

<template>
  <VNavigationDrawer
    temporary
    location="end"
    :width="800"
    :model-value="props.isDrawerOpen"
    class="scrollable-content"
    @update:model-value="handleDrawerModelValueUpdate"
  >
    <AppDrawerHeaderSection
      title="Previsualizar Recibo"
      @cancel="$emit('update:isDrawerOpen', false)"
    />

    <VDivider />

    <PerfectScrollbar :options="{ wheelPropagation: false }" class="pa-4">
      <!-- 👇 Aquí pasamos el ref -->
      <InvoicePreview ref="invoicePreviewRef" :data="props.invoiceData" />
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>
