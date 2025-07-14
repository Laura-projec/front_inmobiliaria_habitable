<script setup>
import ConnectImg from '@images/front-pages/landing-page/lets-contact.png'
import sectionTitleIcon from '@images/pages/section-title-icon.png'
import frontPageVectorImg from '@images/svg/front-page-vector.svg'

const name = ref('')
const email = ref('')
const message = ref('')
</script>

<template>
  <VContainer id="contactenos">
    <!-- 👉 Headers  -->
    <div class="contact-us-section">
      <div class="headers d-flex justify-center flex-column align-center pb-15">
        <Component
          :is="frontPageVectorImg"
          class="front-page-vector"
        />
        <div class="d-flex gap-x-3 mb-6">
          <img
            :src="sectionTitleIcon"
            alt="section title icon"
            height="24"
            width="25"
          >
          <div class="text-body-1 text-high-emphasis font-weight-medium">
            CONTACTENOS
          </div>
        </div>

        <div class="mb-2 text-center">
          <span
            class="text-h4 d-inline-block font-weight-bold"
            style="line-height: 2rem;"
          >
            Trabajaremos
          </span> <span class="text-h5 d-inline-block">juntos</span>
        </div>

        <p class="text-body-1 font-weight-medium text-center mb-0">
          ¿Alguna pregunta o comentario? solo escríbenos un mensaje
        </p>
      </div>
      <div class="mb-15">
        <VRow class="match-height">
          <VCol
            cols="12"
            md="4"
            sm="6"
          >
            <VCard
              flat
              elevation="0"
              color="primary"
              theme="dark"
            >
              <VCardText class="pa-8">
                <h6 class="text-h6 mb-1">
                  Contactenos
                </h6>

                <h4 class="text-h4">
                  Comparta sus ideas o requisitos con nuestros expertos.
                </h4>

                <div class="text-body-1">
                  ¿Busca más personalización, más funciones y más? No se preocupe, le proporcionamos un equipo completo de profesionales experimentados.
                </div>
              </VCardText>
            </VCard>
          </VCol>
          <VCol
            cols="12"
            md="8"
            sm="6"
          >
            <VCard>
              <VCardText>
                <div class="text-h5 mb-5">
                  Escribanos
                </div>
                <VForm @submit.prevent="() => {}">
                  <VRow>
                    <VCol
                      cols="12"
                      md="6"
                    >
                      <VTextField
                        v-model="name"
                        placeholder="John Doe"
                        label="Nombre"
                      />
                    </VCol>

                    <VCol
                      cols="12"
                      md="6"
                    >
                      <VTextField
                        v-model="email"
                        placeholder="johndoe@gmail.com"
                        label="Correo"
                      />
                    </VCol>

                    <VCol cols="12">
                      <VTextarea
                        v-model="message"
                        placeholder="Type Your message"
                        label="Mensaje"
                      />
                    </VCol>

                    <VCol>
                      <VBtn type="submit">
                        Enviar
                      </VBtn>
                    </VCol>
                  </VRow>
                </VForm>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </div>
    </div>
  </VContainer>
</template>

<style lang="scss" scoped>
.contact-us-section {
  position: relative;
  margin-block: 5.25rem;
}

.front-page-vector {
  position: absolute;
  inset-block-start: 0;
  inset-inline-start: 0;
}
</style>
