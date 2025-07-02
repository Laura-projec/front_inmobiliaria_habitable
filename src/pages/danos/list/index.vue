<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/views/js/userStore'
import { VCardText } from 'vuetify/components'

const isLoading = ref(false)
const warning = ref(null)
const danos = ref([])
const searchQuery = ref('')

const router = useRouter()

// 🔐 User
const userStore = useUserStore()
const user = computed(() => userStore.user)
const userRole = computed(() => user.value?.role?.name || '')
const userInmuebleId = computed(() => user.value?.inmueble_id || null)

// 🧠 Filtro local de daños si se está buscando por texto
const filteredDanos = computed(() => {
    if (!searchQuery.value) return danos.value
    return danos.value.filter(d =>
        d.tipo?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
})

// 📡 Cargar daños
const getDanos = async () => {
    isLoading.value = true
    warning.value = null

    try {
        const endpoint =
            userRole.value === 'super-admin'
                ? '/damages'
                : `/damages?inmueble_id=${userInmuebleId.value}`

        const resp = await $api(endpoint, { method: 'GET' })
        danos.value = resp || []
    } catch (error) {
        console.error('Error al obtener los daños:', error)
        warning.value = 'Hubo un error al cargar los daños.'
    } finally {
        isLoading.value = false
    }
}

onMounted(getDanos)

// 📄 Encabezados para la tabla
const headers = [
    // { title: 'Tipo de Daño', key: 'tipo' },
    { title: 'Inmueble ID', key: 'inmueble.direccion' },
    { title: 'Precio', key: 'price' },
    { title: 'Acciones', key: 'actions' },
]
</script>

<template>
    <VRow>
        <VCol cols="12">
            <VCard title="Listado de Daños">
                <VCardText class="d-flex flex-wrap gap-4">

                <div class="d-flex align-center">
                    <VTextField v-model="searchQuery" placeholder="Buscar por tipo de daño" style="inline-size: 200px"
                        density="compact" class="me-3" @keyup.enter="getDanos" />

                    <VBtn color="primary" prepend-icon="ri-add-line" :to="{ name: 'agregar-danos' }">
                        Crear Daño
                    </VBtn>
                </div>

                <VAlert type="warning" v-if="warning" class="mb-4">
                    <strong>{{ warning }}</strong>
                </VAlert>

                <div v-if="isLoading" class="text-center my-6">
                    <VProgressCircular indeterminate color="primary" />
                </div>

                <VDataTable v-if="!isLoading" :headers="headers" :items="filteredDanos" :items-per-page="5"
                    class="text-no-wrap">
                    <!-- Acciones -->
                    <template #item.actions="{ item }">
                        <VBtn color="primary" size="small" @click="router.push(`/danos/edit/${item.id}`)">
                            Editar
                        </VBtn>
                    </template>
                </VDataTable>

                <p v-if="!isLoading && !filteredDanos.length" class="text-grey text-center mt-6">
                    No hay daños registrados.
                </p>
            </VCardText>
            </VCard>
        </VCol>
    </VRow>
</template>