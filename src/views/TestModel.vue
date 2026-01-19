<template>
  <CRow>
    <CCol md="8">
      <CCard class="mb-4">
        <CCardHeader>
          <strong>Live Stream</strong>
        </CCardHeader>
        <CCardBody>
          <p>Streaming from: <code>{{ streamUrl }}</code></p>
          <img :src="streamUrl" alt="Live Stream" class="stream-image" @error="streamError" />
          <div v-if="hasError" class="alert alert-danger mt-3">
            Failed to load stream. Please ensure the stream server is running and the URL is correct.
          </div>
        </CCardBody>
      </CCard>
    </CCol>
    <CCol md="4">
      <CCard>
        <CCardHeader>
          <strong>Stream Parameters</strong>
        </CCardHeader>
        <CCardBody>
          <CForm>
            <div class="mb-3">
              <CFormLabel for="baseUrl">Base URL</CFormLabel>
              <CFormInput id="baseUrl" type="text" v-model="baseUrl" />
            </div>
            <div class="mb-3">
              <CFormLabel for="camIdx">Camera Index (cam_idx)</CFormLabel>
              <CFormInput id="camIdx" type="number" v-model="camIdx" />
            </div>
            <div class="mb-3">
              <CFormLabel for="models">Models</CFormLabel>
              <CFormInput id="models" type="text" v-model="models" />
            </div>
          </CForm>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script>
import { CCard, CCardHeader, CCardBody, CRow, CCol, CForm, CFormLabel, CFormInput } from '@coreui/vue';

export default {
  name: 'TestModel',
  components: {
    CCard,
    CCardHeader,
    CCardBody,
    CRow,
    CCol,
    CForm,
    CFormLabel,
    CFormInput
  },
  data() {
    return {
      baseUrl: 'http://127.0.0.1:5000/test/stream',
      camIdx: 0,
      models: 'yolo11n.pt',
      hasError: false,
    };
  },
  computed: {
    streamUrl() {
      // Re-trigger error check when URL changes
      this.hasError = false;
      const params = new URLSearchParams({
        cam_idx: this.camIdx,
        models: this.models,
      }).toString();
      return `${this.baseUrl}?${params}`;
    },
  },
  methods: {
    streamError() {
      this.hasError = true;
    }
  }
};
</script>

<style scoped>
.stream-image {
  width: 100%;
  height: auto;
  background-color: #000;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
}
</style>