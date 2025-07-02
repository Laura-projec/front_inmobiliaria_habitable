<script setup>
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

defineProps({
  invoice: Object,
  paymentDetails: Object,
  purchasedProducts: Array,
  subtotal: Number,
  totalDescuento: Number,
  total: Number,
})
</script>

<template>
  <VCard class="invoice-preview-wrapper pa-sm-12 pa-6">
    <!-- Header -->
    <div class="invoice-header-preview d-flex flex-wrap justify-space-between align-sm-center flex-column flex-sm-row print-row bg-var-theme-background gap-6 rounded pa-6 mb-6">
      <div>
        <div class="app-logo mb-6">
          <VNodeRenderer :nodes="themeConfig.app.logo" />
          <h1 class="app-logo-title">{{ themeConfig.app.title }}</h1>
        </div>
        <h6 class="text-h6 font-weight-regular">Office 149, 450 South Brand Brooklyn</h6>
        <h6 class="text-h6 font-weight-regular">San Diego County, CA 91905, USA</h6>
        <h6 class="text-h6 font-weight-regular">+1 (123) 456 7891, +44 (876) 543 2198</h6>
      </div>

      <div>
        <h5 class="text-h5 mb-6">Invoice #{{ invoice.id }}</h5>
        <h6 class="text-h6 font-weight-regular mb-1">
          <span>Date Issued: </span>
          <span>{{ new Date(invoice.issuedDate).toLocaleDateString('en-GB') }}</span>
        </h6>
        <h6 class="text-h6 font-weight-regular">
          <span>Due Date: </span>
          <span>{{ new Date(invoice.dueDate).toLocaleDateString('en-GB') }}</span>
        </h6>
      </div>
    </div>

    <!-- Client & Payment Info -->
    <VRow class="print-row mb-3">
      <VCol class="text-no-wrap">
        <h6 class="text-h6 mb-4">Invoice To:</h6>
        <p class="mb-0 text-body-1">{{ invoice.client.name }}</p>
        <p class="mb-0 text-body-1">{{ invoice.client.company }}</p>
        <p class="mb-0 text-body-1">{{ invoice.client.address }}, {{ invoice.client.country }}</p>
        <p class="mb-0 text-body-1">{{ invoice.client.contact }}</p>
        <p class="mb-0 text-body-1">{{ invoice.client.companyEmail }}</p>
      </VCol>

      <VCol class="text-no-wrap">
        <h6 class="text-h6 mb-4">Bill To:</h6>
        <table class="text-body-1">
          <tbody>
            <tr><td class="pe-6">Total Due:</td><td>{{ paymentDetails.totalDue }}</td></tr>
            <tr><td class="pe-6">Bank Name:</td><td>{{ paymentDetails.bankName }}</td></tr>
            <tr><td class="pe-6">Country:</td><td>{{ paymentDetails.country }}</td></tr>
            <tr><td class="pe-6">IBAN:</td><td class="text-wrap">{{ paymentDetails.iban }}</td></tr>
            <tr><td class="pe-6">SWIFT Code:</td><td>{{ paymentDetails.swiftCode }}</td></tr>
          </tbody>
        </table>
      </VCol>
    </VRow>

    <!-- Table -->
    <VTable class="invoice-preview-table border text-high-emphasis overflow-hidden mb-6">
      <thead>
        <tr>
          <th>ITEM</th>
          <th>DESCRIPTION</th>
          <th class="text-center">HOURS</th>
          <th class="text-center">QTY</th>
          <th class="text-center">TOTAL</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in purchasedProducts" :key="item.name">
          <td class="text-no-wrap">{{ item.name }}</td>
          <td class="text-no-wrap">{{ item.description }}</td>
          <td class="text-center">{{ item.hours }}</td>
          <td class="text-center">{{ item.qty }}</td>
          <td class="text-center">${{ (item.cost * item.hours).toFixed(2) }}</td>
        </tr>
      </tbody>
    </VTable>

    <!-- Totals & Salesperson -->
    <div class="d-flex justify-space-between flex-column flex-sm-row print-row">
      <div class="mb-2">
        <div class="d-flex align-center mb-1">
          <h6 class="text-h6 me-2">Salesperson:</h6>
          <span class="text-body-1">{{ invoice.salesperson || 'N/A' }}</span>
        </div>
        <p class="text-body-1">Thanks for your business</p>
      </div>

      <div>
        <table class="w-100 text-body-1">
          <tbody>
            <tr>
              <td class="pe-16">Subtotal:</td>
              <td class="text-end">
                <h6 class="text-h6">${{ subtotal.toFixed(2) }}</h6>
              </td>
            </tr>
            <tr>
              <td class="pe-16">Discount:</td>
              <td class="text-end">
                <h6 class="text-h6">${{ totalDescuento.toFixed(2) }}</h6>
              </td>
            </tr>
            <tr>
              <td class="pe-16">Tax:</td>
              <td class="text-end">
                <h6 class="text-h6">21%</h6>
              </td>
            </tr>
          </tbody>
        </table>
        <VDivider class="my-2" />
        <table class="w-100">
          <tbody>
            <tr>
              <td class="pe-16">Total:</td>
              <td class="text-end">
                <h6 class="text-h6">${{ total.toFixed(2) }}</h6>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <VDivider class="my-6 border-dashed" />
    <p class="mb-0 text-body-1">
      <span class="text-high-emphasis font-weight-medium me-1">Note:</span>
      <span>{{ invoice.note || 'It was a pleasure working with you and your team. We hope you will keep us in mind for future freelance projects. Thank You!' }}</span>
    </p>
  </VCard>
</template>

<style scoped>
.invoice-preview-table {
  --v-table-header-color: var(--v-theme-surface);

  &.v-table .v-table__wrapper table thead tr th {
    border-block-end: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
  }
}

.app-logo {
  display: flex;
  align-items: center;
  column-gap: 0.5rem;

  .app-logo-title {
    font-size: 1.25rem;
    font-weight: 600;
    letter-spacing: 0.27px;
    line-height: 1.5rem;
    text-transform: capitalize;
  }
}
</style>
