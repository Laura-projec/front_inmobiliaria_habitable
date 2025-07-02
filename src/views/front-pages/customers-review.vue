<script setup>
import { register } from 'swiper/element/bundle'
import { useGenerateImageVariant } from '@/@core/composable/useGenerateImageVariant'
import logo1 from '@images/front-pages/branding/logo-1.png'
import logo2 from '@images/front-pages/branding/logo-2.png'
import sectionTitleIcon from '@images/pages/section-title-icon.png'
import { ofetch } from 'ofetch'

register()

// Definir una referencia reactiva para almacenar los comentarios
const reviewData = ref([]);

// Función para obtener los comentarios desde la API usando fetch
const fetchReviews = async () => {
  try {
    let baseURL = import.meta.env.VITE_API_BASE_URL
    // Realizar la petición GET usando fetch
    const response = await fetch(baseURL + '/reviews'); // Reemplaza PLACE_ID con un id válido 
    if (!response.ok) {
      throw new Error('No se pudieron obtener los comentarios');
    }

    const data = await response.json(); // Parsear la respuesta JSON
    // Asignar los datos de la respuesta a reviewData
    reviewData.value = data.map((review) => ({
      img: review.profile_photo_url, // URL de la foto del perfil del autor
      desc: review.text, // Descripción del comentario
      rating: review.rating, // Calificación del comentario
      name: review.author_name, // Nombre del autor
      position: '', // Puedes agregar una propiedad de puesto si se encuentra en la respuesta o si la deseas estática
    }));
  } catch (error) {
    console.error('Error al obtener los comentarios:', error);
  }
};

// Ejecutar la función de obtener comentarios cuando el componente se monte
onMounted(() => {
  fetchReviews();
});
</script>

<template>
  <div class="customer-reviews">
    <!-- 👉 Headers  -->
    <div class="headers d-flex justify-center flex-column align-center mb-8">
      <div class="d-flex gap-x-3 mb-6">
        <img :src="sectionTitleIcon" alt="section title icon" height="24" width="25">
        <div class="text-body-1 text-high-emphasis font-weight-medium">
          OPINIONES DE CLIENTES
        </div>
      </div>

      <div class="mb-2 text-center">
        <span class="text-h4 d-inline-block font-weight-bold" style="line-height: 2rem;">
          Historias de éxito
        </span> <span class="text-h5 d-inline-block">de clientes</span>
      </div>

      <p class="text-body-1 font-weight-medium text-center">
        Vea lo que nuestros clientes tienen que decir sobre su experiencia.
      </p>
    </div>

    <div class="swiper-reviews-carousel py-4 mb-6">
      <!-- eslint-disable vue/attribute-hyphenation -->
      <swiper-container slides-per-view="1" space-between="10" centered-slides="true" loop="true" autoplay-delay="3000"
        autoplay-disable-on-interaction="false" events-prefix="swiper-" :pagination="{
          clickable: 'true',
        }" :injectStyles="[
          `
          .swiper-pagination{
            position: static;
            margin-block: 1rem;
          },
          .swiper-pagination-bullet-active{
            width: 1rem;
          }

      `]" :breakpoints="{
        1400: {
          slidesPerView: 4,
          spaceBetween: 20,
        },
        992: {
          slidesPerView: 3,
          spaceBetween: 20,
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
      }">
        <swiper-slide v-for="(data, index) in reviewData" :key="index">
          <VCard class="h-100 d-flex align-stretch">
            <VCardText class="pa-4 pa-sm-6 pa-md-8 d-flex flex-column justify-space-between align-center review-card">
              <img :src="data.img" style="block-size: 1.75rem;">

              <div class="text-body-1 text-high-emphasis text-center  review-description">
                {{ data.desc }}
              </div>

              <div>
                <VRating :model-value="data.rating" color="warning" readonly />
              </div>

              <div class="text-center">
                <div class="text-body-1 text-high-emphasis font-weight-medium">
                  {{ data.name }}
                </div>

                <div class="text-body-2">
                  {{ data.position }}
                </div>
              </div>
            </VCardText>
          </VCard>
        </swiper-slide>
      </swiper-container>
    </div>

    <!-- 👉 Brand-logo Swiper  -->
    <div class="swiper-brands-carousel mt-4">
      <swiper-container slides-per-view="1" loop="true" events-prefix="swiper-" :breakpoints="{
        992: {
          slidesPerView: 5,
        },
        768: {
          centeredSlides: true,
          slidesPerView: 3,
        },
        580: {
          centeredSlides: true,
          slidesPerView: 2,
        },
      }">

      </swiper-container>
    </div>
  </div>
</template>

<style lang="scss">
@use "swiper/css/bundle";


swiper-container::part(bullet-active) {
  border-radius: 6px;
  background-color: rgba(var(--v-theme-on-background), var(--v-disabled-opacity));
  inline-size: 38px;
}

swiper-container::part(bullet) {
  background-color: rgba(var(--v-theme-on-background));
}

swiper-container::part(pagination) {
  margin-block: 1.5rem;
}

.swiper-reviews-carousel {
  swiper-container {
    --swiper-pagination-bullet-width: 10px;
    --swiper-pagination-bullet-height: 10px;
    --swiper-pagination-bullet-horizontal-gap: 6px;

    .swiper {
      padding-block-end: 3rem;
    }
  }

  swiper-slide {
    block-size: auto;
    opacity: 0.5;
    padding-block: 1rem;
    padding-block-end: 1rem;
    transition: all 0.35s ease;

    &.swiper-slide-active {
      opacity: 1;
      padding-block: 0;
    }
  }

  .swiper-pagination {
    inset-block: 0 0 !important;
  }
}
</style>

<style lang="scss" scoped>
.customer-reviews {
  padding-block-start: 2rem !important;
  margin-block: 6.25rem;
}

.review-card {
  max-width: 300px; /* Ajusta el ancho de la tarjeta */
  height: auto;
  overflow: hidden; /* Esconde cualquier contenido que se desborde */
}

.review-description {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  /* Limita el texto a 3 líneas */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  /* Muestra "..." cuando el texto es truncado */
  height: 4.5rem;
  /* Ajusta la altura para que el texto no ocupe mucho espacio */
  padding: 0 1rem;
  /* Un poco de espacio alrededor del texto */
}
</style>
