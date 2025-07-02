import { setupLayouts } from "virtual:generated-layouts";
import { createRouter, createWebHistory } from "vue-router/auto";
import { setupGuards } from "./guards";

function recursiveLayouts(route) {
  if (route.children) {
    for (let i = 0; i < route.children.length; i++)
      route.children[i] = recursiveLayouts(route.children[i]);

    return route;
  }

  return setupLayouts([route])[0];
}
// http://localhost:5173/products
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: "smooth", top: 60 };

    return { top: 0 };
  },
  extendRoutes: (pages) => [
    ...[
      {
        path: "/",
        name: "landing",
        component: () => import("@/pages/front-pages/landing-page/index.vue"),
        meta: { public: true },
      },
      {
        path: "/login",
        name: "login",
        component: () => import("@/pages/login.vue"),
        meta: { unauthenticatedOnly: true },
        redirect: (to) => {
          // TODO: Get type from backend
          const userData = localStorage.getItem("user");
          if (userData) return { name: "dashboard" };
          return { name: "landing", query: to.query };
        },
      },
      {
        path: "/not-authorized",
        name: "not-authorized",
        component: () => import("@/pages/not-authorized.vue"),
        meta: { public: true },
      },
    ],
    ...[
      ...pages,
      ...[
        {
          path: "/dashboard",
          name: "dashboard",
          component: () => import("@/pages/dashboard/dashboard.vue"),
          meta: {
            permissions: "ver_dashboard_admin",
            // not_authenticate: false,
          },
        },
        {
          path: "/dashboardUsuario",
          name: "dashboard-usuario",
          component: () => import("@/pages/dashboard/dashboardUser.vue"),
          meta: {
            permissions: "ver_dashboard_propietario",
          },
        },
        {
          path: "/dashboardCliente",
          name: "dashboard-cliente",
          component: () => import("@/pages/dashboard/dashboardClient.vue"),
          meta: {
            permissions: "ver_dashboard_inquilino",
          },
        },
        {
          path: "/listAlquiler",
          name: "inmuebles-alquiler",
          component: () => import("@/pages/inmuebles/listAlquiler.vue"),
          meta: {
            permissions: "inmuebles",
          },
        },
        {
          path: "/listVentas",
          name: "inmuebles-ventas",
          component: () => import("@/pages/inmuebles/listVentas.vue"),
          meta: {
            permissions: "ver_inmueble_propietario",
          },
        },
        {
          path: "/addInmueble/:id?",
          name: "add-inmuebles",
          component: () => import("@/pages/inmuebles/addInmueble.vue"),
          meta: {
            permissions: "ver_inmueble_propietario",
          },
        },
        {
          path: "/historyInmueble",
          name: "history-inmuebles",
          component: () => import("@/pages/inmuebles/historyInmueble.vue"),
          meta: {
            permissions: "ver_inmueble_propietario",
          },
        },
        {
          path: "/listRecibos",
          name: "recibos",
          component: () => import("@/pages/recibos/list/listRecibos.vue"),
          meta: {
            permissions: "all",
          },
        },
        {
          path: "/AgregarRecibos",
          name: "agregar-recibos",
          component: () => import("@/pages/recibos/add/index.vue"),
          meta: {
            permissions: "all",
          },
        },
        {
          path: "/recibos/list/:id",
          name: "ver-recibo",
          component: () => import("@/pages/recibos/list/[id].vue"),
          meta: {
            permissions: "all",
          },
        },
        {
          path: "/recibos/print/:id",
          name: "recibo-print",
          component: () => import("@/views/pages/invoice/ReciboPrint.vue"),
          meta: {
            permissions: "all",
          },
        },
        {
          path: "/serviciosPublicos/add",
          name: "agregar-servicios-publicos",
          component: () => import("@/pages/serviciosPublicos/add/index.vue"),
          meta: {
            permissions: "all",
          },
        },
        {
          path: "/serviciosPublicos/list",
          name: "servicios-publicos",
          component: () => import("@/pages/serviciosPublicos/list/index.vue"),
          meta: {
            permissions: "all",
          },
        },
        {
          path: "/serviciosPublicos/edit/:id",
          name: "editar-servicios-publicos",
          component: () => import("@/pages/serviciosPublicos/list/[id].vue"),
          meta: {
            permissions: "all",
          },
        },
        {
          path: "/danos/list",
          name: "danos",
          meta: {
            permissions: "all",
          },
          component: () => import("@/pages/danos/list/index.vue"),
        },
        {
          path: "/danos/create",
          name: "agregar-danos",
          meta: {
            permissions: "all",
          },
          component: () => import("@/pages/danos/add/index.vue"),
        },
        {
          path: "/danos/edit/:id",
          name: "editar-danos",
          meta: {
            permissions: "all",
          },
          component: () => import("@/pages/danos/list/[id].vue"),
        },
        {
          path: "/novedades/create",
          name: "agregar-novedades",
          meta: {
            permissions: "all",
          },
          component: () => import("@/pages/novedades/add/index.vue"),
        },
        {
          path: "/pagos/nuevo",
          name: "pago-nuevo",
          component: () => import("@/pages/pagos/add/pagoForm.vue"),
          meta: { requiresAuth: true },
        },
        {
          path: "/pagos/list",
          name: "pagos-listado",
          component: () => import("@/pages/pagos/list/index.vue"),
          meta: { requiresAuth: true },
        },
        {
          path: "/pagos/ver/:id",
          name: "pago-ver",
          component: () => import("@/pages/pagos/list/[id].vue"),
          meta: { requiresAuth: true },
        },
      ],
    ].map((route) => recursiveLayouts(route)),
  ],
});

setupGuards(router);
export { router };
export default function (app) {
  app.use(router);
}
