<template>
  <div>
    <CRow>
      <!-- Camera Feed Column -->
      <CCol :md="7">
        <CCard class="mb-4">
          <CCardHeader>
            <h5>Live Camera Feed</h5>
          </CCardHeader>
          <CCardBody class="p-0">
            <img v-if="streamUrl" :src="streamUrl" class="camera-feed" alt="Camera Feed" />
            <div v-if="cameraError" class="alert alert-danger m-3">
              <strong>Error:</strong> {{ cameraError }}
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <!-- Settings Column -->
      <CCol :md="5">
        <CCard class="mb-4">
          <CCardHeader>
            <CRow>
              <CCol>
                <h6>Camera Settings</h6>
              </CCol>
            </CRow>
          </CCardHeader>
          <CCardBody class="settings-body">
            <CForm>
              <div class="mb-3">
                <CFormLabel for="camera-select">Select Camera</CFormLabel>
                <CFormSelect id="camera-select" v-model="selectedCamera" @change="handleCameraChange" :options="cameras"></CFormSelect>
              </div>

              <div class="d-grid gap-2 d-md-flex justify-content-md-start mb-3">
                <CButton v-if="!isEditing" color="primary" @click="editSettings" size="sm">
                  Edit
                </CButton>
                <template v-if="isEditing">
                  <CButton color="primary" @click="saveSettings" size="sm" :disabled="!isDirty">
                    Save
                  </CButton>
                  <CButton color="secondary" @click="resetToDefaults" size="sm">
                    Reset
                  </CButton>
                </template>
              </div>

              <!-- Dynamically generate controls -->
              <div v-for="control in controls" :key="control.name" class="mb-2">
                <CRow>
                  <CFormLabel :for="control.name" class="col-sm-5 col-form-label col-form-label-sm text-capitalize">
                    {{ control.name.replace(/_/g, ' ') }}
                    <span v-if="control.type === 'int'"> ({{ control.value }})</span>
                  </CFormLabel>
                  <CCol :sm="7">
                    <!-- Slider for Integer type -->
                    <CFormRange
                      v-if="control.type === 'int'"
                      :id="control.name"
                      :min="control.min"
                      :max="control.max"
                      :step="control.step"
                      v-model="control.value"
                      :disabled="!isEditing || (control.flags && control.flags.includes('inactive'))"
                      size="sm"
                    />
                    <!-- Switch for Boolean type -->
                    <CFormCheck
                      v-if="control.type === 'bool'"
                      :id="control.name"
                      v-model="control.value"
                      switch
                      :disabled="!isEditing || (control.flags && control.flags.includes('inactive'))"
                    />
                    <!-- Select for Menu type -->
                    <CFormSelect
                      v-if="control.type === 'menu'"
                      :id="control.name"
                      v-model="control.value"
                      :disabled="!isEditing || (control.flags && control.flags.includes('inactive'))"
                      size="sm"
                    >
                      <option v-for="option in control.options" :key="option.value" :value="option.value">
                        {{ option.label }}
                      </option>
                    </CFormSelect>
                  </CCol>
                </CRow>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </div>
</template>

<script>
import { CRow, CCol, CCard, CCardHeader, CCardBody, CButton, CForm, CFormLabel, CFormSelect, CFormRange, CFormCheck } from '@coreui/vue';
import api from '../apis/CommonAPI';

export default {
  name: 'CameraSettings',
  components: {
    CRow,
    CCol,
    CCard,
    CCardHeader,
    CCardBody,
    CButton,
    CForm,
    CFormLabel,
    CFormSelect,
    CFormRange,
    CFormCheck,
  },
  data() {
    return {
      isEditing: false,
      cameraError: null,
      controls: [],
      originalControls: [], // To store default values for reset
      cameras: [],
      rawCameras: [],
      selectedCamera: '',
      previousSelectedCamera: '',
      isDirty: false,
      streamUrl: null,
    };
  },
  watch: {
    selectedCamera() {
      this.loadCameraSettings();
    },
    controls: {
      handler() {
        this.isDirty = true;
      },
      deep: true,
    },
  },
  methods: {
    editSettings() {
      this.isEditing = true;
    },
    async initializeCamera() {
      // Clean up any existing stream
      this.stopCameraStream();
      // Menggunakan stream dari backend agar sesuai dengan kamera robot
      // Tambahkan timestamp untuk mencegah caching browser saat refresh stream
      // Tambahkan parameter index kamera yang dipilih
      const camIndex = this.selectedCamera ? this.selectedCamera : 0;
      this.streamUrl = `/camera/stream?index=${camIndex}&t=${new Date().getTime()}`;
      this.cameraError = null;
    },
    stopCameraStream() {
      this.streamUrl = null;
    },
    async fetchCameraList() {
      try {
        const response = await api.get('/camData/get');
        // Data dari getData_camera berupa list of dicts
        const responseData = response.data;
        console.log('Fetched Camera Controller Data:', responseData);
        this.rawCameras = Array.isArray(responseData) ? responseData : [];

        this.cameras = this.rawCameras.map(cam => ({
          label: cam.cam_nm,
          value: cam.cam_id
        }));

        if (this.cameras.length > 0) {
          // Set default jika belum ada yang dipilih atau pilihan saat ini tidak valid
          if (!this.selectedCamera || !this.cameras.find(c => c.value == this.selectedCamera)) {
            this.selectedCamera = this.cameras[0].value;
            this.previousSelectedCamera = this.cameras[0].value;
          }
        }
      } catch (error) {
        console.error('Error fetching camera list:', error);
        this.cameraError = "Gagal mengambil daftar kamera.";
      }
    },
    loadCameraSettings() {
        // Gunakan loose equality (==) untuk menangani ID string dari select vs int dari DB
        const camera = this.rawCameras.find(c => c.cam_id == this.selectedCamera);
        
        if (!camera) return;

        let settings = {};
        if (camera && camera.config) {
            // Parse jika config masih berupa string JSON, jika sudah object gunakan langsung
            settings = typeof camera.config === 'string' ? JSON.parse(camera.config) : camera.config;
        }
        
        const cameraControlsData = [
            { name: 'brightness', type: 'int', min: 0, max: 255, step: 1, default: 128 },
            { name: 'contrast', type: 'int', min: 0, max: 255, step: 1, default: 128 },
            { name: 'saturation', type: 'int', min: 0, max: 255, step: 1, default: 128 },
            { name: 'white_balance_automatic', type: 'bool', default: true },
            { name: 'gain', type: 'int', min: 0, max: 255, step: 1, default: 0 },
            { name: 'power_line_frequency', type: 'menu', min: 0, max: 2, default: 2, options: [
                { value: 0, label: 'Disabled' },
                { value: 1, label: '50 Hz' },
                { value: 2, label: '60 Hz' },
            ]},
            { name: 'white_balance_temperature', type: 'int', min: 2000, max: 7500, step: 10, default: 4000, flags: 'inactive' },
            { name: 'sharpness', type: 'int', min: 0, max: 255, step: 1, default: 128 },
            { name: 'backlight_compensation', type: 'int', min: 0, max: 1, step: 1, default: 1 },
            { name: 'auto_exposure', type: 'menu', min: 0, max: 3, default: 3, options: [
                { value: 0, label: 'Manual Mode' },
                { value: 1, label: 'Auto Mode' },
                { value: 2, label: 'Shutter Priority Mode' },
                { value: 3, label: 'Aperture Priority Mode' },
            ]},
            { name: 'exposure_time_absolute', type: 'int', min: 3, max: 2047, step: 1, default: 250, flags: 'inactive' },
            { name: 'exposure_dynamic_framerate', type: 'bool', default: false },
            { name: 'pan_absolute', type: 'int', min: -36000, max: 36000, step: 3600, default: 0 },
            { name: 'tilt_absolute', type: 'int', min: -36000, max: 36000, step: 3600, default: 0 },
            { name: 'focus_absolute', type: 'int', min: 0, max: 255, step: 5, default: 0, flags: 'inactive' },
            { name: 'focus_automatic_continuous', type: 'bool', default: true },
            { name: 'zoom_absolute', type: 'int', min: 100, max: 500, step: 1, default: 100 },
      ];

      const processedControls = cameraControlsData.map(control => {
        const settingValue = settings[control.name];
        control.value = settingValue !== undefined ? settingValue : control.default;

        if (control.type === 'bool') {
          control.value = !!control.value;
          control.default = !!control.default;
        }
        if (control.type === 'int' || control.type === 'menu') {
          control.value = Number(control.value);
          control.default = Number(control.default);
        }
        if(control.type === 'int') {
           control.min = Number(control.min);
           control.max = Number(control.max);
           control.step = Number(control.step);
        }
        return control;
      });
      
      this.$nextTick(() => {
        this.controls = JSON.parse(JSON.stringify(processedControls));
        this.originalControls = JSON.parse(JSON.stringify(processedControls));
        this.isDirty = false;
      });
    },
    async saveSettings() {
        const cameraToSave = this.selectedCamera;
        const settingsToSave = this.controls.reduce((acc, control) => {
            if (control.type === 'int' || control.type === 'menu') {
              acc[control.name] = Number(control.value);
            } else {
              acc[control.name] = control.value;
            }
            return acc;
        }, {});

        try {
            await api.put('/camData/update', {
                cam_id: cameraToSave,
                config: settingsToSave,
            });
            await this.fetchCameraList(); // Refresh settings
            this.isDirty = false;
            this.isEditing = false;
        } catch (error) {
            console.error('Error saving settings:', error);
            this.cameraError = 'Gagal menyimpan pengaturan.';
        }
    },
    resetToDefaults() {
      this.controls = JSON.parse(JSON.stringify(this.originalControls));
      this.isDirty = false;
      this.isEditing = false;
    },
    handleCameraChange() {
      this.previousSelectedCamera = this.selectedCamera;
      this.isEditing = false;
      this.initializeCamera(); // Restart stream saat kamera berubah
    },
  },
  mounted() {
    this.fetchCameraList();
    this.initializeCamera();
  },
  beforeUnmount() {
    this.stopCameraStream();
  },
};
</script>

<style scoped>
.camera-feed {
  width: 100%;
  height: auto;
  background-color: #000;
  border-radius: var(--cui-card-inner-border-radius);
}
.settings-body {
  max-height: 500px; /* Adjust as needed */
  overflow-y: auto;
}
.text-capitalize {
  text-transform: capitalize;
}
</style>
