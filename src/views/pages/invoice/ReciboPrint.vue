<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import logo from '@/assets/images/logo-habitable-inmobiliaria.png'

const route = useRoute()
const totalCreditos = ref(0)
const totalDebitos = ref(0)
const totalNeto = ref(0)
const data = ref({
    invoice: {},
    purchasedProducts: [],
    note: '',
    thanksNote: '',
})

const invoice = computed(() => data.value.invoice)
const products = computed(() => data.value.purchasedProducts || [])
const note = computed(() => data.value.note)
const thanksNote = computed(() => data.value.thanksNote)

const numberFormat = new Intl.NumberFormat('es-CO', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

onMounted(async () => {
    const reciboId = route.params.id
    const shouldPrint = route.query.imprimir === 'true'

    try {
        const resp = await $api(`/recibos/${reciboId}`, { method: 'GET' })
        const recibo = resp.recibo

        data.value = {
            invoice: {
                ...recibo,
                client: {
                    nombre_completo: `${recibo.cliente?.name || ''} ${recibo.cliente?.surname || ''}`.trim(),
                    datos_doc: `${recibo.cliente?.tipo_documento || ''} ${recibo.cliente?.numero_documento || ''}`.trim(),
                    direccion: recibo.cliente?.direccion,
                    celular: recibo.cliente?.celular,
                    email: recibo.cliente?.email,
                },
                property: recibo.inmueble || {},
                issuedDate: recibo.fecha,
                subtotal: Number(recibo.subtotal || 0),
                descuento_total: Number(recibo.descuento_total || 0),
                total: Number(recibo.total || 0),
            },
            purchasedProducts: recibo.detalles?.map(det => ({
                title: det.item?.title ?? 'Sin título',
                tipo: det.tipo ?? '',
                cantidad: Number(det.cantidad ?? 0),
                precio: Number(det.precio_unitario ?? 0),
                total: Number(det.total ?? 0),
            })) || [],
            note: recibo.nota,
            thanksNote: recibo.nota_agradecimiento,
        }

        const safeProducts = data.value.purchasedProducts || []

        const creditos = safeProducts.reduce((acc, item) => {
            const cantidad = Number(item.cantidad) || 0
            const precio = Number(item.precio) || 0
            return item.tipo === 'credito' ? acc + precio * cantidad : acc
        }, 0)

        const debitos = safeProducts.reduce((acc, item) => {
            const cantidad = Number(item.cantidad) || 0
            const precio = Number(item.precio) || 0
            return item.tipo === 'debito' ? acc + precio * cantidad : acc
        }, 0)

        totalCreditos.value = creditos
        totalDebitos.value = debitos
        totalNeto.value = creditos - debitos

        if (shouldPrint) {
            const style = document.createElement('style')
            style.innerHTML = `
        @media print {
          .user-avatar, .v-avatar, .v-avatar--variant, .v-avatar *, 
          [class*="avatar"], [class*="v-avatar"], .user-profile-badge {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            width: 0 !important;
            overflow: hidden !important;
          }
        }
      `
            document.head.appendChild(style)

            setTimeout(() => {
                window.print()
            }, 2000)
        }

    } catch (e) {
        console.error('Error al cargar el recibo:', e)
    }
})
</script>

<template>
    <header class="print-header">
        <div class="logo-info">
            <img :src="logo" alt="Logo" class="logo" />
        </div>
        <div class="invoice-info">
            <p><strong>FACTURA:</strong> # {{ invoice.id }}</p>
            <p><strong>FECHA:</strong> {{ invoice.issuedDate }}</p>
        </div>
    </header>

    <div class="print-page">

        <section class="info">
            <div class="cliente">
                <h3>DATOS DEL CLIENTE</h3>
                <p><strong>Nombre:</strong> {{ invoice.client?.nombre_completo }}</p>
                <p><strong>Documento:</strong> {{ invoice.client?.datos_doc }}</p>
                <p><strong>Dirección:</strong> {{ invoice.client?.direccion }}</p>
                <p><strong>Celular:</strong> {{ invoice.client?.celular }}</p>
                <p><strong>Email:</strong> {{ invoice.client?.email }}</p>
                <p><strong>Inmueble:</strong> {{ invoice.property?.direccion || 'No seleccionado' }}</p>
            </div>
            <div class="separator"></div> <!-- línea vertical -->
            <div class="inmueble">
                <h3>DATOS DE LA EMPRESA</h3>
                <p><strong>Dirección:</strong> Armenia, Quindío</p>
                <p><strong>Email:</strong>habitableinmobiliaria@gmail.com</p>
                <p><strong>Celular:</strong>(+57) 312 809 7256 </p>
            </div>
        </section>

        <section class="items">
            <table>
                <thead>
                    <tr>
                        <th>Descripción</th>
                        <th>Cant.</th>
                        <th>Devengado</th>
                        <th>Deducidos</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, i) in products" :key="i">
                        <td>{{ item.title }}</td>
                        <td>{{ item.cantidad }}</td>
                        <td>
                            <span v-if="item.tipo === 'credito'">
                                ${{ numberFormat.format(item.precio * item.cantidad) }}
                            </span>
                        </td>
                        <td>
                            <span v-if="item.tipo === 'debito'">
                                ${{ numberFormat.format(item.precio * item.cantidad) }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </section>

        <section class="totals">
            <p><strong>Total Devengado:</strong> {{ numberFormat.format(totalCreditos) }}</p>
            <p><strong>Total Deducidos:</strong> {{ numberFormat.format(totalDebitos) }}</p>
            <p><strong>Total Neto:</strong> ${{ numberFormat.format(totalNeto) }}</p>
        </section>
        <section v-if="note">
            <h4>Nota:</h4>
            <p>{{ note }}</p>
        </section>

        <section v-if="thanksNote">
            <h4>Gracias:</h4>
            <p>{{ thanksNote }}</p>
        </section>
    </div>
    <footer class="print-footer">
        <p>Habitable Inmobiliaria - Todos los derechos reservados</p>
    </footer>
</template>

<style scoped>
.print-page {
    font-family: Arial, sans-serif;
    color: #000;
    background: #fff;
    margin: 0 auto;
    padding: 2rem;
}

.print-header {
    background-color: #f2f2f4;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #000;
    width: 100%;
    box-sizing: border-box;
}

.logo {
    max-width: 150px;
    height: auto;
}

.invoice-info {
    text-align: right;
    font-size: 0.95rem;
}

.info {
    display: flex;
    justify-content: space-between;
    margin: 2rem 0;
    gap: 2rem;
    align-items: flex-start;
}

.cliente,
.inmueble {
    flex: 1;
}

.separator {
    width: 1px;
    background-color: #000;
    margin: 0 1rem;
    align-self: stretch;
}

.print-footer {
    text-align: center;
    font-size: 0.85rem;
    padding: 1rem;
    background-color: #f2f2f4;
    border-top: 1px solid #ccc;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
}


.info h3 {
    margin-bottom: 0.5rem;
    border-bottom: 1px solid #000;
    padding-bottom: 0.25rem;
}

.info p {
    margin: 0.25rem 0;
}

.items table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
    font-size: 0.95rem;
}

.items thead th {
    border: 1px solid #000;
    padding: 0.5rem;
    text-align: center;
}

.items tbody td {
    padding: 0.5rem;
    text-align: center;
    border: none;
}

.items td:nth-child(3),
.items td:nth-child(4) {
    text-align: right;
}

.totals {
    text-align: right;
    margin-top: 1rem;
}

.notas {
    margin-top: 2rem;
    font-size: 0.95rem;
}

.notas h4 {
    margin-bottom: 0.25rem;
    border-bottom: 1px solid #000;
}

@media print {
    @page {
        size: A4;
        margin: 0;
    }

    html,
    body {
        margin: 0;
        padding: 0;
        background: white;
    }

    .print-page {
        width: 100%;
        padding: 0 2rem;
        box-sizing: border-box;
    }

    .print-header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background-color: #f2f2f4 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        padding: 1rem 2rem;
        z-index: 1000;
    }

    .print-page {
        padding-top: 160px;
        /* espacio para el header fijo */
    }

    .print-footer {
        display: block;
    }

    .print-page {
        padding-bottom: 80px;
        /* espacio para el footer fijo */
    }

    .separator {
        display: inline-block !important;
        background-color: #000 !important;
    }

    .items thead th {
        border: 1px solid #000 !important;
        background-color: #f2f2f4 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }

    .items table {
        border-collapse: collapse !important;
    }

    /* Ocultar elementos innecesarios */
    .layout-navbar,
    .layout-footer,
    .v-navigation-drawer,
    .layout-vertical-nav,
    .user-avatar,
    .v-avatar,
    [class*="avatar"],
    [class*="v-avatar"],
    [class*="nav"],
    [class*="toolbar"],
    .app-customizer-toggler,
    .layout-navbar-and-nav-container,
    .product-buy-now,
    .user-profile-badge {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        width: 0 !important;
        overflow: hidden !important;
    }
}
</style>
