<script setup>
import { VAlert, VCheckbox, VTable, VTextField } from 'vuetify/components'
import { useAuthStore } from '@/views/js/useAuthStore'
import { ref } from 'vue'

const authStore = useAuthStore()
const role = ref(null);
const permissionsList = ref([]);
const warning = ref(null);
const error_exists = ref(null)
const success_exists = ref(null)
const isSelectAll = ref(false)

// Seleccionar/deseleccionar todos los permisos
watch(isSelectAll, (val) => {
    console.log('vale',val);
    
    if (val) {
        console.log('entra');
        
        permissionsList.value = authStore.permissions.flatMap(module => module.permisos.map(p => p.name))
    } else {
        permissionsList.value = []
    }
})

const props = defineProps({
    isDialogVisible: {
        type: Boolean,
        required: true,
    }
})

const emit = defineEmits(['update:isDialogVisible'])
const dialogVisibleUpdate = val => {
    emit('update:isDialogVisible', val)
}

const addPermission = (permiso) => {
    let INDEX = permissionsList.value.findIndex((perm) => perm == permiso);
    if (INDEX != -1) {
        permissionsList.value.splice(INDEX, 1)
    } else {
        permissionsList.value.push(permiso)
    }
    console.log(permissionsList);
      // Ajustar el estado de "Seleccionar Todos"
      isSelectAll.value = permissionsList.value.length === authStore.permissions.flatMap(m => m.permisos).length

}

const save = async () => {
    warning.value = null;
    if (!role.value) {
        warning.value = "Se debe llenar el nombre del rol";
        return
    }

    if (permissionsList.value.length == 0) {
        warning.value = "Se debe de seleccionar al menos un permiso";
        return
    }

    let data = {
        name: role.value,
        permissions: permissionsList.value
    }

    try {
        const resp = await $api('/role', {
            method: 'POST',
            body: data,
            onResponseError(response) {
                if (response.response.status == 403 || response.response.status == 500) {
                    error_exists.value = response.response._data.message;
                }
            }
        })

        if (resp.status == 200) {
            success_exists.value = resp.message_text;
            // 🔄 Emitir evento para recargar la lista de roles en el componente padre
            emit('roleUpdated');
        }

        setTimeout(() => {
            success_exists.value = null
            role.value = null
            permissionsList.value = []
            warning.value = null
            error_exists.value = null
            emit('update:isDialogVisible', false)
        }, 2500);

    } catch (error) {

    }
}

</script>

<template>
    <VDialog :model-value="props.isDialogVisible" max-width="1000px" @update:model-value="dialogVisibleUpdate">
        <VCard>
            <VCardTitle>
                <span class="headline">Agregar Rol</span>
            </VCardTitle>

            <VCardText>

                <VTextField label="Nombre Rol" v-model="role" placeholder="Ejmeplo: Administrador" />
                <VAlert type="warning" v-if="warning" class="mt-3"> <strong>{{ warning }}</strong> </VAlert>
                <VContainer>
                    <VTable>
                        <thead>
                            <tr>
                                <th class="text-uppercase">
                                    Modulos
                                </th>
                                <th class="text-uppercase">
                                    permisos
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <td class="text-h6">Acceso Administrador</td>
                                <td>
                                    <div class="d-flex justify-end">
                                        <VCheckbox v-model="isSelectAll" v-model:indeterminate="isIndeterminate"
                                            label="Seleccionar Todos" />
                                    </div>
                                </td>
                            </tr>
                        </tbody>

                        <template v-for="(item, index) in authStore.permissions" :key="index">
                            <tbody>
                                <tr>
                                    <td class="text-h6">
                                        {{ item.name }}
                                    </td>
                                    <td>
                                        <div class="d-flex flex-wrap">
                                            <VCheckbox v-for="(permiso, index2) in item.permisos" :key="index2"
                                                :label="permiso.name" :value="permiso.name"
                                                @click="addPermission(permiso.permiso)" /> 
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </template>
                    </VTable>
                </VContainer>
            </VCardText>
            <VAlert type="error" v-if="error_exists" class="mt-3"> <strong>En el servidor hubo un error al crear el
                    rol</strong> </VAlert>

            <VAlert type="success" v-if="success_exists" class="mt-3"> <strong>{{ success_exists }}</strong> </VAlert>

            <VCardActions>
                <VSpacer />

                <VBtn color="error" variant="outlined" @click="emit('update:isDialogVisible', false)">
                    Cancel
                </VBtn>

                <VBtn color="success" variant="elevated" @click="save">
                    Save
                </VBtn>
            </VCardActions>
        </VCard>
    </VDialog>
</template>