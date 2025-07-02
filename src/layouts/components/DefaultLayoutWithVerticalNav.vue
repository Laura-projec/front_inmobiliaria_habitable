<script setup>
import navItems from '@/navigation/vertical'
import { useConfigStore } from '@core/stores/config'
import { themeConfig } from '@themeConfig'

// Components
import Footer from '@/layouts/components/Footer.vue'
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'
import UserProfile from '@/layouts/components/UserProfile.vue'
import NavBarI18n from '@core/components/I18n.vue'

// @layouts plugin
import { VerticalNavLayout } from '@layouts'
import { onMounted } from 'vue'

// SECTION: Loading Indicator
const isFallbackStateActive = ref(false)
const refLoadingIndicator = ref(null)

watch([
  isFallbackStateActive,
  refLoadingIndicator,
], () => {
  if (isFallbackStateActive.value && refLoadingIndicator.value)
    refLoadingIndicator.value.fallbackHandle()
  if (!isFallbackStateActive.value && refLoadingIndicator.value)
    refLoadingIndicator.value.resolveHandle()
}, { immediate: true })

// !SECTION
const configStore = useConfigStore()

// ℹ️ Provide animation name for vertical nav collapse icon.
const verticalNavHeaderActionAnimationName = ref(null)

watch([
  () => configStore.isVerticalNavCollapsed,
  () => configStore.isAppRTL,
], val => {
  if (configStore.isAppRTL)
    verticalNavHeaderActionAnimationName.value = val[0] ? 'rotate-back-180' : 'rotate-180'
  else
    verticalNavHeaderActionAnimationName.value = val[0] ? 'rotate-180' : 'rotate-back-180'
}, { immediate: true })

const navItemV = ref([]);

onMounted(() => {
  let USER = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  if (USER) {
    // console.log('USER', USER);
    // lista de permisos del usuario autenticado
    let permissions = USER.permissions;

    navItems.forEach((nav) => {
      // Verificar si el usuario es super admin
      if (USER.role.name == 'super-admin') {
        navItemV.value.push(nav);
      } else {


        // Si el nav tiene permisos "all", agregamos el nav
        if (nav.permissions === "all") {
          navItemV.value.push(nav);
        }

        // Si el nav tiene "heading" (encabezado), validamos los permisos
        if (nav.heading && nav.permissions) {
          let headingP = nav.permissions.filter((permission) => {
            return permissions.includes(permission);
          });

          if (headingP.length > 0) {
            navItemV.value.push(nav);
          }
        }

        // Si el nav tiene submenús (children), filtramos los submenús según los permisos
        if (nav.children && Array.isArray(nav.children)) {
          let navT = nav;
          // Filtramos si los submenús pueden ser vistos con los permisos autenticados
          let newChildren = nav.children.filter((subnav) => {
            // Verificamos si el submenú tiene un permiso válido antes de compararlo
            return subnav.permissions && permissions.includes(subnav.permissions);
          });

          navT.children = newChildren;
          if (newChildren.length > 0) {
            navItemV.value.push(navT);
          }
        } else {
          // Si no tiene submenús, verificamos los permisos directamente
          if (nav.permissions && permissions.includes(nav.permissions)) {
            navItemV.value.push(nav);
          }
        }
      }
    });
  }
});

</script>

<template>
  <VerticalNavLayout :nav-items="navItemV">
    <!-- 👉 navbar -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="d-flex h-100 align-center">
        <IconBtn id="vertical-nav-toggle-btn" class="ms-n2 d-lg-none" @click="toggleVerticalOverlayNavActive(true)">
          <VIcon icon="ri-menu-line" />
        </IconBtn>

        <NavbarThemeSwitcher />

        <VSpacer />

        <NavBarI18n v-if="themeConfig.app.i18n.enable && themeConfig.app.i18n.langConfig?.length"
          :languages="themeConfig.app.i18n.langConfig" />
        <UserProfile />
      </div>
    </template>

    <AppLoadingIndicator ref="refLoadingIndicator" />

    <!-- 👉 Pages -->
    <RouterView v-slot="{ Component }">
      <Suspense :timeout="0" @fallback="isFallbackStateActive = true" @resolve="isFallbackStateActive = false">
        <Component :is="Component" />
      </Suspense>
    </RouterView>

    <!-- 👉 Footer -->
    <template #footer>
      <Footer />
    </template>

    <!-- 👉 Customizer -->
    <!-- <TheCustomizer /> -->
  </VerticalNavLayout>
</template>

<style lang="scss">
@keyframes rotate-180 {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(180deg);
  }
}

@keyframes rotate-back-180 {
  from {
    transform: rotate(180deg);
  }

  to {
    transform: rotate(0deg);
  }
}

.layout-vertical-nav {
  .nav-header {
    .header-action {
      animation-duration: 0.35s;
      animation-fill-mode: forwards;
      animation-name: v-bind(verticalNavHeaderActionAnimationName);
      transform: rotate(0deg);
    }
  }
}
</style>
