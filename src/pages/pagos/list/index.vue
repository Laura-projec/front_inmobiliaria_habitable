<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/views/js/userStore'
import { VCardText } from 'vuetify/components'

const isLoading = ref(false)
const warning = ref(null)
const pagos = ref([])
const searchQuery = ref('')

const router = useRouter()

// 🔐 User
const userStore = useUserStore()
const user = computed(() => userStore.user)
const userRole = computed(() => user.value?.role?.name || '')
const userId = computed(() => user.value?.id)
const userInmuebleId = computed(() => user.value?.inmueble_id || null)

// 🧠 Filtro local de pagos si se está buscando por texto
const filteredPagos = computed(() => {
    if (!searchQuery.value) return pagos.value
    return pagos.value.filter(p =>
        (p.descripcion || '').toLowerCase().includes(searchQuery.value.toLowerCase())
    )
})

// 📡 Cargar pagos
const getPagos = async () => {
    isLoading.value = true
    warning.value = null

    try {
        let endpoint = '/pagos'
        if (userRole.value !== 'Administrador' && userRole.value !== 'Super Admin') {
            endpoint = `/pagos?user_id=${userId.value}`
        }
        const resp = await $api(endpoint, { method: 'GET' })
        console.log(`Pagos obtenidos:`, resp);
        
        pagos.value = resp.pagos || resp || []
    } catch (error) {
        console.error('Error al obtener los pagos:', error)
        warning.value = 'Hubo un error al cargar los pagos.'
    } finally {
        isLoading.value = false
    }
}

onMounted(getPagos)

// 📄 Encabezados para la tabla
const headers = [
    { title: 'Inmueble', key: 'inmueble_direccion' },
    { title: 'Concepto', key: 'item_nombre' },
    { title: 'Valor', key: 'valor' },
    { title: 'Estado', key: 'estado' },
    { title: 'Acciones', key: 'actions' },
]
</script>

<template>
    <VRow>
        <VCol cols="12">
            <VCard title="Listado de Pagos">
                <VCardText class="d-flex flex-wrap gap-4">

                <div class="d-flex align-center">
                    <VTextField v-model="searchQuery" placeholder="Buscar por descripción" style="inline-size: 200px"
                        density="compact" class="me-3" @keyup.enter="getPagos" />

                    <VBtn color="primary" prepend-icon="ri-add-line" :to="{ name: 'pago-nuevo' }">
                        Nuevo Pago
                    </VBtn>
                </div>

                <VAlert type="warning" v-if="warning" class="mb-4">
                    <strong>{{ warning }}</strong>
                </VAlert>

                <div v-if="isLoading" class="text-center my-6">
                    <VProgressCircular indeterminate color="primary" />
                </div>

                <VDataTable v-if="!isLoading" :headers="headers" :items="filteredPagos" :items-per-page="5"
                    class="text-no-wrap">
                    <!-- Acciones -->
                    <template #item.actions="{ item }">
                        <!-- <VBtn color="primary" size="small" @click="router.push(`/pagos/list/${item.id}`)">
                            Ver
                        </VBtn> -->
                    </template>
                    <!-- Estado -->
                    <template #item.estado="{ item }">
                        <VChip :color="item.aprobacion === 'true' ? 'success' : 'warning'" size="small">
                            {{ item.aprobacion === true || item.aprobacion === 'true' ? 'Aprobado' : 'Pendiente' }}
                        </VChip>
                    </template>
                    <!-- Valor -->
                    <template #item.valor="{ item }">
                        {{ new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(item.valor) }}
                    </template>
                </VDataTable>

                <p v-if="!isLoading && !filteredPagos.length" class="text-grey text-center mt-6">
                    No hay pagos registrados.
                </p>
            </VCardText>
            </VCard>
        </VCol>
    </VRow>
</template>