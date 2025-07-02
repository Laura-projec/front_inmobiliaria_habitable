<script setup>
import AddRoleDialogo from '@/components/inmobiliaria/role/AddRoleDialogo.vue'
import DeleteRoleDialogo from '@/components/inmobiliaria/role/DeleteRoleDialogo.vue'
import EditRoleDialogo from '@/components/inmobiliaria/role/EditRoleDialogo.vue'
import { ref } from 'vue'
import { VCard } from 'vuetify/components'

// headers
const headers = [
    {
        title: 'Id',
        key: 'id',
    },
    {
        title: 'Rol',
        key: 'name',
    },
    {
        title: 'Permisos',
        key: '',
    },
    {
        title: 'Fecha',
        key: 'created_at',
    },
    {
        title: 'Acciones',
        key: 'actions',
    },
]

const defaultItem = ref({
    responsiveId: '',
    id: '',
    name: '',
    permissions_pluck: [],
    created_at: '',
    actions: '',
})

const searchQuery = ref(null);
const role_selected = ref(null);
const role_selected_deleted = ref(null);
const isAddRoleDialogVisible = ref(false)
const isEditRoleDialogVisible = ref(false)
const isDeleteRoleDialogVisible = ref(false);
const userList = ref([])
const editedIndex = ref(-1)

const abrirmodal = () => {
    isAddRoleDialogVisible.value = true
}

const editItem = (item) => {
    isEditRoleDialogVisible.value = true;
    role_selected.value = item;
}

const deleteItem = (item) => {
    isDeleteRoleDialogVisible.value = true;
    role_selected_deleted.value = item;
}

const close = () => {
    // editDialog.value = false
    editedIndex.value = -1
    editedItem.value = { ...defaultItem.value }
}

const getRoles = async () => {
    const resp = await $api('/role?search=' + (searchQuery.value ? searchQuery.value : ''), {
        method: 'GET',
        onResponseError(response) {
            console.log('response', response);
            console.log('response.response', response.response);

        }
    })
    userList.value = JSON.parse(JSON.stringify(resp.roles))
}

onMounted(() => {
    // userList.value = JSON.parse(JSON.stringify(data))
    getRoles()
})
watch(isEditRoleDialogVisible, (event) => {
    console.log(event);
    if (event == false) {
        role_selected.value = null;
    }
})
watch(isDeleteRoleDialogVisible, (event) => {
    console.log(event);
    if (event == false) {
        role_selected_deleted.value = null;
    }
})
</script>

<template>
    <VCard title="Roles y Permisos">
        <VCardText class="d-flex flex-wrap gap-4">
            <div class="d-flex align-center">
                <!-- 👉 Search  -->
                <VTextField v-model="searchQuery" placeholder="Buscar Rol" style="inline-size: 200px;" density="compact"
                    class="me-3" @keyup.enter="getRoles" />
            </div>

            <VSpacer />

            <div class="d-flex gap-x-4 align-center">
                <VBtn color="primary" prepend-icon="ri-add-line" @click="abrirmodal">
                    Agregar Rol
                </VBtn>
            </div>

            <VDataTable :headers="headers" :items="userList" :items-per-page="5" class="text-no-wrap">

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

    <!-- Dialog editar crear -->
    <AddRoleDialogo v-model:is-dialog-visible="isAddRoleDialogVisible" @roleUpdated="getRoles"/>
    <EditRoleDialogo v-if="role_selected" :rolSelected="role_selected"
        v-model:is-dialog-visible="isEditRoleDialogVisible" @roleUpdated="getRoles" />
    <DeleteRoleDialogo v-if="role_selected_deleted" :rolSelected="role_selected_deleted" @roleUpdated="getRoles"
        v-model:is-dialog-visible="isDeleteRoleDialogVisible" />


</template>
