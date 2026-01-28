<template>
  <div>
    <!-- Search and Filter Section -->
    <CRow class="mb-3">
      <CCol>
        <CCard>
          <CCardHeader>Search History</CCardHeader>
          <CCardBody>
            <CRow class="g-3">
              <CCol :md="4">
                <CFormLabel for="startDate">Start Date</CFormLabel>
                <CFormInput id="startDate" type="date" v-model="filters.startDate" />
              </CCol>
              <CCol :md="4">
                <CFormLabel for="finishDate">Finish Date</CFormLabel>
                <CFormInput id="finishDate" type="date" v-model="filters.finishDate" />
              </CCol>
              <CCol :md="4">
                <CFormLabel for="engineNumber">Engine Number</CFormLabel>
                <CFormInput id="engineNumber" type="text" v-model="filters.engineNumber" placeholder="Nomor Engine" />
              </CCol>
            </CRow>
            <hr />
            <CRow>
              <CCol :sm="2">
                <CButton :disabled="loading" style="width: 100%" color="dark" variant="outline" @click="resetFilters">Reset</CButton>
              </CCol>
              <CCol :sm="10">
                <CButton :disabled="loading" style="width: 100%" color="primary" @click="search">
                   <CSpinner component="span" size="sm" v-if="loading" />
                  Search
                </CButton>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- History Table Section -->
    <CRow>
      <CCol>
        <CCard>
          <CCardHeader>
            <strong>History Inspeksi</strong>
          </CCardHeader>
          <CCardBody>
            <!-- <CRow class="mb-3">
               <CCol :sm="2">
                <CFormLabel style="font-weight: bold;">Download</CFormLabel>
                <CButton :disabled="loading" style="width: 100%; font-weight: bold; color: white" color="success" @click="downloadExcel">Download</CButton>
              </CCol>
            </CRow> -->
            <hr/>
            <div v-if="loading && items.length === 0" class="text-center">
              <CSpinner color="primary" />
              <p>Loading data...</p>
            </div>
            <CTable v-else-if="items.length > 0" striped hover responsive bordered>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">No</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Inspection ID</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Engine Number</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Created At</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Judge ID</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Aksi</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow v-for="(item, index) in items" :key="item.uuid">
                  <CTableDataCell>{{ (pagination.currentPage - 1) * pagination.pageSize + index + 1 }}</CTableDataCell>
                  <CTableDataCell>{{ item.inspection_id }}</CTableDataCell>
                  <CTableDataCell>{{ item.engine_number }}</CTableDataCell>
                  <CTableDataCell>{{ formatDate(item.created_at) }}</CTableDataCell>
                  <CTableDataCell>{{ item.judge_id }}</CTableDataCell>
                  <CTableDataCell>
                    <CButton size="sm" color="info" @click="viewDetails(item)" style="color: white;">Lihat Detail</CButton>
                  </CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
             <CAlert color="info" v-else class="text-center">
              Tidak ada data riwayat inspeksi yang ditemukan.
            </CAlert>

            <!-- Pagination -->
            <CPagination v-if="pagination.totalPages > 1" aria-label="Page navigation">
              <CPaginationItem :disabled="pagination.currentPage === 1" @click.prevent="goToPage(1)">First</CPaginationItem>
              <CPaginationItem :disabled="pagination.currentPage === 1" @click.prevent="goToPage(pagination.currentPage - 1)">Previous</CPaginationItem>
              <CPaginationItem
                v-for="page in visiblePages"
                :key="page"
                :active="page === pagination.currentPage"
                @click.prevent="goToPage(page)"
              >
                {{ page }}
              </CPaginationItem>
              <CPaginationItem :disabled="pagination.currentPage === pagination.totalPages" @click.prevent="goToPage(pagination.currentPage + 1)">Next</CPaginationItem>
              <CPaginationItem :disabled="pagination.currentPage === pagination.totalPages" @click.prevent="goToPage(pagination.totalPages)">Last</CPaginationItem>
            </CPagination>

          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Details Modal -->
    <CModal :visible="isModalVisible" @close="() => { isModalVisible = false }" size="lg">
      <CModalHeader>
        <CModalTitle>Detail Inspeksi</CModalTitle>
      </CModalHeader>
      <CModalBody v-if="selectedItem">
        <!-- Placeholder for Inspection Image -->
        <div class="text-center mb-4">
          <img src="https://via.placeholder.com/600x400.png?text=Inspection+Image" alt="Inspection Image" class="img-fluid rounded" />
        </div>

        <!-- Basic Info -->
        <CRow>
          <CCol :sm="6">
            <dl>
              <dt>Inspection ID</dt>
              <dd>{{ selectedItem.inspection_id }}</dd>

              <dt>Engine Number</dt>
              <dd>{{ selectedItem.engine_number }}</dd>
              
            </dl>
          </CCol>
          <CCol :sm="6">
            <dl>
              <dt>Waktu Inspeksi</dt>
              <dd>{{ formatDate(selectedItem.created_at) }}</dd>

              <dt>Judge ID</dt>
              <dd>{{ selectedItem.judge_id }}</dd>
              
            </dl>
          </CCol>
        </CRow>
        
        <!-- Notes -->
        <hr/>
        <h6>Catatan Keseluruhan</h6>
        <p>{{ selectedItem.notes || 'Tidak ada catatan.' }}</p>

        <!-- Part Inspections Details -->
        <div v-if="selectedItem.part_inspections && selectedItem.part_inspections.length > 0">
          <hr/>
          <h6>Detail Inspeksi Bagian</h6>
          <CTable responsive bordered>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Gambar</CTableHeaderCell>
                <CTableHeaderCell>Nama Bagian</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell>Catatan Bagian</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="part in selectedItem.part_inspections" :key="part.part_name">
                <CTableDataCell>
                  <img :src="part.part_image_url" alt="Part Image" style="width: 100px; height: auto; border-radius: 5px;" />
                </CTableDataCell>
                <CTableDataCell>{{ part.part_name }}</CTableDataCell>
                <CTableDataCell>{{ part.part_status }}</CTableDataCell>
                <CTableDataCell>{{ part.part_notes }}</CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>
        </div>

        <!-- Harigami Details -->
        <div>
          <hr/>
          <h6>Detail Harigami</h6>
          <div v-if="detailLoading" class="text-center">
            <CSpinner color="primary" />
            <p>Loading details...</p>
          </div>
          <CAlert color="info" v-else-if="!harigamiData || harigamiData.length === 0" class="text-center">
            Tidak ada data detail harigami yang ditemukan.
          </CAlert>
          <CTable v-else responsive bordered>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Inspection ID</CTableHeaderCell>
                <CTableHeaderCell>Check ID</CTableHeaderCell>
                <CTableHeaderCell>Actual Condition</CTableHeaderCell>
                <CTableHeaderCell>Ideal Condition</CTableHeaderCell>
                <CTableHeaderCell>Created At</CTableHeaderCell>
                <CTableHeaderCell>Judge ID</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="item in harigamiData" :key="item.check_id">
                <CTableDataCell>{{ item.inspection_id }}</CTableDataCell>
                <CTableDataCell>{{ item.check_id }}</CTableDataCell>
                <CTableDataCell>{{ item.actual_condition }}</CTableDataCell>
                <CTableDataCell>{{ item.ideal_condition }}</CTableDataCell>
                <CTableDataCell>{{ formatDate(item.created_at) }}</CTableDataCell>
                <CTableDataCell>{{ item.judge_id }}</CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>
        </div>

      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" @click="() => { isModalVisible = false }">Tutup</CButton>
      </CModalFooter>
    </CModal>
  </div>
</template>

<script>
import {
  CRow, CCol, CButton, CFormLabel, CFormInput,
  CCard, CCardBody, CCardHeader, CTable, CTableHead,
  CTableBody, CTableRow, CTableHeaderCell, CTableDataCell,
  CAlert, CSpinner, CBadge, CPagination, CPaginationItem,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
} from '@coreui/vue';
import axios from 'axios';

export default {
  name: 'HistoryInspection',
  components: {
    CRow, CCol, CButton, CFormLabel, CFormInput,
    CCard, CCardBody, CCardHeader, CTable, CTableHead,
    CTableBody, CTableRow, CTableHeaderCell, CTableDataCell,
    CAlert, CSpinner, CBadge, CPagination, CPaginationItem,
    CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  },
  data() {
    return {
      allItems: [], // Holds all history items from the API
      items: [], // Holds items for the currently displayed page
      filters: {
        startDate: '',
        finishDate: '',
        engineNumber: ''
      },
      pagination: {
        currentPage: 1,
        pageSize: 10,
        totalPages: 0,
        totalRecords: 0,
      },
      loading: false,
      detailLoading: false,
      error: null,
      isModalVisible: false,
      selectedItem: null,
      harigamiData: [],
    };
  },
  computed: {
    filteredItems() {
      if (!this.allItems) return [];
      let filtered = this.allItems;

      // Engine Number Filter
      if (this.filters.engineNumber) {
        filtered = filtered.filter(item =>
          item.engine_number && item.engine_number.toLowerCase().includes(this.filters.engineNumber.toLowerCase())
        );
      }

      // Date Filter
      if (this.filters.startDate) {
         const start = new Date(this.filters.startDate);
         start.setHours(0, 0, 0, 0);
         filtered = filtered.filter(item => new Date(item.created_at_orig) >= start);
      }
      if (this.filters.finishDate) {
        const end = new Date(this.filters.finishDate);
        end.setHours(23, 59, 59, 999);
        filtered = filtered.filter(item => new Date(item.created_at_orig) <= end);
      }

      return filtered;
    },
    visiblePages() {
      const total = this.pagination.totalPages;
      const current = this.pagination.currentPage;
      const maxVisible = 5;
      if (total <= maxVisible) {
        return Array.from({ length: total }, (_, i) => i + 1);
      }
      let start = Math.max(1, current - Math.floor(maxVisible / 2));
      let end = start + maxVisible - 1;
      if (end > total) {
        end = total;
        start = Math.max(1, end - maxVisible + 1);
      }
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    },
  },
  watch: {
    // Watch for changes in filteredItems to automatically update pagination
    filteredItems() {
      this.updatePagination();
      this.goToPage(1);
    }
  },
  mounted() {
    this.fetchHistory();
  },
  methods: {
    async fetchHistory() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get('/api/history_inspection/get');
        
        if (response && response.data && Array.isArray(response.data)) {
          // Map backend data and create a parseable date for filtering/sorting
          this.allItems = response.data.map(item => {
              const [datePart, timePart] = item.created_at.split(' ');
              const [day, month, year] = datePart.split('-');
              return {
                  ...item,
                  created_at_orig: `${year}-${month}-${day}T${timePart}:00`
              };
          });
        } else {
          this.allItems = [];
          console.warn('Received unexpected data structure from API:', response.data);
        }

      } catch (err) {
        this.error = 'Gagal memuat data riwayat inspeksi dari API.';
        this.allItems = [];
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    updatePagination() {
        this.pagination.currentPage = 1;
        this.pagination.totalRecords = this.filteredItems.length;
        this.pagination.totalPages = Math.ceil(this.pagination.totalRecords / this.pagination.pageSize);
    },
    resetFilters() {
      this.filters.startDate = '';
      this.filters.finishDate = '';
      this.filters.engineNumber = '';
    },
    goToPage(page) {
      if (page >= 1 && page <= this.pagination.totalPages || this.pagination.totalPages === 0) {
        this.pagination.currentPage = page;
        const start = (this.pagination.currentPage - 1) * this.pagination.pageSize;
        const end = start + this.pagination.pageSize;
        this.items = this.filteredItems.slice(start, end);
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      // Handles the 'DD-MM-YYYY HH:MI' format from backend
      const [datePart, timePart] = dateString.split(' ');
      const [day, month, year] = datePart.split('-');
      const date = new Date(`${year}-${month}-${day}T${timePart || '00:00'}:00`);
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return date.toLocaleDateString('id-ID', options);
    },
    async viewDetails(item) {
      this.selectedItem = item;
      this.isModalVisible = true;
      this.harigamiData = [];
      this.detailLoading = true;
      try {
        const response = await axios.get(`/api/detail/get?id=${item.inspection_id}`);
        if (response && response.data && Array.isArray(response.data)) {
          this.harigamiData = response.data;
        } else {
          this.harigamiData = [];
          console.warn('Received unexpected data structure from detail API:', response.data);
        }
      } catch (err) {
        console.error('Gagal memuat detail inspeksi:', err);
        this.harigamiData = [];
      } finally {
        this.detailLoading = false;
      }
    },
    downloadExcel() {
       alert('Fungsi download Excel akan diimplementasikan.');
    },
    // The "Search" button click is now handled by reactive computed properties.
    // This method is kept for the @click handler to ensure search feels intentional.
    search() {
        this.goToPage(1);
    }
  },
};
</script>

<style scoped>
/* Custom styles can be added here */
</style>
