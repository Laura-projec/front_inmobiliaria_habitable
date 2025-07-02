<script setup>
import { VAlert, VCheckbox, VTextField } from 'vuetify/components'
import { useAuthStore } from '@/views/js/useAuthStore'
import { onMounted, ref } from 'vue'

const props = defineProps({
    isDialogVisible: {
        type: Boolean,
        required: true,
    },
    rolSelected: {
        type: Object,
        required: true,
    }
})
const emit = defineEmits(['update:isDialogVisible'])
const dialogVisibleUpdate = val => {
    emit('update:isDialogVisible', val)
}

const authStore = useAuthStore()
const role = ref(null);
const permissionsList = ref([]);
const warning = ref(null);
const error_exists = ref(null)
const success_exists = ref(null)
const role_selected = ref(null)

const addPermission = (permiso) => {
    let INDEX = permissionsList.value.findIndex((perm) => perm == permiso);
    if (INDEX != -1) {
        permissionsList.value.splice(INDEX, 1)
    } else {
        permissionsList.value.push(permiso)
    }
    console.log(permissionsList);
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
        const resp = await $api('/role/' + role_selected.value.id, {
            method: 'PATCH',
            body: data,
            onResponseError({ response }) {
                console.log(response);
                error_exists.value = response._data.error;
            }
        })
        console.log(resp);
        if (resp.message == 403) {
            warning.value = resp.message_text;
        } else {
            success_exists.value = "El rol se ha editado correctamente";
            // 🔄 Emitir evento para recargar la lista de roles en el componente padre
            emit('roleUpdated');

            setTimeout(() => {
                emit('update:isDialogVisible', false)
            }, 2000);
        }
    } catch (error) {
        console.log(error);
        error_exists.value = error;
    }
}

onMounted(() => {
    role_selected.value = props.rolSelected;
    console.log("Rol seleccionado:", role_selected.value);

    role.value = role_selected.value.name;

    // Extraer solo los valores de permisos para que coincidan con guard_name
    permissionsList.value = role_selected.value.permissions_pluck
        .flatMap(group => group.permisos.map(p => p.permiso)); // Extrae los permisos en un solo array

});




</script>

<template>
    <VDialog :model-value="props.isDialogVisible" max-width="1000px" @update:model-value="dialogVisibleUpdate">
        <VCard>
            <VCardTitle>
                <span class="headline">Editar Rol: {{ props.rolSelected.name }}</span>
            </VCardTitle>

            <VCardText>
                <VTextField label="Nombre Rol" v-model="role" placeholder="Ejemplo: Administrador" />
                <VAlert type="warning" v-if="warning" class="mt-3"><strong>{{ warning }}</strong></VAlert>
                
                <VContainer>
                    <VTable>
                        <thead>
                            <tr>
                                <th class="text-uppercase">Módulos</th>
                                <th class="text-uppercase">Permisos</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <td class="text-h6">Acceso Administrador</td>
                                <td>
                                    <div class="d-flex justify-end">
                                        <VCheckbox v-model="isSelectAll" :indeterminate="isIndeterminate" label="Seleccionar Todos" />
                                    </div>
                                </td>
                            </tr>
                        </tbody>

                        <template v-for="(item, index) in authStore.permissions" :key="index">
                            <tbody>
                                <tr>
                                    <td class="text-h6">{{ item.name }}</td>
                                    <td>
                                        <div class="d-flex flex-wrap">
                                            <VCheckbox 
                                                v-for="(permiso, index2) in item.permisos" 
                                                :key="index2"
                                                v-model="permissionsList"
                                                :label="permiso.name" 
                                                :value="permiso.permiso" @click="addPermission(permiso.permiso)"
                                            /> 
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </template>
                    </VTable>
                </VContainer>
            </VCardText>

            <VAlert type="error" v-if="error_exists" class="mt-3"><strong>En el servidor hubo un error al crear el rol</strong></VAlert>
            <VAlert type="success" v-if="success_exists" class="mt-3"><strong>{{ success_exists }}</strong></VAlert>

            <VCardActions>
                <VSpacer />
                <VBtn color="error" variant="outlined" @click="emit('update:isDialogVisible', false)">Cancelar</VBtn>
                <VBtn color="success" variant="elevated" @click="save">Editar</VBtn>
            </VCardActions>
        </VCard>
    </VDialog>
</template>