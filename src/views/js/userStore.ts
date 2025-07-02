import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null)

  // Computed para obtener el rol del usuario
  const role = computed(() => user.value?.role || null)
  const idUsuario = computed(() => user.value?.idUser || null)

  // Computed para obtener los permisos
  const permissions = computed(() => user.value?.permissions || [])

  // Función para actualizar el usuario
  function setUser(newUser) {
    user.value = newUser
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  // Función para cerrar sesión
  function logout() {
    user.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  return { user, role, permissions, setUser, logout }
})
