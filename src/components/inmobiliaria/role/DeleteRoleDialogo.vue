<script setup>

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

const warning = ref(null);
const success_exists = ref(null);
const error_exists = ref(null);
const role_selected = ref(null);

const deleted = async () => {
    try {
        const resp = await $api('/role/' + role_selected.value.id, {
            method: 'DELETE',
            onResponseError({ response }) {
                console.log(response);
                error_exists.value = response._data.error;
            }
        })
        console.log(resp);
        if (resp.message == 403) {
            warning.value = resp.message_text;
        } else {
            success_exists.value = "El rol se ha Eliminado correctamente";
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
});
</script>

<template>
    <VDialog :model-value="props.isDialogVisible" max-width="750" @update:model-value="dialogVisibleUpdate">
        <VCard>
            <VCardTitle>
                ¿Estas seguro que deseas eliminar el Rol : {{ props.rolSelected.name }} ?
            </VCardTitle>

            <VCardActions>
                <VSpacer />

                <VBtn color="error" variant="outlined" @click="emit('update:isDialogVisible', false)">
                    Cancel
                </VBtn>

                <VBtn color="success" variant="elevated" @click="deleted()">
                    OK
                </VBtn>

                <VSpacer />
            </VCardActions>
        </VCard>
    </VDialog>
</template>
