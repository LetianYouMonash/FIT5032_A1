
<template>
  <div class="container py-5">
    <div class="text-center mb-4">
      <h1>Recycling &amp; Reuse</h1>
      <p class="text-muted">
        Find out which household bin to use or how to dispose of items safely.
      </p>
    </div>

    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <h2 class="h4 mb-3">Waste Disposal Guide</h2>

        <p class="text-muted small mb-4">
          This guide uses common Victorian household waste categories.
          Bin availability and accepted materials may vary by local council.
          Always check your council's rules when a note indicates a local variation.
        </p>

        <div class="row g-3 mb-4">
          <div class="col-12 col-md-4">
            <label for="recyclingSearchColumn" class="form-label">
              Search Column
            </label>

            <select
              id="recyclingSearchColumn"
              v-model="searchColumn"
              class="form-select"
            >
              <option value="all">All Columns</option>
              <option value="material">Material</option>
              <option value="householdBin">Household Bin?</option>
              <option value="disposalMethod">Disposal Method</option>
              <option value="garbageType">Garbage Type</option>
              <option value="notes">Additional Notes</option>
            </select>
          </div>

          <div class="col-12 col-md-8">
            <label for="recyclingSearchInput" class="form-label">
              Search Materials
            </label>

            <input
              id="recyclingSearchInput"
              v-model="searchQuery"
              type="search"
              class="form-control"
              :placeholder="
                searchColumn === 'all'
                  ? 'Search all columns...'
                  : `Search by ${columnLabels[searchColumn]}...`
              "
            />
          </div>
        </div>

        <!-- E.4: Export controls -->
        <section
          class="export-section mb-4"
          aria-labelledby="export-heading"
        >
          <div
            class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3"
          >
            <div>
              <h3 id="export-heading" class="h6 mb-1">
                Export Waste Disposal Data
              </h3>

              <p class="text-muted small mb-0">
                Download all {{ filteredMaterials.length }} matching
                materials in CSV or PDF format.
              </p>
            </div>

            <div class="d-flex flex-wrap gap-2">
              <button
                type="button"
                class="btn btn-outline-success"
                :disabled="exporting || filteredMaterials.length === 0"
                @click="exportCSV"
              >
                Export CSV
              </button>

              <button
                type="button"
                class="btn btn-outline-primary"
                :disabled="exporting || filteredMaterials.length === 0"
                @click="exportPDF"
              >
                Export PDF
              </button>
            </div>
          </div>

          <p
            v-if="exportMessage"
            class="mt-3 mb-0"
            :class="exportError ? 'text-danger' : 'text-success'"
            :role="exportError ? 'alert' : 'status'"
          >
            {{ exportMessage }}
          </p>
        </section>

        <div class="table-responsive">
          <table
            class="table table-striped table-hover align-middle recycling-table"
          >
            <caption class="visually-hidden">
              Waste disposal information by material
            </caption>

            <thead class="table-light">
              <tr>
                <th
                  v-for="column in columns"
                  :key="column.key"
                  scope="col"
                  :aria-sort="ariaSort(column.key)"
                >
                  <button
                    type="button"
                    class="btn btn-link text-dark text-decoration-none fw-bold p-0 text-start"
                    @click="sortBy(column.key)"
                  >
                    {{ column.label }}
                    {{ sortIndicator(column.key) }}
                  </button>
                </th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="item in paginatedMaterials"
                :key="item.id"
              >
                <td class="fw-semibold">
                  {{ item.material }}
                </td>

                <td>
                  <span
                    class="badge"
                    :class="
                      item.householdBin === 'Yes'
                        ? 'text-bg-success'
                        : 'text-bg-danger'
                    "
                  >
                    {{ item.householdBin }}
                  </span>
                </td>

                <td>
                  <span
                    v-if="item.binColour"
                    class="bin-indicator"
                  >
                    <span
                      class="bin-dot"
                      :class="`bin-${item.binColour}`"
                      aria-hidden="true"
                    ></span>
                    {{ item.disposalMethod }}
                  </span>

                  <span v-else>
                    {{ item.disposalMethod }}
                  </span>
                </td>

                <td>{{ item.garbageType }}</td>
                <td>{{ item.notes }}</td>
              </tr>

              <tr v-if="paginatedMaterials.length === 0">
                <td
                  colspan="5"
                  class="text-center text-muted py-4"
                >
                  No matching materials found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-3"
        >
          <p
            class="text-muted mb-0"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            Showing {{ startRow }}–{{ endRow }} of
            {{ filteredMaterials.length }} materials
          </p>

          <nav aria-label="Waste disposal table pagination">
            <ul class="pagination flex-wrap justify-content-center mb-0">
              <li
                class="page-item"
                :class="{ disabled: currentPage === 1 }"
              >
                <button
                  type="button"
                  class="page-link"
                  :disabled="currentPage === 1"
                  @click="currentPage--"
                >
                  Previous
                </button>
              </li>

              <li
                v-for="page in totalPages"
                :key="page"
                class="page-item"
                :class="{ active: currentPage === page }"
              >
                <button
                  type="button"
                  class="page-link"
                  :aria-current="
                    currentPage === page ? 'page' : undefined
                  "
                  @click="currentPage = page"
                >
                  {{ page }}
                </button>
              </li>

              <li
                class="page-item"
                :class="{ disabled: currentPage === totalPages }"
              >
                <button
                  type="button"
                  class="page-link"
                  :disabled="currentPage === totalPages"
                  @click="currentPage++"
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <RatingCard
      :current-user="currentUser"
      :get-rating-summary="getRatingSummary"
      :save-rating="saveRating"
    />

    <div class="text-center mt-4">
      <button
        type="button"
        class="btn btn-primary"
        @click="$emit('back-home')"
      >
        Back to Home
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import RatingCard from './RatingCard.vue'

defineProps({
  currentUser: { type: Object, required: true },
  getRatingSummary: { type: Function, required: true },
  saveRating: { type: Function, required: true },
})

defineEmits(['back-home'])

const materials = ref([
  {
    id: 1,
    material: 'Paper',
    householdBin: 'Yes',
    disposalMethod: 'Yellow Bin',
    binColour: 'yellow',
    garbageType: 'Paper',
    notes: 'Keep clean and dry.',
  },
  {
    id: 2,
    material: 'Cardboard',
    householdBin: 'Yes',
    disposalMethod: 'Yellow Bin',
    binColour: 'yellow',
    garbageType: 'Paper',
    notes: 'Flatten boxes before disposal.',
  },
  {
    id: 3,
    material: 'Newspapers',
    householdBin: 'Yes',
    disposalMethod: 'Yellow Bin',
    binColour: 'yellow',
    garbageType: 'Paper',
    notes: 'Remove plastic wrapping.',
  },
  {
    id: 4,
    material: 'Plastic Bottles',
    householdBin: 'Yes',
    disposalMethod: 'Yellow Bin',
    binColour: 'yellow',
    garbageType: 'Plastic',
    notes: 'Empty before disposal. Eligible drink containers may be returned through a container deposit scheme.',
  },
  {
    id: 5,
    material: 'Plastic Bags',
    householdBin: 'Yes',
    disposalMethod: 'Red Bin',
    binColour: 'red',
    garbageType: 'Soft Plastic',
    notes: 'Do not place in the yellow bin. Separate soft-plastic collection may be available locally.',
  },
  {
    id: 6,
    material: 'Glass Bottles',
    householdBin: 'Yes',
    disposalMethod: 'Purple Bin or Yellow Bin',
    binColour: 'purple',
    garbageType: 'Glass',
    notes: 'Use a purple glass bin where provided. Otherwise, check whether your council accepts glass in the yellow bin.',
  },
  {
    id: 7,
    material: 'Glass Jars',
    householdBin: 'Yes',
    disposalMethod: 'Purple Bin or Yellow Bin',
    binColour: 'purple',
    garbageType: 'Glass',
    notes: 'Empty jars. The correct bin depends on your council collection service.',
  },
  {
    id: 8,
    material: 'Aluminium Cans',
    householdBin: 'Yes',
    disposalMethod: 'Yellow Bin',
    binColour: 'yellow',
    garbageType: 'Metal',
    notes: 'Empty before disposal. Eligible drink containers may be returned through a container deposit scheme.',
  },
  {
    id: 9,
    material: 'Steel Cans',
    householdBin: 'Yes',
    disposalMethod: 'Yellow Bin',
    binColour: 'yellow',
    garbageType: 'Metal',
    notes: 'Empty and remove food residue.',
  },
  {
    id: 10,
    material: 'Batteries',
    householdBin: 'No',
    disposalMethod: 'Battery Collection Point',
    binColour: '',
    garbageType: 'Hazardous Waste',
    notes: 'Never place batteries in household bins. Use a designated battery collection service.',
  },
  {
    id: 11,
    material: 'Mobile Phones',
    householdBin: 'No',
    disposalMethod: 'E-waste Collection Point or MobileMuster',
    binColour: '',
    garbageType: 'Electronic Waste',
    notes: 'Back up and erase personal data before disposal.',
  },
  {
    id: 12,
    material: 'Computers',
    householdBin: 'No',
    disposalMethod: 'Approved E-waste Collection Point',
    binColour: '',
    garbageType: 'Electronic Waste',
    notes: 'Remove personal data before disposal.',
  },
  {
    id: 13,
    material: 'Food Scraps',
    householdBin: 'Yes',
    disposalMethod: 'Green Bin (FOGO)',
    binColour: 'green',
    garbageType: 'Organic Waste',
    notes: 'Only use the green bin for food scraps if your council provides a FOGO service. Otherwise, follow local general-waste or composting guidance.',
  },
  {
    id: 14,
    material: 'Clothing',
    householdBin: 'No',
    disposalMethod: 'Clothing Donation or Textile Collection Point',
    binColour: '',
    garbageType: 'Textile Waste',
    notes: 'Donate only clean and usable clothing. Check collection requirements for damaged textiles.',
  },
  {
    id: 15,
    material: 'Ceramics',
    householdBin: 'Yes',
    disposalMethod: 'Red Bin',
    binColour: 'red',
    garbageType: 'General Waste',
    notes: 'Wrap sharp or broken pieces safely. Do not place ceramics in glass recycling.',
  },
])

const columns = [
  { key: 'material', label: 'Material' },
  { key: 'householdBin', label: 'Household Bin?' },
  { key: 'disposalMethod', label: 'Disposal Method' },
  { key: 'garbageType', label: 'Garbage Type' },
  { key: 'notes', label: 'Additional Notes' },
]

const columnLabels = Object.fromEntries(
  columns.map((column) => [column.key, column.label])
)

const searchColumn = ref('all')
const searchQuery = ref('')
const sortColumn = ref('material')
const sortDirection = ref('asc')
const currentPage = ref(1)
const pageSize = 10

const exporting = ref(false)
const exportMessage = ref('')
const exportError = ref(false)

const filteredMaterials = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  const result = materials.value.filter((item) => {
    if (!query) return true

    if (searchColumn.value === 'all') {
      return columns.some((column) =>
        String(item[column.key] ?? '')
          .toLowerCase()
          .includes(query)
      )
    }

    return String(item[searchColumn.value] ?? '')
      .toLowerCase()
      .includes(query)
  })

  return [...result].sort((a, b) => {
    const first = String(a[sortColumn.value] ?? '')
    const second = String(b[sortColumn.value] ?? '')

    const comparison = first.localeCompare(second, undefined, {
      sensitivity: 'base',
      numeric: true,
    })

    return sortDirection.value === 'asc'
      ? comparison
      : -comparison
  })
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredMaterials.value.length / pageSize))
)

const paginatedMaterials = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredMaterials.value.slice(start, start + pageSize)
})

const startRow = computed(() =>
  filteredMaterials.value.length === 0
    ? 0
    : (currentPage.value - 1) * pageSize + 1
)

const endRow = computed(() =>
  Math.min(
    currentPage.value * pageSize,
    filteredMaterials.value.length
  )
)

watch([searchQuery, searchColumn], () => {
  currentPage.value = 1
})

watch([searchQuery, searchColumn, sortColumn, sortDirection], () => {
  exportMessage.value = ''
  exportError.value = false
})

const sortBy = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value =
      sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }

  currentPage.value = 1
}

const sortIndicator = (column) => {
  if (sortColumn.value !== column) return '↕'
  return sortDirection.value === 'asc' ? '↑' : '↓'
}

const ariaSort = (column) => {
  if (sortColumn.value !== column) return 'none'
  return sortDirection.value === 'asc'
    ? 'ascending'
    : 'descending'
}

// E.4: Shared export helpers

function exportRows() {
  return filteredMaterials.value.map((item) =>
    columns.map((column) => String(item[column.key] ?? ''))
  )
}

function exportFilename(extension) {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `waste-disposal-guide-${year}-${month}-${day}.${extension}`
}

function escapeCSV(value) {
  let text = String(value ?? '')

  // Prevent spreadsheet software from interpreting exported
  // text values as formulas.
  if (/^[\s]*[=+\-@]/.test(text)) {
    text = `'${text}`
  }

  return `"${text.replace(/"/g, '""')}"`
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename

  document.body.appendChild(link)
  link.click()
  link.remove()

  // Allow the browser time to begin the download.
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}

function exportCSV() {
  if (exporting.value || filteredMaterials.value.length === 0) return

  exporting.value = true
  exportMessage.value = ''
  exportError.value = false

  try {
    const header = columns.map((column) => column.label)
    const rows = exportRows()

    const csv = [header, ...rows]
      .map((row) => row.map(escapeCSV).join(','))
      .join('\r\n')

    // UTF-8 BOM improves compatibility with Microsoft Excel.
    const blob = new Blob(['\uFEFF', csv], {
      type: 'text/csv;charset=utf-8;',
    })

    downloadBlob(blob, exportFilename('csv'))

    exportMessage.value =
      `CSV download started for ${rows.length} materials.`
  } catch (error) {
    console.error('CSV export failed:', error)

    exportError.value = true
    exportMessage.value =
      'Unable to export CSV. Please try again.'
  } finally {
    exporting.value = false
  }
}

function exportPDF() {
  if (exporting.value || filteredMaterials.value.length === 0) return

  exporting.value = true
  exportMessage.value = ''
  exportError.value = false

  try {
    const rows = exportRows()
    const documentPDF = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = documentPDF.internal.pageSize.getWidth()
    const pageHeight = documentPDF.internal.pageSize.getHeight()

    const generatedAt = new Date().toLocaleString('en-AU')

    documentPDF.setFont('helvetica', 'bold')
    documentPDF.setFontSize(18)
    documentPDF.text('Waste Disposal Guide', 14, 18)

    documentPDF.setFont('helvetica', 'normal')
    documentPDF.setFontSize(10)
    documentPDF.text(`Generated: ${generatedAt}`, 14, 26)
    documentPDF.text(
      `Total matching materials: ${rows.length}`,
      14,
      32
    )

    const searchDescription = searchQuery.value.trim()
      ? `Search: ${columnLabels[searchColumn.value] || 'All Columns'} - ${searchQuery.value.trim()}`
      : 'Search: All materials'

    const searchLines = documentPDF.splitTextToSize(
      searchDescription,
      pageWidth - 28
    )

    documentPDF.text(searchLines, 14, 38)

    const sortDescription =
      `Sorted by: ${columnLabels[sortColumn.value]} (${sortDirection.value === 'asc' ? 'Ascending' : 'Descending'})`

    const sortY = 38 + searchLines.length * 4.5

    documentPDF.text(sortDescription, 14, sortY)

    autoTable(documentPDF, {
      startY: sortY + 7,
      head: [columns.map((column) => column.label)],
      body: rows,
      theme: 'striped',
      margin: {
        left: 14,
        right: 14,
        bottom: 20,
      },
      styles: {
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak',
        valign: 'top',
      },
      headStyles: {
        fillColor: [45, 85, 125],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 33 },
        1: { cellWidth: 27 },
        2: { cellWidth: 62 },
        3: { cellWidth: 38 },
        4: { cellWidth: 'auto' },
      },
      didDrawPage: () => {
        documentPDF.setFont('helvetica', 'normal')
        documentPDF.setFontSize(8)
        documentPDF.setTextColor(90)

        documentPDF.text(
          'General Victorian guidance. Check your local council rules.',
          14,
          pageHeight - 11
        )

        documentPDF.text(
          `Page ${documentPDF.internal.getCurrentPageInfo().pageNumber}`,
          pageWidth - 14,
          pageHeight - 11,
          { align: 'right' }
        )
      },
    })

    documentPDF.save(exportFilename('pdf'))

    exportMessage.value =
      `PDF download started for ${rows.length} materials.`
  } catch (error) {
    console.error('PDF export failed:', error)

    exportError.value = true
    exportMessage.value =
      'Unable to export PDF. Please try again.'
  } finally {
    exporting.value = false
  }
}
</script>

<style scoped>
.recycling-table {
  min-width: 1200px;
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.recycling-table thead th {
  padding: 20px 28px;
  vertical-align: middle;
  white-space: nowrap;
}

.recycling-table tbody td {
  padding: 16px 28px;
  vertical-align: middle;
  line-height: 1.6;
}

.recycling-table thead th button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.recycling-table tbody td:first-child,
.recycling-table tbody td:nth-child(2) {
  white-space: nowrap;
}

.recycling-table tbody td:nth-child(3) {
  min-width: 260px;
}

.recycling-table tbody td:nth-child(4) {
  min-width: 180px;
}

.recycling-table tbody td:nth-child(5) {
  min-width: 320px;
}

.bin-indicator {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.bin-dot {
  display: inline-block;
  width: 14px;
  height: 14px;
  min-width: 14px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.15);
}

.bin-red {
  background-color: #dc3545;
}

.bin-yellow {
  background-color: #ffc107;
}

.bin-green {
  background-color: #198754;
}

.bin-purple {
  background-color: #7952b3;
}

.export-section {
  padding: 18px;
  border: 1px solid #d5dce3;
  border-radius: 8px;
  background-color: #f8f9fa;
}
</style>
