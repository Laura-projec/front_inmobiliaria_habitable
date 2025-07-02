<script setup>
import AddUsuario from '@/components/inmobiliaria/usuario/AddUsuario.vue'
import { RouterLink, useRouter } from 'vue-router';
import { VCardText } from 'vuetify/components';
import EditUsuario from '@/components/inmobiliaria/usuario/EditUsuario.vue';
import DeleteUsuarioDialog from '@/components/inmobiliaria/usuario/DeleteUsuarioDialog.vue';

const router = useRouter();
const searchQuery = ref(null);
const isListUserVisible = ref(true);
const isAddUserVisible = ref(false);
const iseEditUserVisible = ref(false);
const userList = ref([])
const roles = ref([])
const usuario_selected = ref(null);
const isDeleteUserDialogVisible = ref(false);
const usuario_selected_deleted = ref(null);


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
        title: 'Usuario',
        key: 'full_name',
    },
    {
        title: 'Rol',
        key: 'role.name',
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
        title: 'Estado',
        key: 'status',
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
    isAddUserVisible.value = true;
    isListUserVisible.value = false;
    //   router.push('/usuarios-crear');
};

const cerrarFormulario = () => {
    isAddUserVisible.value = false;
};

const getUsuarios = async () => {
    const resp = await $api('/user?search=' + (searchQuery.value ? searchQuery.value : ''), {
        method: 'GET',
        onResponseError(response) {
            if (response.response.status == 403 || response.response.status == 500) {
                console.error('Error al obtener los usuarios:', response.response._data.message);
            }
        }
    })
    userList.value = JSON.parse(JSON.stringify(resp.users.data))
    roles.value = resp.roles

}

onMounted(() => {
    // userList.value = JSON.parse(JSON.stringify(data))
    getUsuarios()
})

// Este es el manejador para el evento 'close' que viene de AddUsuario
const handleCloseForm = (isSubmitted) => {
    if (isSubmitted) {
        // Si el formulario fue enviado correctamente, recargamos la lista de usuarios
        getUsuarios();
    }
    // Cerramos el formulario
    isListUserVisible.value = true;
    isAddUserVisible.value = false;
    iseEditUserVisible.value = false;
};

// Esta función se llama cuando se hace clic en el botón de editar
const editItem = (item) => {
    isListUserVisible.value = false;
    isAddUserVisible.value = false;
    iseEditUserVisible.value = true;
    usuario_selected.value = item;
};

const deleteItem = (item) => {
    isDeleteUserDialogVisible.value = true;
    usuario_selected_deleted.value = item;
}

 
definePage({
  meta: {
    permissions:'list_usuario'
  },
})
</script>

<template>
    <VCard v-if="isListUserVisible" title="Usuarios">
        <VCardText class="d-flex flex-wrap gap-4">
            <div class="d-flex align-center">
                <!-- 👉 Search  -->
                <VTextField v-model="searchQuery" placeholder="Buscar Usuario" style="inline-size: 200px;"
                    density="compact" class="me-3" @keyup.enter="getUsuarios" />
            </div>

            <VSpacer />

            <div class="d-flex gap-x-4 align-center">
                <VBtn color="primary" prepend-icon="ri-add-line" @click="abrirmodal">
                    Agregar Usuario
                </VBtn>
            </div>
            <VDataTable :headers="headers" :items="userList" :items-per-page="5" class="text-no-wrap">
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

    <VCardText v-if="isAddUserVisible">
        <!-- Aquí mostramos el formulario de agregar usuario, solo cuando isAddUserVisible es true -->
        <div>
            <AddUsuario @close="handleCloseForm" :roles="roles" />
        </div>
    </VCardText>

    <VCardText v-if="iseEditUserVisible">
        <!-- Aquí mostramos el formulario de agregar usuario, solo cuando isAddUserVisible es true -->
        <div>
            <EditUsuario @close="handleCloseForm" :idUsuario="8" :userSelected="usuario_selected" :roles="roles"/>
        </div>
    </VCardText>
    <DeleteUsuarioDialog v-if="usuario_selected_deleted" :userSelected="usuario_selected_deleted" @userUpdated="getUsuarios"
        v-model:is-dialog-visible="isDeleteUserDialogVisible" />

</template>