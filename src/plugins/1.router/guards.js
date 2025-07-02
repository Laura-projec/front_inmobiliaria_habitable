function parseJwt(token) {
  try {
    // Aquí separamos la segunda parte (el payload) que contiene los datos como la fecha de expiración
    const base64Url = token.split('.')[1]; // Obtenemos el payload que está en formato base64Url

    // El formato base64Url usa '-' y '_' en lugar de '+' y '/' respectivamente probando
    // Necesitamos reemplazarlos para que sea decodificable en base64
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    // Decodificamos la cadena base64
    // atob() convierte la cadena base64 a texto legible
    // Luego usamos decodeURIComponent para manejar correctamente los caracteres especiales
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2); // Convertimos a formato URI
    }).join(''));

    // Finalmente convertimos el payload decodificado a un objeto JSON y lo retornamos
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

function isTokenExpired(token) {
  const decodedToken = parseJwt(token);
  if (!decodedToken || !decodedToken.exp) {
    return true; // Token inválido o sin fecha de expiración
  }
  const currentTime = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
  return decodedToken.exp < currentTime; // Retorna true si el token ha expirado
}

function getUserRole() {
  const userData = localStorage.getItem('user');
  if (!userData) return null;

  try {
    return JSON.parse(userData).role; // Asegúrate de que el backend envía el rol en el objeto `user`
  } catch (error) {
    console.error("Error al parsear el usuario:", error);
    return null;
  }
}


export const setupGuards = router => {
  // 👉 router.beforeEach
  // Docs: https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards
  router.beforeEach((to, from) => {
    if (to.fullPath === from.fullPath) return; // Evita ejecutar si la ruta no ha cambiado realmente

    // console.log('Ejecutando beforeEach para:', to.fullPath);
    /*
         * If it's a public route, continue navigation. This kind of pages are allowed to visited by login & non-login users. Basically, without any restrictions.
         * Examples of public routes are, 404, under maintenance, etc.
         */
    // if (to.meta.public)
    //   return

    /**
         * Check if user is logged in by checking if token & user data exists in local storage
         * Feel free to update this logic to suit your needs
         */
    const isLoggedIn = !!(localStorage.getItem('user') && localStorage.getItem('token'));
    // console.log(isLoggedIn);
    if (isLoggedIn && isTokenExpired(localStorage.getItem("token"))) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }


    /*
          If user is logged in and is trying to access login like page, redirect to home
          else allow visiting the page
          (WARN: Don't allow executing further by return statement because next code will check for permissions)
         */
    if (isLoggedIn) {
      let USER = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
      // console.log('isLoggedIn', to);

      // Obtener el rol del usuario
      const role = getUserRole();
      // console.log('role', role);
      // console.log('USER', USER);

      // Definir la ruta de dashboard según el rol
      let dashboardRoute = 'dashboard'; // Ruta por defecto
      if (role.name === 'Propietarios') dashboardRoute = 'dashboard-usuario';
      if (role.name === 'Arrendatario') dashboardRoute = 'dashboard-cliente';

      if (to.path === '/' || to.name === 'login') {
        // console.log(`Redirigiendo a: ${dashboardRoute}`);
        return router.replace({ name: dashboardRoute }); // 👈 Usamos `router.replace()` en lugar de `return`
      }

      if (role.name !== 'super-admin') {
        let permissions = USER?.permissions || []; // 👈 Definir `permissions` correctamente
        if (!Array.isArray(permissions)) {
          console.error('El campo "permissions" no es un array:', permissions);
          return { name: 'not-authorized' };
        }

        if (to.meta.permissions) {
          // console.log('Requiere permisos:', to.meta.permissions);
          // console.log('Permisos del usuario:', permissions);

          // Si `to.meta.permissions` es un array, comprobar si al menos uno coincide
          if (Array.isArray(to.meta.permissions)) {
            const tienePermiso = to.meta.permissions.some(permiso => permissions.includes(permiso));

            if (!tienePermiso) {
              console.warn(`Acceso denegado a ${to.path}. No tiene los permisos requeridos: ${to.meta.permissions}`);
              return { name: 'not-authorized' };
            }
          }
          // Si `to.meta.permissions` es un string, validar directamente
          else if (!permissions.includes(to.meta.permissions) && to.meta.permissions !== "all") {
            console.warn(`Acceso denegado a ${to.path}. Se necesita el permiso: ${to.meta.permissions}`);
            return { name: 'not-authorized' };
          }
        }

      }
    }

    if (!isLoggedIn && to.matched.length) {
      if (to.name === 'login') {
        return;
      }
      if (to.name === 'landing') {
        return;
      }
      /* eslint-disable indent */
      return {
        name: 'login',
        query: {
          ...to.query,
          to: to.fullPath !== '/' ? to.path : undefined,
        },
      };
      /* eslint-enable indent */
    }
  })
}
