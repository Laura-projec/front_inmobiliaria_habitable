<script setup>//lau
import { useGenerateImageVariant } from '@/@core/composable/useGenerateImageVariant'
import AuthProvider from '@/views/pages/authentication/AuthProvider.vue'
import authV2LoginIllustrationBorderedDark from '@images/pages/auth-v2-login-illustration-bordered-dark.png'
import authV2LoginIllustrationBorderedLight from '@images/pages/auth-v2-login-illustration-bordered-light.png'
import authV2LoginIllustrationDark from '@images/pages/auth-v2-login-illustration-dark.png'
import authV2LoginIllustrationLight from '@images/pages/auth-v2-login-illustration-light.png'
import authV2LoginMaskDark from '@images/pages/auth-v2-login-mask-dark.png'
import authV2LoginMaskLight from '@images/pages/auth-v2-login-mask-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import { ref } from 'vue'
import logo from '@images/logo-habitable-inmobiliaria.png'



const form = ref({
  email: '',
  password: '',
  remember: false,
  aceptaDatos: false,
})

const showPoliticaModal = ref(false)

const route = useRoute()
const router = useRouter()

const error_exists = ref(null)
const success_exists = ref(null)

definePage({
  meta: {
    layout: 'blank',
    // unauthenticatedOnly: true,
  },
})

const login = async () => {
  if (!form.value.aceptaDatos) {
    error_exists.value = 'Debes aceptar la política de tratamiento de datos para continuar.'
    return
  }
  try {
    error_exists.value = null;
    success_exists.value = null;
    const resp = await $api('/auth/login', {
      method: 'POST',
      body: {
        email: form.value.email,
        password: form.value.password,
      },
      onResponseError(response) {
        error_exists.value = response.response._data.error;
      }
    })
    localStorage.setItem('token', resp.access_token);
    localStorage.setItem('user', JSON.stringify(resp.user));
    // Registrar aceptación de tratamiento de datos
    await $api('aceptacion-tratamiento-datos', {
      method: 'POST',
      body: { aceptado: true },
      headers: { Authorization: `Bearer ${resp.access_token}` },
    })
    success_exists.value = true;

    setTimeout(async () => {
      await nextTick(() => {
        router.replace(route.query.to ? String(route.query.to) : '/')
      })
    }, 1500);

  } catch (error) {
    console.log(error);
  }
}

const isPasswordVisible = ref(false)
const authV2LoginMask = useGenerateImageVariant(authV2LoginMaskLight, authV2LoginMaskDark)
const authV2LoginIllustration = useGenerateImageVariant(authV2LoginIllustrationLight, authV2LoginIllustrationDark, authV2LoginIllustrationBorderedLight, authV2LoginIllustrationBorderedDark, true)
</script>

<template>
  <RouterLink to="/">
    <div class="app-logo auth-logo logo-large">
      <img :src="logo" alt="Logo Habitable Inmobiliaria" class="logo-img" />
      <h1 class="app-logo-title">
        {{ themeConfig.app.title }}
      </h1>
    </div>
  </RouterLink>

  <VRow no-gutters class="auth-wrapper">
    <VCol md="8" class="d-none d-md-flex align-center justify-center position-relative">
      <div class="d-flex align-center justify-center pa-10">
        <img :src="authV2LoginIllustration" class="auth-illustration w-100" alt="auth-illustration">
      </div>
      <VImg :src="authV2LoginMask" class="d-none d-md-flex auth-footer-mask" alt="auth-mask" />
    </VCol>
    <VCol cols="12" md="4" class="auth-card-v2 d-flex align-center justify-center"
      style="background-color: rgb(var(--v-theme-surface));">
      <VCard flat :max-width="500" class="mt-12 mt-sm-0 pa-5 pa-lg-7">
        <VCardText>
          <h4 class="text-h4 mb-1">
            Bienvenidos <span class="text-capitalize">{{ themeConfig.app.title }}! 👋🏻</span>
          </h4>

          <p class="mb-0">
            Inicia sesión en tu cuenta y comienza la aventura.
          </p>
        </VCardText>

        <VCardText>
          <VForm @submit.prevent="login()">
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <VTextField v-model="form.email" autofocus label="Email" type="email" placeholder="johndoe@email.com" />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <VTextField v-model="form.password" label="Password" placeholder="············"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible" />

                <VAlert type="success" class="my-2" v-if="success_exists">
                  Credenciales Correctas: <strong>{{ success_exists }}</strong>
                </VAlert>

                <VAlert type="error" class="my-2" v-if="error_exists">
                  Error: <strong>{{ error_exists }}</strong>
                </VAlert>


                <!-- Tratamiento de datos -->
                <div class="d-flex align-center flex-wrap my-4 gap-x-2">
                  <VCheckbox v-model="form.aceptaDatos"
                    :rules="[v => !!v || 'Debes aceptar la política de tratamiento de datos']" color="primary"
                    class="mr-2" />
                  <span class="text-body-2">
                    Acepto la
                    <a href="#" @click.prevent="showPoliticaModal = true"
                      class="text-primary text-decoration-underline">
                      política de tratamiento de datos
                    </a>
                  </span>
                </div>

                <!-- remember me checkbox -->
                <div class="d-flex align-center justify-space-between flex-wrap my-2 gap-x-2">
                  <VCheckbox v-model="form.remember" label="Recordarme" />
                  <a class="text-primary" href="#">
                    Si olvido su contraseña comuniquese con la administracion!
                  </a>
                </div>

                <VDialog v-model="showPoliticaModal" max-width="700px">
                  <VCard>
                    <VCardTitle class="font-weight-bold">Política de Tratamiento de Datos</VCardTitle>
                    <VCardText style="max-height: 60vh; overflow-y: auto;">
                      <p>
                        Resumen: Tus datos personales serán tratados conforme a la Ley 1581 de 2012 para fines
                        contractuales, comerciales, legales y administrativos. Puedes ejercer tus derechos de acceso,
                        corrección y supresión contactando a la administración.
                      </p>
                      <p>
                        Al aceptar, autorizas el tratamiento de tus datos bajo los principios de legalidad, finalidad,
                        libertad, veracidad, transparencia, acceso y circulación restringida, seguridad y
                        confidencialidad. Tienes derecho a conocer, actualizar, rectificar y suprimir tus datos, así
                        como a solicitar información sobre su uso.
                      </p>
                      <p class="mt-2">
                        <a href="/politica-tratamiento-datos.html" target="_blank" rel="noopener"
                          class="text-primary text-decoration-underline">
                          Ver política completa de tratamiento de datos personales
                        </a>
                      </p>
                    </VCardText>
                    <VCardActions>
                      <VSpacer />
                      <VBtn color="primary" @click="showPoliticaModal = false">Cerrar</VBtn>
                    </VCardActions>
                  </VCard>
                </VDialog>

                <!-- login button -->
                <VBtn block type="submit">
                  Login
                </VBtn>
              </VCol>

              <!-- create account -->
              <!-- <VCol cols="12" class="text-body-1 text-center">
                <span class="d-inline-block">
                  New on our platform?
                </span>
                <a class="text-primary ms-1 d-inline-block text-body-1" href="#">
                  Create an account
                </a>
              </VCol> -->

              <!-- <VCol cols="12" class="d-flex align-center">
                <VDivider />
                <span class="mx-4 text-high-emphasis">or</span>
                <VDivider />
              </VCol>
 
              <VCol cols="12" class="text-center">
                <AuthProvider />
              </VCol> -->
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>
<style scoped>
.logo-large {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.logo-img {
  width: 120px !important;
  height: 120px !important;
  max-width: 100% !important;
  max-height: 100% !important;
  object-fit: contain;
  display: block;
  margin-bottom: 0.5rem;
  /* Elimina cualquier padding o border del padre */
}

.app-logo-title {
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin: 0;
}
</style>