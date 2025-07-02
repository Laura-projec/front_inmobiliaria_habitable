<script setup>
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

const menus = [] // Puedes agregar enlaces de navegación aquí si los necesitas

const socialLinks = [
  { title: 'Facebook', icon: 'ri-facebook-box-line', href: 'https://www.facebook.com/pixinvents/' },
  { title: 'X', icon: 'ri-x-line', href: 'https://x.com/pixinvent' },
  { title: 'Instagram', icon: 'ri-instagram-line', href: 'https://www.instagram.com/pixinvent' }
]
</script>

<template>
  <div class="footer">
    <VSheet class="footer-top pt-8 pb-4" theme="dark">
      <VContainer>
        <VRow class="footer-content">
          <!-- Columna 1: Logo y slogan -->
          <VCol cols="12" md="4" class="footer-logo-column">
            <div class="footer-form text-center text-md-left">
              <VNodeRenderer :nodes="themeConfig.app.logo" class="footer-logo" style="max-width: 250px;" />
              <h1 class="footer-title">{{ themeConfig.app.title }}</h1>
              <p class="footer-text">
                Tu ilusión la hacemos realidad
              </p>
            </div>
          </VCol>


          <!-- Columna 2: Información de contacto -->
          <VCol cols="12" md="4" class="footer-info-column">
            <div class="footer-contact">
              <p>
                <i class="ri-phone-line"></i> <span>Tel: 312 809 7256</span>
              </p>
              <p>
                <i class="ri-map-pin-line"></i> <span>Ubicación: Armenia - Quindío - Colombia</span>
              </p>
              <p>
                <i class="ri-mail-line"></i> <span>Correo: inmobiliariahabitable@gmail.com</span>
              </p>
            </div>
          </VCol>

          <!-- Columna 3: Redes sociales -->
          <VCol cols="12" md="4" class="footer-socials-column">
            <div class="footer-socials">
              <template v-for="(social, index) in socialLinks" :key="index">
                <a :href="social.href" target="_blank" rel="noopener noreferrer" class="social-link">
                  <i :class="social.icon"></i>
                  <span>{{ social.title }}</span>
                </a>
              </template>
            </div>
          </VCol>
        </VRow>

        <!-- Fila de derechos reservados -->
        <VRow>
          <VCol cols="12" class="footer-rights text-center">
            <p>&copy; 2025 Habitable Inmobiliaria. Todos los derechos reservados.</p>
          </VCol>
        </VRow>
      </VContainer>
    </VSheet>
  </div>
</template>

<style lang="scss" scoped>
.footer-top {
  background: #2776bb;
  color: white;
}

.footer-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 10px;
}

.footer-text {
  font-size: 1rem;
  opacity: 0.8;
  margin-bottom: 20px;
}

.footer-contact p {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 1rem;
}

.footer-contact i {
  font-size: 20px;
}

.footer-socials {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.social-link {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1rem;
  color: white;
  text-decoration: none;
  transition: color 0.3s ease;
}

.social-link:hover {
  color: #fbc02d;
}

.social-link i {
  font-size: 20px;
}

.footer-rights {
  font-size: 0.875rem;
  opacity: 0.7;
  padding-top: 10px;
}

@media (max-width: 960px) {
  .footer-socials {
    align-items: center;
  }
}

.footer-logo {
  max-width: 250px; /* Ajusta según necesites */
  width: 100%;
}

</style>
