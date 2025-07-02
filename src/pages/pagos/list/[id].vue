<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const pago = ref(null)
const isLoading = ref(false)
const warning = ref(null)

const getPago = async () => {
    isLoading.value = true
    warning.value = null
    try {
        const resp = await $api(`/pagos/${route.params.id}`, { method: 'GET' })
        pago.value = resp.pago || resp
    } catch (error) {
        warning.value = 'No se pudo cargar el pago.'
    } finally {
        isLoading.value = false
    }
}

onMounted(getPago)
</script>

<template>
    <div class="add-dano-bg">
        <VCard class="pa-8 add-dano-card mb-6">
            <div class="d-flex flex-wrap justify-space-between align-center mb-6">
                <h3 class="mb-0 font-weight-bold">Detalle del Pago</h3>
                <VBtn color="secondary" variant="outlined" @click="router.push('/pagos')" class="me-2">
                    Volver
                </VBtn>
            </div>

            <VAlert type="warning" v-if="warning" class="mb-4">
                <strong>{{ warning }}</strong>
            </VAlert>

            <div v-if="isLoading" class="text-center my-6">
                <VProgressCircular indeterminate color="primary" />
            </div>

            <template v-if="pago">
                <VRow dense>
                    <VCol cols="12" md="6">
                        <VTextField :value="pago.inmueble?.direccion || pago.inmueble_id" label="Inmueble" readonly
                            outlined class="mb-4" />
                    </VCol>
                    <VCol cols="12" md="6">
                        <VTextField :value="pago.item?.title || pago.item_id" label="Concepto" readonly outlined
                            class="mb-4" />
                    </VCol>
                    <VCol cols="12" md="6">
                        <VTextField :value="pago.valor" label="Valor" readonly outlined class="mb-4" />
                    </VCol>
                    <VCol cols="12" md="6">
                        <VTextField :value="pago.estado ? 'Aprobado' : 'Pendiente'" label="Estado" readonly outlined
                            class="mb-4" />
                    </VCol>
                    <VCol cols="12">
                        <VTextarea :value="pago.descripcion" label="Descripción" readonly outlined class="mb-4" />
                    </VCol>
                    <VCol cols="12" md="6">
                        <label class="mb-2 d-block">Comprobante de pago</label>
                        <div v-if="pago.ruta_imagen_pago">
                            <img :src="pago.ruta_imagen_pago" alt="Comprobante"
                                style="max-width:100%;border-radius:10px;border:1px solid #eee;" />
                        </div>
                        <div v-else class="text-grey">No hay comprobante adjunto.</div>
                    </VCol>
                </VRow>
            </template>
        </VCard>
    </div>
</template>

<style lang="scss" scoped>
.add-dano-bg {
    background: #f3f4f6;
    min-height: 100vh;
    padding: 2rem 0;
}

.add-dano-card {
    background: #fff !important;
    border-radius: 18px;
    box-shadow: 0 2px 12px 0 rgba(60, 60, 60, 0.07);
    max-width: 900px;
    margin: 0 auto;
}

.mb-4 {
    margin-bottom: 1rem !important;
}

.me-2 {
    margin-right: 0.5rem !important;
}
</style>