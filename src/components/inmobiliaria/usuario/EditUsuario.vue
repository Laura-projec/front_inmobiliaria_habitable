<script setup>
import UserBioPanel from '@/views/pages/user/UserBioPanel.vue';
import UserTabOverview from '@/views/pages/user/UserTabOverview.vue';
import UserTabSecurity from '@/views/pages/user/UserTabSecurity.vue';
import { defineProps } from 'vue';

const userTab = ref(0); // Asegúrate de que tenga un valor inicial
const isEditMode = ref(false);  // Controla si estamos en modo edición 
const tabs = [
    {
        icon: 'ri-lock-2-line',
        title: 'Seguridad',
    },
    {
        icon: 'ri-group-line',
        title: 'Editar',
    },
    {
        icon: 'ri-notification-4-line',
        title: 'Notificaciones',
    }
]

// Detecta cambios en userTab
watch(userTab, (newVal) => {
    if (newVal === 0) {
        toggleSecurityMode();
    } else if (newVal === 1) {
        isEditMode.value = true;
    }
});

// Definir las propiedades del componente
const props = defineProps({
    idUsuario: {
        type: String,
        required: true
    },
    userSelected: {
        type: Object,
        required: true
    },
    roles:{
        roles: Array,
    }
});

const id = props.idUsuario;  // Usar el id en el componente
const userData = props.userSelected;  // Acceso directo al objeto de usuario

// Función para activar el modo de edición
const toggleEditMode = () => { 
    userTab.value = 1;
    isEditMode.value = true; 
};
// Función para activar la pestaña de seguridad
const toggleSecurityMode = () => { 
    userTab.value = 0; 
};


</script>
<template>

    <VRow v-if="userData">
        <VCol cols="12" md="5" lg="4">
            <UserBioPanel :user-data="userData" @edit="toggleEditMode" />
        </VCol>

        <VCol cols="12" md="7" lg="8">
            <VTabs v-model="userTab" class="v-tabs-pill">
                <VTab v-for="tab in tabs" :key="tab.icon">
                    <VIcon start :icon="tab.icon" />
                    <span>{{ tab.title }}</span>
                </VTab>
            </VTabs>

            <VWindow v-model="userTab" class="mt-6 disable-tab-transition">
                <VWindowItem :value="0">
                    <UserTabSecurity :user-data="userData" />
                </VWindowItem>
                <VWindowItem :value="1">
                    <UserTabOverview :user-data="userData" :roles="roles"/>
                </VWindowItem>
            </VWindow>
        </VCol>
    </VRow>

    <div v-else>
        <VAlert type="error" variant="tonal">
            El usuario con el ID {{ id }} no fue encontrado!
        </VAlert>
    </div>
</template>