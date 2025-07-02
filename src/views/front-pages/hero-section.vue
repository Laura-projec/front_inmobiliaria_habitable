<script setup>
import { useMouse } from '@vueuse/core'
import { useTheme } from 'vuetify'
import { useGenerateImageVariant } from '@/@core/composable/useGenerateImageVariant'
import darkBg from '@images/front-pages/backgrounds/hero-bg-dark.png'
import lightBg from '@images/front-pages/backgrounds/hero-bg.png'
import heroDashboardImgDark from '@images/front-pages/landing-page/principal.jpg'
import heroDashboardImgLight from '@images/front-pages/landing-page/principal.jpg'
import heroElementsImgDark from '@images/front-pages/landing-page/hero-elements-dark.png'
import heroElementsImgLight from '@images/front-pages/landing-page/hero-elements-light.png'

const theme = useTheme()
const isDark = ref(theme.name)

const heroBgUrl = computed(() => {
  if (isDark.value === 'dark')
    return darkBg
  else
    return lightBg
})

const heroElementsImg = useGenerateImageVariant(heroElementsImgLight, heroElementsImgDark)
const heroDashboardImg = useGenerateImageVariant(heroDashboardImgLight, heroDashboardImgDark)
const { x, y } = useMouse({ touch: false })


</script>

<template>
  <section id="inicio" :style="{ 'background-color': 'rgb(var(--v-theme-surface))' }">
    <div id="landingHero" class="landing-hero">
      <VContainer>
        <VRow class="align-center">
          <!-- 📌 Columna Izquierda: Textos -->
          <VCol cols="12" md="6">
            <div class="text-left">
              <!-- 📌 Nueva Imagen -->
              <div class="additional-image-container">
                <img src="@images/logo-habitable-inmobiliaria.png" alt="Imagen Destacada" class="additional-image" />
              </div>

              <!-- 📌 Texto -->
              <div class="mb-4 landing-page-title">
                <div>Tu Hogar, Tu Inversión</div>
                Nuestra Prioridad
              </div>
              <div class="text-body-1 font-weight-medium text-high-emphasis pb-8">
                <p class="mb-0">Brindamos un servicio completo para</p>
                <p class="mb-0">la venta, compra o alquiler de bienes inmuebles.</p>
              </div>
              <VBtn :to="{ name: 'front-pages-landing-page', hash: `#pricing-plan` }" size="large">
                Ver Tus Propiedades
              </VBtn>
            </div>
          </VCol>

          <!-- 📌 Columna Derecha: Imagen -->
          <VCol cols="12" md="6">
            <div class="hero-image-container">
              <img :src="heroDashboardImg" alt="Real Estate Dashboard" class="hero-image" />
            </div>
          </VCol>
        </VRow>
      </VContainer>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use "@layouts/styles/mixins" as layoutMixins;

section {
  display: block;
  // padding-block-end: 6.25rem;
}

.landing-hero {
  padding-block-start: 2rem !important;
  /* Reducir el espacio superior */
  // background-repeat: no-repeat;
  // background-size: cover;
}

.text-left {
  position: relative;
  /* Volver a la posición normal */
  z-index: 2;
  width: 100%;
  /* Ocupa todo el ancho en móviles */
  text-align: center;
  /* Centrar el texto en pantallas pequeñas */
  padding: 1rem;
}

.v-toolbar {
  margin-bottom: 0 !important;
  /* Evitar margen extra del navbar */
}

.hero-dashboard-img {
  img {
    inline-size: 85%;
  }
}

.hero-elements-img {
  position: absolute;
  inline-size: 100%;
  inset-block-start: 50%;
  inset-inline-start: 50%;
  transform: translate(-50%, -50%);

  @include layoutMixins.rtl {
    transform: translate(50%, -50%);
  }

  img {
    inline-size: 100%;
  }
}

.v-container {
  padding-top: 0 !important;

  @media (min-width: 960px) {
    margin-top: 10px;
    /* Ajustar en pantallas grandes */
  }
}

.feature-cards {
  margin-block-start: 6.25rem;
}

.landing-page-title {
  color: rgb(var(--v-theme-primary));
  font-size: 2.375rem;
  font-weight: 800;
  line-height: 2.75rem;
  justify-content: center;
}

.hero-animation-img {
  inset-block-start: 0;
  margin-block-end: -16rem;
}

.hero-image-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-height: 500px;
}

.hero-image {
  width: 100%;
  max-width: 100%;
  height: auto;
  object-fit: contain;
}

.additional-image-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem; /* Espacio entre la imagen y el texto */
}

.additional-image {
  width: 100%; /* Se adapta al contenedor */
  max-width: 300px; /* Tamaño máximo */
  height: auto; /* Mantiene la proporción */
  border-radius: 10px; /* Opcional: bordes redondeados */
}

@media (max-width: 960px) {
  .hero-animation-img {
    inset-block-start: 2rem;
    margin-block-end: -8rem;
  }
}

@media (max-width: 600px) {
  section {
    padding-block-end: 4.25rem;
  }

  .hero-animation-img {
    inset-block-start: 1rem;
    margin-block-end: -2rem;
  }

  .landing-page-title {
    font-size: 1.75rem;
    line-height: 2.25rem;
  }

  @media (min-width: 960px) {
    .hero-image {
      max-width: 50%;
      /* Reduce el tamaño de la imagen en pantallas grandes */
      max-height: 4px;
      /* Ajusta la altura */
    }

    .text-left {
      position: absolute;
      /* Solo en pantallas grandes */
      top: 50%;
      left: 10%;
      transform: translateY(-50%);
      width: 40%;
      background: rgba(255, 255, 255, 0.6);
      /* Opcional: fondo semitransparente */
      padding: 10px;
      border-radius: 10px;
    }
  }

  @media (max-width: 600px) {
    .landing-page-title {
      font-size: 1.75rem;
      line-height: 2.25rem;
    }

    .hero-image-container {
      max-width: 300px;
    }
  }
}
</style>
