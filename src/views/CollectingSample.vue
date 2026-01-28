<template>
  <CCard>
    <CCardBody>
      <CRow>
        <CCol>

          <CContainer class="my-4">
            <h1 class="text-center mb-4">Ambil Gambar Sampel (Dataset AI)</h1>
        
            <div>
              <CRow class="justify-content-center mb-3">
                <CCol md="6">
                  <CFormLabel for="camera-select">Pilih Kamera:</CFormLabel>
                  <CFormSelect
                    id="camera-select"
                    v-model="selectedCamera"
                    @change="handleCameraChange"
                    :options="cameraOptions"
                    :disabled="isAnyCaptureRunning"
                  />
                </CCol>
              </CRow>
        
              <CRow class="justify-content-center mb-4">
                <CCol lg="8" md="10">
                  <div class="camera-box">
                    <img v-if="streamUrl" :src="streamUrl" class="camera-feed" alt="Camera Feed" />
                    <div v-else class="placeholder">
                      <span>Kamera tidak aktif</span>
                    </div>
                  </div>
                </CCol>
              </CRow>
        
              <CRow class="justify-content-center mb-4">
                <CCol md="12" class="text-center">
                  <CButton color="primary" size="lg" class="m-2" @click="openCaptureModal">
                    <CIcon name="cil-settings" class="me-2" /> Capture Menu {{ isAnyCaptureRunning ? '(Running)' : '' }}
                  </CButton>
                </CCol>
              </CRow>
            </div>
        
            <CCard v-if="capturedImages.length > 0" class="mt-4">
              <CCardHeader>
                <CRow class="align-items-center">
                  <CCol>
                    <strong>Galeri Gambar ({{ capturedImages.length }} gambar)</strong>
                  </CCol>
                  <CCol class="text-end">
                    <CButton color="primary" size="sm" @click="openSaveModal" class="me-2">
                      Save All
                    </CButton>
                    <CButton color="secondary" size="sm" @click="clearImages">
                      Bersihkan Galeri
                    </CButton>
                  </CCol>
                </CRow>
              </CCardHeader>
              <CCardBody>
                <CRow class="image-gallery g-3">
                  <CCol v-for="(image, index) in capturedImages" :key="index" xs="6" sm="4" md="3" lg="2">
                    <div class="image-container">
                      <img :src="image" alt="Gambar hasil tangkapan" class="captured-image" />
                      <CButton color="danger" size="sm" class="delete-btn" @click="deleteImage(index)">
                        <CIcon name="cil-trash" />
                      </CButton>
                    </div>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
        
            <canvas ref="canvasElement" style="display: none;"></canvas>
        
          </CContainer>
        </CCol>
      </CRow>
    </CCardBody>
  </CCard>
  
  <!-- Unified Capture Modal -->
  <CModal :visible="isCaptureModalVisible" @close="closeCaptureModal" size="lg">
    <CModalHeader>
      <CModalTitle>Capture Options</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CNav variant="tabs" role="tablist">
        <CNavItem>
          <CNavLink href="javascript:void(0);" :active="activeTab === 'manual'" @click="activeTab = 'manual'">
            Manual
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink href="javascript:void(0);" :active="activeTab === 'interval'" @click="activeTab = 'interval'">
            Interval {{ isIntervalRunning ? '(Running)' : '' }}
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink href="javascript:void(0);" :active="activeTab === 'rapid'" @click="activeTab = 'rapid'">
            Rapid {{ isRapidCollecting ? '(Running)' : '' }}
          </CNavLink>
        </CNavItem>
      </CNav>
      <CTabContent class="p-4 border border-top-0 rounded-bottom text-center">
        <CTabPane role="tabpanel" :visible="activeTab === 'manual'">
          <p>Ambil gambar satu per satu.</p>
          <CButton color="primary" @click="takePicture" :disabled="isAnyCaptureRunning">
            <CIcon name="cil-camera" class="me-2" /> Ambil Gambar
          </CButton>
        </CTabPane>
        <CTabPane role="tabpanel" :visible="activeTab === 'interval'">
          <p>Ambil gambar tanpa batas sampai dihentikan.</p>
          <div class="mb-3">
            <CFormLabel for="interval-time" class="d-inline me-2">Interval (detik):</CFormLabel>
            <CFormInput id="interval-time" type="number" v-model.number="intervalTime" min="1" :disabled="isAnyCaptureRunning" style="max-width: 100px; display: inline-block;" />
          </div>
          <CButton color="success" @click="startIntervalCapture" :disabled="isAnyCaptureRunning" class="me-2" style="color: white;">
            Mulai
          </CButton>
          <CButton :color="isIntervalRunning ? 'danger' : 'dark'" @click="stopIntervalCapture" :disabled="!isIntervalRunning" style="color: white;">
            Hentikan
          </CButton>
        </CTabPane>
        <CTabPane role="tabpanel" :visible="activeTab === 'rapid'">
          <p>Ambil gambar dengan interval dan batas jumlah.</p>
          <div class="mb-3">
            <CFormLabel for="rapid-interval" class="d-inline me-2">Interval:</CFormLabel>
            <CFormInput id="rapid-interval" type="number" v-model.number="rapidCollectInterval" min="1" :disabled="isAnyCaptureRunning" style="max-width: 80px; display: inline-block;" class="me-3" />
            <CFormLabel for="rapid-limit" class="d-inline me-2">Batas:</CFormLabel>
            <CFormInput id="rapid-limit" type="number" v-model.number="rapidCollectLimit" min="1" :disabled="isAnyCaptureRunning" style="max-width: 80px; display: inline-block;" />
          </div>
          <CButton color="info" @click="startRapidCollect" :disabled="isAnyCaptureRunning" style="color: white;">
            Mulai Rapid Collect
          </CButton>
          <CButton :color="isRapidCollecting ? 'danger' : 'dark'" @click="stopRapidCollect" :disabled="!isRapidCollecting" class="ms-2" style="color: white;">
            Hentikan
          </CButton>
        </CTabPane>
      </CTabContent>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" @click="closeCaptureModal">Tutup</CButton>
    </CModalFooter>
  </CModal>

  <CModal :visible="isSaveModalVisible" @close="closeSaveModal">
    <CModalHeader>
      <CModalTitle>Save All Images</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="mb-3">
        <CFormLabel for="name-input">Nama Format</CFormLabel>
        <CFormInput id="name-input" v-model="saveName" />
      </div>
      <div class="mb-3">
        <CFormLabel for="save-option">Opsi Simpan</CFormLabel>
        <CFormSelect id="save-option" v-model="saveOption" :options="['default', 'new']" />
      </div>
      <div v-if="saveOption === 'new'" class="mb-3">
        <CFormLabel for="new-folder-name">Nama Folder Baru</CFormLabel>
        <CFormInput id="new-folder-name" v-model="newFolderName" />
      </div>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" @click="closeSaveModal">Cancel</CButton>
      <CButton color="primary" @click="saveAllImages">Save</CButton>
    </CModalFooter>
  </CModal>
</template>

<script>
import { 
  CContainer, CRow, CCol, CButton, CAlert, CFormLabel, CFormSelect, 
  CFormInput, CCard, CCardBody, CCardTitle, CCardText, CCardHeader,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CNav, CNavItem, CNavLink, CTabContent, CTabPane
} from '@coreui/vue';
import { CIcon } from '@coreui/icons-vue';
import api from '../apis/CommonAPI';

export default {

  name: 'CollectingSample',

  components: {
    CContainer, CRow, CCol, CButton, CAlert, CFormLabel, CFormSelect, 
    CFormInput, CCard, CCardBody, CCardTitle, CCardText, CCardHeader,
    CIcon,
    CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
    CNav, CNavItem, CNavLink, CTabContent, CTabPane
  },
  
  data() {
    return {
      cameras: [],
      rawCameras: [],
      selectedCamera: null,
      streamUrl: null,
      capturedImages: [],
      
      // Interval Capture Data
      intervalTime: 5,
      intervalId: null,
      isIntervalRunning: false,

      // Rapid Collect Data
      rapidCollectInterval: 1,
      rapidCollectLimit: 10,
      rapidIntervalId: null,
      isRapidCollecting: false,

      // Save All Modal
      isSaveModalVisible: false,
      saveName: '',
      saveOption: 'default',
      newFolderName: '',

      // Feature Modals
      isCaptureModalVisible: false,
      activeTab: 'manual',
    };
  },
  computed: {
    cameraOptions() {
      return this.cameras.map(cam => ({
        value: cam.value,
        label: cam.label
      }));
    },
    isAnyCaptureRunning() {
      return this.isIntervalRunning || this.isRapidCollecting;
    }
  },
  mounted() {
    this.fetchCameraList();
  },
  beforeDestroy() {
    this.stopCamera();
  },
  methods: {
    async fetchCameraList() {
      try {
        const response = await api.get('/camData/get');
        const responseData = response.data;
        this.rawCameras = Array.isArray(responseData) ? responseData : [];

        this.cameras = this.rawCameras.map(cam => ({
          label: cam.cam_nm,
          value: cam.cam_id
        }));

        if (this.cameras.length > 0) {
          // Default ke kamera pertama jika belum ada yang dipilih
          if (!this.selectedCamera) {
            this.selectedCamera = this.cameras[0].value;
            this.startCamera();
          }
        }
      } catch (error) {
        console.error('Error fetching camera list:', error);
      }
    },
    startCamera() {
      // Menggunakan stream dari backend
      const camIndex = this.selectedCamera ? this.selectedCamera : 0;
      // Tambahkan timestamp untuk mencegah caching
      this.streamUrl = `/camera/stream?index=${camIndex}&t=${new Date().getTime()}`;
    },
    handleCameraChange() {
      this.startCamera();
    },
    stopCamera() {
      this.stopIntervalCapture();
      this.stopRapidCollect();
      this.streamUrl = null;
    },
    async takePicture() {
      try {
        // Mengambil snapshot dari backend endpoint
        const response = await api.get('/camera/snapshot', { responseType: 'blob' });
        const imageUrl = URL.createObjectURL(response.data);
        
        // Konversi blob ke base64 agar konsisten dengan logika penyimpanan yang ada
        const reader = new FileReader();
        reader.readAsDataURL(response.data);
        reader.onloadend = () => {
            this.capturedImages.unshift(reader.result);
        };
      } catch (error) {
        console.error('Gagal mengambil snapshot:', error);
      }
    },
    startIntervalCapture() {
      if (this.isAnyCaptureRunning) return;
      
      this.isIntervalRunning = true;
      this.takePicture(); 
      this.intervalId = setInterval(this.takePicture, this.intervalTime * 1000);
    },
    stopIntervalCapture() {
      if (!this.isIntervalRunning) return;

      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isIntervalRunning = false;
    },
    startRapidCollect() {
      if (this.isAnyCaptureRunning) return;

      this.isRapidCollecting = true;
      let captureCount = 0;

      this.rapidIntervalId = setInterval(() => {
        if (captureCount >= this.rapidCollectLimit) {
          this.stopRapidCollect();
          return;
        }
        
        this.takePicture();
        captureCount++;

        if (captureCount >= this.rapidCollectLimit) {
          this.stopRapidCollect();
        }
      }, this.rapidCollectInterval * 1000);
    },
    stopRapidCollect() {
      if (!this.isRapidCollecting) return;

      clearInterval(this.rapidIntervalId);
      this.rapidIntervalId = null;
      this.isRapidCollecting = false;
    },
    clearImages() {
      this.capturedImages = [];
    },
    deleteImage(index) {
      this.capturedImages.splice(index, 1);
    },
    openSaveModal() {
      this.isSaveModalVisible = true;
    },
    closeSaveModal() {
      this.isSaveModalVisible = false;
    },
    saveAllImages() {
      if (!this.saveName.trim()) {
        alert('Nama file tidak boleh kosong.');
        return;
      }

      const payload = {
        saveName: this.saveName,
        saveOption: this.saveOption,
        newFolderName: this.newFolderName,
        images: this.capturedImages
      };

      api.post('/camera/save-samples', payload)
        .then(response => {
          alert(response.data.message);
          this.closeSaveModal();
          // Opsional: Bersihkan galeri setelah sukses disimpan
          // this.clearImages();
        })
        .catch(error => {
          console.error('Gagal menyimpan gambar:', error);
          alert('Gagal menyimpan gambar ke server.');
        });
    },
    openCaptureModal() { this.isCaptureModalVisible = true; },
    closeCaptureModal() { this.isCaptureModalVisible = false; },
  },
};
</script>

<style scoped>
.camera-box {
  position: relative;
  width: 100%;
  background-color: #000;
  border-radius: var(--cui-border-radius);
  overflow: hidden;
  border: 1px solid var(--cui-border-color);
}

.camera-feed {
  width: 100%;
  height: auto;
  display: block;
}

.placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 1.2rem;
}

.image-gallery {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 10px; /* for scrollbar */
}

.captured-image {
  width: 100%;
  height: auto;
  border-radius: var(--cui-border-radius);
  border: 1px solid var(--cui-border-color);
  display: block;
}

.image-container {
  position: relative;
}

.delete-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  opacity: 0;
  transition: opacity 0.3s ease;
  padding: 0.2rem 0.4rem;
  font-size: 0.8rem;
}

.image-container:hover .delete-btn {
  opacity: 1;
}
</style>
