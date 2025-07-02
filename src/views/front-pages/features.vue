<script setup>
import sectionTitleIcon from '@images/pages/section-title-icon.png'
import GoogleDocs from '@images/svg/google-docs.svg'
import LaptopCharging from '@images/svg/laptop-charging.svg'
import TransitionUp from '@images/svg/transition-up.svg'

const featuresData = [
  {
    title: 'Actualizaciones continuas',
    desc: 'Mantente al día con las últimas propiedades, precios y novedades del mercado.',
    img: TransitionUp,
  },
  {
    title: 'Con una documentación completa',
    desc: 'Garantizando transparencia y confianza en cada transacción.',
    img: GoogleDocs,
  },
  {
    title: 'Excelente soporte',
    desc: 'Nuestro equipo de soporte está siempre disponible para ayudarte.',
    img: LaptopCharging,
  },
]
// Nuestro sistema ofrece actualizaciones constantes para que tengas acceso a la información más reciente en tiempo real.
// Cada propiedad viene documentada y disponible para ti en un solo lugar, g
// Ya sea para resolver dudas o asistirte en la gestión de propiedades, estamos aquí para asegurarnos de que tu experiencia sea lo más fácil y eficiente posible
</script>

<template>
  <VContainer id="features">
    <div class="feature-cards">
      <div class="headers d-flex justify-center flex-column align-center mb-6">
        <div class="d-flex gap-x-3 mb-6">
          <img
            :src="sectionTitleIcon"
            alt="section title icon"
            height="24"
            width="25"
          >
          <div class="text-body-1 text-high-emphasis font-weight-medium">
            Características Útiles
          </div>
        </div>

        <div class="mb-2 text-center">
          <span
            class="text-h4 d-inline-block font-weight-bold"
            style="line-height: 2rem;"
          >
          Todo lo que necesitas para gestionar tu negocio inmobiliario
          </span> 
        </div>

        <p class="text-body-1 font-weight-medium text-center">
          No es solo una plataforma de gestión de propiedades. Con nosotros, tendrás todas las herramientas necesarias para llevar a cabo tu proyecto inmobiliario desde la A hasta la Z. ¡Estás a un solo clic de transformar tu manera de gestionar inmuebles!
Empieza Hoy Mismo.
        </p>
      </div>

      <VRow>
        <VCol
          v-for="(data, index) in featuresData"
          :key="index"
          cols="12"
          sm="6"
          md="4"
        >
          <div class="feature d-flex flex-column gap-y-2 align-center justify-center mt-2">
            <VAvatar
              variant="outlined"
              size="82"
              color="primary"
              class="mb-2"
            >
              <Component :is="data.img" />
            </VAvatar>

            <h5 class="text-h5">
              {{ data.title }}
            </h5>
            <p
              class="text-center text-medium-emphasis"
              style="max-inline-size: 360px;"
            >
              {{ data.desc }}
            </p>
          </div>
        </VCol>
      </VRow>
    </div>
  </VContainer>
</template>

<style lang="scss" scoped>
.feature-cards {
  // margin-block-end: 4.25rem;
  margin-top: -100px;
}

#features {
  padding-block-start: 9rem;
}

@media (max-width: 960px) {
  #features {
    padding-block-start: 6rem;
  }
}

@media (max-width: 600px) {
  #features {
    padding-block-start: 2rem;
  }
}
</style>

<style lang="scss" scoped>
.feature {
  .v-avatar {
    &.v-avatar--variant-outlined {
      border: 2px solid rgba(var(--v-theme-primary), 0.32);

      &:hover {
        background: rgba(var(--v-theme-primary), 0.16);
        cursor: pointer;
      }
    }
  }
}
</style>
