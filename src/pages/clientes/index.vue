<script setup>
import { RouterLink, useRouter } from 'vue-router';
import { VCardText } from 'vuetify/components'; 
import EditCliente from '@/components/inmobiliaria/cliente/EditCliente.vue';
import AddCliente from '@/components/inmobiliaria/cliente/AddCliente.vue';
import DeleteClienteDialog from '@/components/inmobiliaria/cliente/DeleteClienteDialog.vue';

const router = useRouter();
const searchQuery = ref(null);
const isListClientVisible = ref(true);
const isAddClientVisible = ref(false);
const iseEditClientVisible = ref(false);
const isDeleteClientDialogVisible = ref(false);
const ClientList = ref([])
const roles = ref([])
const cliente_selected = ref(null);
const cliente_selected_deleted = ref(null);


const defaultItem = ref({
    responsiveId: '',
    id: '',
    imagen: '',
    full_name: '',
    role: '',
    tipo_documento: '',
    numero_documento: '',
    status: '',
    actions: '',
})

const headers = [
    {
        title: 'Id',
        key: 'id',
    },
    {
        title: 'Perfil',
        key: 'imagen',
    },
    {
        title: 'Cliente',
        key: 'full_name',
    }, 
    {
        title: 'Tipo Documento',
        key: 'tipo_documento',
    },
    {
        title: 'Numero Documento',
        key: 'numero_documento',
    },
    {
        title: 'Rol',
        key: 'status',
    },
    {
        title: 'Estado',
        key: 'role.name',
    },
    {
        title: 'Acciones',
        key: 'actions',
    },
]

const avatarText = value => {
    if (!value)
        return ''
    const nameArray = value.split(' ') // Dividir en palabras
    return nameArray.map(word => word.charAt(0).toUpperCase()).join('')
}
const abrirmodal = () => {
    isAddClientVisible.value = true;
    isListClientVisible.value = false;
    //   router.push('/Clientes-crear');
};

const cerrarFormulario = () => {
    isAddClientVisible.value = false;
};

const getClientes = async () => {
    const resp = await $api('/client?search=' + (searchQuery.value ? searchQuery.value : ''), {
        method: 'GET',
        onResponseError(response) {
            console.log('response.response', response.response);
        }
    }) 
    ClientList.value = JSON.parse(JSON.stringify(resp.clients.data)) 
    console.log(resp);
    
    roles.value = resp.roles
}

onMounted(() => {
    // ClientList.value = JSON.parse(JSON.stringify(data))
    getClientes()
})

// Este es el manejador para el evento 'close' que viene de AddCliente
const handleCloseForm = (isSubmitted) => {
    if (isSubmitted) {
        // Si el formulario fue enviado correctamente, recargamos la lista de Clientes
        getClientes();
    }
    // Cerramos el formulario
    isListClientVisible.value = true;
    isAddClientVisible.value = false;
    iseEditClientVisible.value = false;
};

// Esta función se llama cuando se hace clic en el botón de editar
const editItem = (item) => {
    isListClientVisible.value = false;
    isAddClientVisible.value = false;
    iseEditClientVisible.value = true;
    cliente_selected.value = item;
};

const deleteItem = (item) => {
    isDeleteClientDialogVisible.value = true;
    cliente_selected_deleted.value = item;
}

definePage({
    meta: {
        permissions: 'list_cliente'
    },
})
</script>

<template>
    <VCard v-if="isListClientVisible" title="Clientes">
        <VCardText class="d-flex flex-wrap gap-4">
            <div class="d-flex align-center">
                <!-- 👉 Search  -->
                <VTextField v-model="searchQuery" placeholder="Buscar Cliente" style="inline-size: 200px;"
                    density="compact" class="me-3" @keyup.enter="getClientes" />
            </div>

            <VSpacer />

            <div class="d-flex gap-x-4 align-center">
                <VBtn color="primary" prepend-icon="ri-add-line" @click="abrirmodal">
                    Agregar Cliente
                </VBtn>
            </div>
            <VDataTable :headers="headers" :items="ClientList" :items-per-page="5" class="text-no-wrap">
                <template #item.imagen="{ item }">
                    <div class="d-flex align-center">
                        <VAvatar size="32" :color="item.avatar ? '' : 'primary'"
                            :class="item.avatar ? '' : 'v-avatar-light-bg primary--text'"
                            :variant="!item.avatar ? 'tonal' : undefined">
                            <VImg v-if="item.avatar" :src="item.avatar" />
                            <span v-else class="text-sm">{{ avatarText(item.full_name) }}</span>
                        </VAvatar>
                        <div class="d-flex flex-column ms-3">
                            <span class="d-block font-weight-medium text-high-emphasis text-truncate">
                                {{ item.fullName }}</span>
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

    <VCardText v-if="isAddClientVisible">
        <!-- Aquí mostramos el formulario de agregar Cliente, solo cuando isAddClientVisible es true -->
        <div>
            <AddCliente @close="handleCloseForm" :roles="roles" />
        </div>
    </VCardText>

    <VCardText v-if="iseEditClientVisible">
        <!-- Aquí mostramos el formulario de agregar Cliente, solo cuando isAddClientVisible es true -->
        <div>
            <EditCliente @close="handleCloseForm" :clientSelected="cliente_selected" :roles="roles"/>
        </div>
    </VCardText>
    <DeleteClienteDialog v-if="cliente_selected_deleted" :clientSelected="cliente_selected_deleted" @clientUpdated="getClientes"
        v-model:is-dialog-visible="isDeleteClientDialogVisible" />

</template>