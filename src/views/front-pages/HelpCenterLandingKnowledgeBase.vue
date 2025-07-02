<script setup>
import sectionTitleIcon from '@images/pages/section-title-icon.png'

const props = defineProps({
  categories: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <VContainer id="features">
    <div class="feature-cards">
      <!-- Título principal -->
      <div class="headers d-flex justify-center flex-column align-center mb-6">
        <div class="d-flex gap-x-3 mb-6">
          <img
            :src="sectionTitleIcon"
            alt="section title icon"
            height="24"
            width="25"
          />
          <div class="text-body-1 text-high-emphasis font-weight-medium">
            ¿Quienes somos?
          </div>
        </div>

        <div class="mb-2 text-center">
          <span
            class="text-h4 d-inline-block font-weight-bold"
            style="line-height: 2rem;"
          >
            Habitable Inmobiliaria es una empresa Quindiana enfocada al asesoramiento y ventas de bienes inmuebles
          </span> 
        </div>

        <p class="text-body-1 font-weight-medium text-center">
          con presencia en Armenia y Cali, orientando sus servicios a la inversión pertinente, y con ello satisfacer sus necesidades y expectativas.
        </p>
      </div>

      <!-- Cuadros de Misión y Visión (una al lado de la otra) -->
      <VRow class="d-flex justify-center align-center">
  <VCol
    v-for="article in props.categories"
    :key="article.title"
    cols="12" sm="6"   
    class="pa-2"
  >
    <VCard class="card-centered">
      <VCardItem class="pb-6">
        <div class="d-flex align-center justify-center">
          <VCardTitle class="text-center">
            {{ article.title }}
          </VCardTitle>
        </div>
      </VCardItem>

      <VCardText class="text-center">
        <p class="article-description">
          {{ article.description }}
        </p>
      </VCardText>
    </VCard>
  </VCol>
</VRow>

      
    </div>
  </VContainer>
</template>

<style lang="scss" scoped>
/* Estilos generales */
#features {
  padding-top: 3rem;
  padding-bottom: 6rem;
}

.feature-cards {
  margin-top: -100px;
}

.headers {
  margin-bottom: 3rem;
}

.card-centered {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-10px);
  }
}

.card-centered .v-avatar {
  margin-bottom: 1rem;
}

.card-centered .v-card-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.card-centered .article-description {
  font-size: 1rem;
  line-height: 1.6;
  color: #555;
  margin-top: 1rem;
}

@media (max-width: 960px) {
  #features {
    padding-top: 6rem;
  }
}

@media (max-width: 600px) {
  #features {
    padding-top: 2rem;
  }
}
</style>
