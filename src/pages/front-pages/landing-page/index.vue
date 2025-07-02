<script setup>
import Navbar from '@/views/front-pages/front-page-navbar.vue'

import { useRouter } from 'vue-router'
import { useConfigStore } from '@core/stores/config'
import HeroSection from '@/views/front-pages/hero-section.vue'
import Features from '@/views/front-pages/features.vue'
import CustomersReview from '@/views/front-pages/customers-review.vue'
import HelpCenterLandingKnowledgeBase from '@/views/front-pages/HelpCenterLandingKnowledgeBase.vue'
import ContactUs from '@/views/front-pages/contact-us.vue'
import FrontPageFooter from '@/views/front-pages/front-page-footer.vue'

const store = useConfigStore()
const router = useRouter()

store.skin = 'default'
definePage({ meta: { layout: 'blank' } })

const activeSectionId = ref()
const refHome = ref()
const refFeatures = ref()
const refTeam = ref()
const refContact = ref()
const refFaq = ref()

useIntersectionObserver([
  refHome,
  refFeatures,
  refTeam,
  refContact,
  refFaq,
], ([{ isIntersecting, target }]) => {
  if (isIntersecting)
    activeSectionId.value = target.id
}, { threshold: 0.25 })

const goToLogin = () => {
  router.push({ name: 'login' })
}

// Definimos los datos para misión, visión e información general
const categories = [
  {
    title: "Misión",
    description: "Habitable Inmobiliaria es una  empresa Quindiana enfocada al asesoramiento y ventas de bienes inmuebles, con presencia en Armenia y Cali, orientando sus servicios a la inversión pertinente, y con ello satisfacer sus necesidades y expectativas.",
    // icon: "mdi-mission"
  },
  {
    title: "Visión",
    description: "Estar en uno de los cinco primeros puestos a nivel nacional en la industria de bienes raíces, posicionándose por sus buenas prácticas y desarrollo de marca en las principales redes sociales, mediante la generación de contenido de valor y diversificación de portafolio financiero.",
    // icon: "mdi-eye",
  }, 
]
</script>


<template>
  <div class="landing-page-wrapper">
    <Navbar :active-id="activeSectionId" />

    <HeroSection ref="refHome" />
    <Features ref="refFeatures" />

    <!-- 👉 Useful features  -->
    <div :style="{ 'background-color': 'rgb(var(--v-theme-surface))' }">
      <CustomersReview />
    </div>
    
    <HelpCenterLandingKnowledgeBase :categories="categories" />
    
    <div :style="{ 'background-color': 'rgb(var(--v-theme-surface))' }">
      <ContactUs ref="refContact" />
    </div>

    <FrontPageFooter/>


    <!-- <h1>Bienvenido a la Landing Page</h1>
    <button @click="goToLogin">Iniciar Sesión</button> -->
  </div>
</template>


<style lang="scss">
@media (max-width: 960px) and (min-width: 600px) {
  .landing-page-wrapper {
    .v-container {
      padding-inline: 2rem !important;
    }
  }
}
</style>
