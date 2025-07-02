<script setup>
import { RouterLink, useRouter } from 'vue-router';
import { VCardText } from 'vuetify/components';
import { ref } from 'vue'
import { onMounted } from 'vue'
import { VCard, VDataTable, VTextField, VSpacer } from 'vuetify/components';

const searchQuery = ref(null);
const isListUserVisible = ref(true);
const inmuebleList = ref([])
const route = useRoute()
const router = useRouter()


const defaultItem = ref({
    id: '',
    propietario: '',
    matricula: '',
    estado: '',
    stock: '',
    actions: '',
})

const headers = [
    { title: 'Id', key: 'id' },
    { title: 'Propietario', key: 'userFullName' },
    { title: 'Matrícula', key: 'matricula' },
    { title: 'Estado', key: 'estado' },
    { title: 'En Stock', key: 'stock' },
    { title: 'Acciones', key: 'actions' },
]

const getInmuebles = async () => {
    const resp = await $api('/alquiler?search=', + (searchQuery.value ? searchQuery.value : ''), {
        method: 'GET',
        onResponseError(response) {
            console.log('response.response', response.response);
        }
    })

    // Asignamos los datos procesados
    inmuebleList.value = resp.inmuebles.map(inmueble => ({
        ...inmueble,
        userFullName: inmueble.user ? `${inmueble.user.name} ${inmueble.user.surname}` : 'Sin propietario',
    }));

}

onMounted(() => {
    getInmuebles()
})


// Esta función se llama cuando se hace clic en el botón de editar
const editItem = (item) => {
    router.push(`/addInmueble/${item.id}`)
};

const deleteItem = (item) => {
    // try {
    //     await $api(`/inmuebles/${item.id}`, { method: 'DELETE' })
    //     console.log('Inmueble eliminado correctamente')
    //     getInmuebles() // Recargar la lista de inmuebles
    // } catch (error) {
    //     console.error('Error al eliminar el inmueble:', error)
    // }
}


definePage({
    meta: {
        permissions: 'list_inmuebles'
    },
})
</script>

<template>
    <VCard v-if="isListUserVisible" title="Inmuebles Alquiler">
        <VCardText class="d-flex flex-wrap gap-4">
            <div class="d-flex align-center">
                <!-- 👉 Search  -->
                <VTextField v-model="searchQuery" placeholder="Buscar" style="inline-size: 200px;" density="compact"
                    class="me-3" @keyup.enter="getInmuebles" />
            </div>

            <VSpacer />
            <VDataTable :headers="headers" :items="inmuebleList" :items-per-page="5" class="text-no-wrap">
                <template #item.imagen="{ item }">
                    <div class="d-flex align-center">
                        <div class="d-flex flex-column ms-3">
                            <span class="d-block font-weight-medium text-high-emphasis text-truncate">
                                {{ item.id }}</span>
                            <small>{{ item.post }}</small>
                        </div>
                    </div>
                </template>
                <!-- Actions -->
                <template #item.actions="{ item }">
                    <div class="d-flex gap-1">
                        <IconBtn size="small" @click="editItem(item)">
                            <VIcon icon="ri-pencil-line" />
                        </IconBtn>
                        <IconBtn size="small" @click="deleteItem(item)">
                            <VIcon icon="ri-delete-bin-line" />
                        </IconBtn>
                    </div>
                </template>
            </VDataTable>
        </VCardText>
    </VCard>
</template>