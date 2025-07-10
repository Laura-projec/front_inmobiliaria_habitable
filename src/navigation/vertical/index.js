export default [
  {
    title: "Dashboard",
    to: { name: "dashboard" },
    permissions: "ver_dashboard_admin",
    icon: { icon: "ri-bar-chart-2-line" },
  },
  {
    title: "Dashboard",
    to: { name: "dashboard-usuario" },
    permissions: "ver_dashboard_propietario",
    icon: { icon: "ri-bar-chart-2-line" },
  },
  {
    title: "Dashboard",
    to: { name: "dashboard-cliente" },
    permissions: "ver_dashboard_inquilino",
    icon: { icon: "ri-bar-chart-2-line" },
  },
  { heading: "Accesos", permissions: ["list_rol", "list_permiso"] },
  {
    title: "Roles y Permisos",
    to: { name: "roles-permisos" },
    permissions: ["list_rol", "list_permiso"],
    icon: { icon: "ri-lock-password-line" },
  },
  {
    title: "Usuarios",
    to: { name: "usuarios" },
    permissions: "update_usuario",
    icon: { icon: "ri-group-line" },
  },
  {
    title: "Arrendatarios/Propietarios",
    to: { name: "clientes" },
    permissions: "update_propietarios",
    icon: { icon: "ri-group-line" },
  },
  { heading: "Gestion de Inmuebles" },
  {
    title: "Inmuebles",
    icon: { icon: "ri-building-2-fill" },
    children: [
      {
        title: "Historia Inmueble",
        to: "history-inmuebles",
        permissions: "ver_inmueble_propietario",
        icon: { icon: "ri-history-fill" },
      },
      {
        title: "Crear",
        to: "add-inmuebles",
        permissions: "crear_inmuebles",
        icon: { icon: "ri-radio-button-line" },
      },
      {
        title: "Alquiler",
        to: "inmuebles-alquiler",
        permissions: "list_inmuebles",
        icon: { icon: "ri-radio-button-line" },
      },
      {
        title: "Ventas",
        to: "inmuebles-ventas",
        permissions: "list_inmuebles",
        icon: { icon: "ri-radio-button-line" },
      },
    ],
  },
  { heading: "Procesos" },
  // {
  //   title: "Contratos",
  //   icon: { icon: "ri-list-check-3" },
  //   children: [
  //     {
  //       title: "Registrar",
  //       to: "second-page",
  //       icon: { icon: "ri-computer-line" },
  //     },
  //     {
  //       title: "Listado",
  //       to: "second-page",
  //       icon: { icon: "ri-bar-chart-line" },
  //     },
  //   ],
  // },
  {
    title: "Recibos",
    icon: { icon: "ri-bill-line" },
    children: [
      {
        title: "Crear Recibo",
        to: "agregar-recibos",
        permissions: "create_recibos",
      },
      {
        title: "Listar",
        to: "recibos",
        permissions: "list_recibos",
      },
    ],
  },
  {
    title: "Servicios Publicos",
    icon: { icon: "ri-calendar-line" },
    children: [
      {
        title: "Registrar",
        to: "agregar-servicios-publicos",
        permissions: "crud_servicios_publicos",
        icon: { icon: "ri-computer-line" },
      },
      {
        title: "Listado",
        to: "servicios-publicos",
        permissions: "ver_servicios",
        icon: { icon: "ri-bar-chart-line" },
      },
    ],
  },
  {
    title: "Daños",
    icon: { icon: "ri-building-line" },
    children: [
      {
        title: "Registrar",
        to: "agregar-danos",
        permissions: "crud_danos",
        icon: { icon: "ri-computer-line" },
      },
      {
        title: "Listado",
        to: "danos",
        permissions: "ver_danos",
        icon: { icon: "ri-bar-chart-line" },
      },
    ],
  },
  {
    title: "Novedades",
    icon: { icon: "ri-notification-line" },
    children: [
      {
        title: "Registrar",
        to: "agregar-novedades",
        permissions: "crud_novedades",
        icon: { icon: "ri-edit-line" },
      },
    ],
  },
  {
    title: "Pagos",
    icon: { icon: "ri-money-dollar-circle-line" },
    children: [
      {
        title: "Registrar",
        to: "pago-nuevo",
        permissions: "pago_nuevo",
        icon: { icon: "ri-money-dollar-circle-line" },
      },
      {
        title: "Agrgar Comprobante",
        to: "pago-comprobante",
        permissions: "listado_pagos",
        icon: { icon: "ri-money-dollar-circle-line" },
      },
      {
        title: "Listado",
        to: "pagos-listado",
        permissions: "listado_pagos",
        icon: { icon: "ri-bar-chart-line" },
      },
    ],
  },
];
