<script setup>
import { useWindowScroll } from '@vueuse/core'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { useDisplay } from 'vuetify'
import { themeConfig } from '@themeConfig'

const props = defineProps({
  activeId: {
    type: String,
    required: false,
  },
  navbarInitialOpacity: {
    type: Number,
    required: false,
    default: 0.64,
  },
})

const display = useDisplay()
const route = useRoute()
const router = useRouter()
const { y } = useWindowScroll()
const sidebar = ref(false)

watch(() => display, () => {
  return display.mdAndUp ? sidebar.value = false : sidebar.value
}, { deep: true })

// Menú sin "Tus propiedades"
const menuItems = [
  { label: 'Inicio', hash: '#inicio' },
  { label: 'Inmuebles disponibles', external: true, url: 'https://inmobiliariahabitable.com/' },
  { label: 'Útiles', hash: '#features' },
  { label: 'Opiniones', hash: '#opiniones' },
  { label: 'Quienes Somos', hash: '#quienes-somos' },
  { label: 'Contáctenos', hash: '#contactenos' },
]

// Botón para login
function goToLogin() {
  router.push({ name: 'login' })
}

// Función para manejar el click del menú
function handleMenuClick(item) {
  sidebar.value = false
  if (item.external) {
    window.open(item.url, '_blank')
    return
  }
  if (route.name === 'landing') {
    if (item.hash) {
      const el = document.querySelector(item.hash)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  } else {
    router.push({ name: 'landing', hash: item.hash })
  }
}
</script>

<template>
  <!-- 👉 Navigation drawer for mobile devices -->
  <VNavigationDrawer v-model="sidebar" disable-resize-watcher>
    <PerfectScrollbar :options="{ wheelPropagation: false }" class="h-100">
      <div>
        <div class="d-flex flex-column gap-y-4 pa-4">
          <button
            v-for="(item, index) in menuItems"
            :key="index"
            class="nav-link font-weight-medium"
            :class="[props.activeId?.toLocaleLowerCase().replace('-', ' ') === item.label.toLocaleLowerCase() ? 'active-link' : '']"
            @click="handleMenuClick(item)"
            style="background:none;border:none;text-align:left;padding:0;width:100%;"
          >
            {{ item.label }}
          </button>
          <!-- Botón destacado para login -->
          <VBtn
            color="primary"
            class="mt-4"
            block
            @click="goToLogin"
          >
            Tus propiedades
          </VBtn>
        </div>
      </div>
      <VIcon id="navigation-drawer-close-btn" icon="ri-close-line" size="20" @click="sidebar = !sidebar" />
    </PerfectScrollbar>
  </VNavigationDrawer>

  <!-- 👉 Navbar for desktop devices -->
  <div class="front-page-navbar">
    <VAppBar :class="y > 20 ? 'front-page-navbar-box-shadow' : ''"
      :border="y < 20 ? '1px solid rgba(var(--v-theme-surface), 0.78)' : 'none'" elevation="0" class="rounded-b-xl"
      :style="y > 20 ? '' : `background-color: rgba(var(--v-theme-surface),${props.navbarInitialOpacity})`"
      height="100">

      <VAppBarNavIcon :class="$vuetify.display.mdAndUp ? 'd-none' : 'd-inline-block'" class="ms-0 me-1"
        color="high-emphasis" @click="() => sidebar = !sidebar" />

      <div class="d-flex align-center">
        <VAppBarTitle class="me-3 me-sm-6">
          <RouterLink to="/" class="d-flex gap-x-4" :class="$vuetify.display.mdAndUp ? 'd-none' : 'd-block'">
            <div class="d-flex gap-x-3 align-center">
              <div class="nav-title text-truncate"
                :class="[$vuetify.display.lgAndUp ? 'd-block' : 'd-none', $vuetify.display.mdAndUp ? 'd-none' : 'd-block']">
                {{ themeConfig.app.title }}
              </div>
            </div>
          </RouterLink>
        </VAppBarTitle>

        <!-- landing page sections for desktop -->
        <div :class="$vuetify.display.mdAndUp ? 'd-flex' : 'd-none'"
          class="text-base justify-center align-center gap-x-2">
          <button
            v-for="(item, index) in menuItems"
            :key="index"
            class="nav-link font-weight-medium"
            :class="[props.activeId?.toLocaleLowerCase().replace('-', ' ') === item.label.toLocaleLowerCase() ? 'active-link' : '']"
            @click="handleMenuClick(item)"
            style="background:none;border:none;text-align:left;padding:0;"
          >
            {{ item.label }}
          </button>
          <!-- Botón destacado para login -->
          <VBtn
            color="primary"
            class="ms-4"
            @click="goToLogin"
          >
            Tus propiedades
          </VBtn>
        </div>
      </div>
    </VAppBar>
  </div>
</template>


<style lang="scss" scoped>
.front-page-navbar-box-shadow {
  /* stylelint-disable-next-line max-line-length */
  box-shadow: 0 0px 0px 0px rgba(var(--v-shadow-key-umbra-color), 42%) !important;
}

.nav-menu {
  display: flex;
  justify-content: center;
  /* Centra los elementos */
  gap: 3rem;
  /* Espaciado entre los elementos */
}

.nav-title {
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity)) !important;
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.75rem;
  text-transform: capitalize;
}

.nav-link {
  padding-inline: 0.625rem;

  &:not(:hover) {
    color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
  }
}

@media (min-width: 1920px) {
  .front-page-navbar {
    .v-toolbar {
      max-inline-size: calc(1440px - 32px);
    }
  }
}

@media (min-width: 1280px) and (max-width: 1919px) {
  .front-page-navbar {
    .v-toolbar {
      max-inline-size: calc(1200px - 32px);
    }
  }
}

@media (min-width: 960px) and (max-width: 1279px) {
  .front-page-navbar {
    .v-toolbar {
      max-inline-size: calc(900px - 32px);
    }
  }

  .nav-menu {
    gap: 2rem;
  }
}

@media (min-width: 600px) and (max-width: 959px) {
  .front-page-navbar {
    .v-toolbar {
      max-inline-size: calc(100% - 62px);
    }
  }
}

@media (max-width: 600px) {
  .front-page-navbar {
    .v-toolbar {
      max-inline-size: calc(100% - 32px);
    }
  }
}

.nav-item-img {
  border: 10px solid rgb(var(--v-theme-background));
  border-radius: 10px;
}

.active-link {
  color: rgb(var(--v-theme-primary)) !important;
}

.mega-menu-item {
  &:not(:hover) {
    color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
  }
}
</style>

<style lang="scss">
@use "@layouts/styles/mixins" as layoutMixins;

.mega-menu {
  position: fixed !important;
  inset-block-start: 4.1rem;
  inset-inline-start: 50%;
  transform: translateX(-50%);

  @include layoutMixins.rtl {
    transform: translateX(50%);
  }
}

.front-page-navbar {
  width: 100vw !important;
  max-width: 100% !important;

  .v-toolbar {
    inset-inline: 0 !important;
    margin-inline: auto !important;
    display: flex;
    justify-content: center;
    /* Alinea los elementos horizontalmente */
    align-items: center;
    /* Alinea los elementos verticalmente */
    padding-inline: 2rem !important;
  }

  .v-toolbar__content {
    display: flex;
    justify-content: center;
    /* Alinea el contenido de la barra de navegación */
    gap: 2rem;
    /* Espaciado entre los elementos */
    width: 100%;
  }
}


#navigation-drawer-close-btn {
  position: absolute;
  cursor: pointer;
  inset-block-start: 0.5rem;
  inset-inline-end: 1rem;
}

@media (max-width: 600px) {
  .front-page-navbar {
    .v-toolbar__content {
      padding-inline: 0.75rem !important;
    }
  }
}

@media (min-width: 600px) and (max-width: 959px) {
  .front-page-navbar {
    .v-toolbar__content {
      padding-inline: 1rem !important;
    }
  }
}

// .logo-container {
//   position: absolute;
//   top: -10px;
//   /* Ajusta según el tamaño del logo */
//   left: 50%;
//   transform: translateX(-50%);
//   z-index: 10;
//   /* Para que quede encima del menú */
// }

// .front-page-navbar .v-toolbar__content {
//   padding-top: 30px;
//   /* Ajusta según el tamaño del logo */
// }</style>
