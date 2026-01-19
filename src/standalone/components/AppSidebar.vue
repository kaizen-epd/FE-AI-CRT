<template>
  <CSidebar position="fixed" :unfoldable="sidebarUnfoldable" :visible="sidebarVisible" :class="sidebarClass" @visible-change="
    (event) =>
      $store.commit({
        type: 'updateSidebarVisible',
        value: event,
      })
  ">
    <CSidebarBrand>
      <template v-if="showAndonText">
        <div class="sidebar-brand-text sidebar-andon-text">Robot Inspection</div>
      </template>
      <template v-else>
        <img src="../assets/brand/Toyota_logo.png" class="img-fluid sidebar-brand-full" width="200" height="200" />
        <img src="../assets/brand/Toyota_logo.png" class="sidebar-brand-narrow" width="36" height="10" />
      </template>
    </CSidebarBrand>
    <AppSidebarNav v-bind:nav="nav" />
    <CSidebarToggler id="SidebarToggler" class="d-none d-lg-flex" @click="$store.commit('toggleUnfoldable')" />
  </CSidebar>
</template>

  <script>
  import { computed } from 'vue'
  import { useStore } from 'vuex'
  import { AppSidebarNav } from './AppSidebarNav'
  import { logoNegative } from '@/standalone/assets/brand/logo-negative'
  import { sygnet } from '@/standalone/assets/brand/sygnet'
  import utils from "@/utils/CommonUtils"
  import api from "@/apis/CommonAPI"
  import navtemplate from '@/_nav.js'

  var strAuthorizedNav = '';
  var appAuthorized = {};
  const generateNav = async (newAuthorizedData, isChild) => {
    strAuthorizedNav += '[';
    let newAuthorizedDataLength = (newAuthorizedData.length)
    for (var i = 0; i < newAuthorizedDataLength; i++) {
      let currentNewAuthorizedData = newAuthorizedData[i];
      if (currentNewAuthorizedData.children && currentNewAuthorizedData.children.length > 0) {
        strAuthorizedNav += '{';
        strAuthorizedNav += ' "component": "CNavGroup",';
        strAuthorizedNav += ' "name": "' + (isChild ? '' : '') + currentNewAuthorizedData.displayText + '",';
        strAuthorizedNav += ' "to": "' + currentNewAuthorizedData.path + '",';
        strAuthorizedNav += ' "icon": "' + (currentNewAuthorizedData.icon) + '",';
        strAuthorizedNav += ' "parentId": "' + currentNewAuthorizedData.parentId + '",';
        strAuthorizedNav += ' "items": '
        generateNav(currentNewAuthorizedData.children, true);
        strAuthorizedNav += '},';
      } else {
        strAuthorizedNav += '{';
        strAuthorizedNav += ' "component": "CNavItem",';
        strAuthorizedNav += ' "name": "' + (isChild ? '' : '') + currentNewAuthorizedData.displayText + '",';
        strAuthorizedNav += ' "to": "' + currentNewAuthorizedData.path + '",';
        strAuthorizedNav += ' "icon": "' + (currentNewAuthorizedData.icon) + '",';
        strAuthorizedNav += ' "parentId": "' + currentNewAuthorizedData.parentId + '",';
        strAuthorizedNav += ' "applicationId": "' + currentNewAuthorizedData.applicationId + '",';
        strAuthorizedNav += ' "linkProps": { "queryParams": { "applicationId": "' + currentNewAuthorizedData.applicationId
          + '", "functionId": "' + currentNewAuthorizedData.functionId + '" } }';
        strAuthorizedNav += '},';
      }
    }
    strAuthorizedNav += ']';
  }

  export default {
    name: 'AppSidebar',
    components: {
      AppSidebarNav,
    },
    computed: {
      sidebarClass() {
        // Check if device is mobile
        const isMobile = window.innerWidth <= 768;
        return isMobile ? 'custom-mobile-bg' : '';
      }
    },
    data() {
      return {
        showAndonText: false,
        nav: [
          {
            component: 'CNavItem',
            to: '/app/RobotInspection',
            name: 'Robot Inspection',
            icon: 'cilSpeedometer',
            parentId: 'ROOT',
          },
          {
            component: 'CNavItem',
            to: '/app/CameraSettings',
            name: 'Camera Settings',
            icon: 'cilCameraControl',
            parentId: 'ROOT',
          },
          {
            component: 'CNavItem',
            to: '/app/CollectingSample',
            name: 'Collecting Sample',
            icon: 'cilCamera',
            parentId: 'ROOT',
          },
          {
            component: 'CNavItem',
            to: '/app/InspectionClass',
            name: 'Inspection Class',
            icon: 'cilBrowser',
            parentId: 'ROOT',
          },
          {
            component: 'CNavItem',
            to: '/app/HistoryInspection',
            name: 'History Inspection',
            icon: 'cilHistory',
            parentId: 'ROOT',
          },
          {
            component: 'CNavItem',
            to: '/app/TestModel',
            name: 'Test Model',
            icon: 'cilAppsSettings',
            parentId: 'ROOT',
          },
        ],
      }
    },
    setup() {
      const store = useStore()
      return {
        logoNegative,
        sygnet,
        sidebarUnfoldable: computed(() => store.state.sidebarUnfoldable),
        sidebarVisible: computed(() => store.state.sidebarVisible),
      }
    },
    // async created() {
    //   let authorizedView = await api.scQueryApi('/api/common/menu-authorized', 'POST', '');
    //   strAuthorizedNav = '';
    //   if (authorizedView.data) {
    //     await generateNav(authorizedView.data.children)
    //     let jsonAuthorizedNavJSON = JSON.parse('{"value": ' + strAuthorizedNav.replaceAll('},]', '}]') + '}');

    //     //this.nav = this.nav.concat(jsonAuthorizedNavJSON.value);
    //     // this.nav=navtemplate;
    //   }
    //   setInterval(async () => {
    //     let authorizedView = await api.scQueryApi('/api/common/user-info', 'POST', '');
    //   }, 60 * 1000);

    //   //this.$router.push('/dc/dashboard');
    // }
    methods: {
      async fetchDataFrontend() {
        try {

          console.log('[FE fetchDataFrontend1] Starting API call...');
          const frontendResponse = await api.get('/smartandon/frontend');

          console.log('[FE fetchDataFrontend1] API response received:', frontendResponse.data);

          if (frontendResponse.data && Array.isArray(frontendResponse.data) && frontendResponse.data.length > 0) {
            console.log('[FE fetchDataFrontend1] First item of frontend data:', frontendResponse.data[0]);

            if (frontendResponse.data[0].frontend === 1) {
              this.showAndonText = true;
            } else {
              this.showAndonText = false;
            }
          } else {
            
            console.warn('[FE fetchDataFrontend1] No valid data array in response');
            this.showAndonText = false;
          }
        } catch (error) {
          console.error('[FE fetchDataFrontend1] Error fetching frontend data:', error);
          console.error('[FE fetchDataFrontend1] Error details:', error.response?.data || error.message);
          this.showAndonText = false;
        }
      },
    },
    mounted() {
      this.fetchDataFrontend();
      this.fetchInterval = setInterval(() => {
        this.fetchDataFrontend();
      }, 20 * 60 * 1000); // 20 minutes interval
    },
    beforeUnmount() {
      if (this.fetchInterval) {
        clearInterval(this.fetchInterval);
      }
    },
  }
  </script>

<style scoped>
  .sidebar-andon-text {
    font-size: 24px;
    font-weight: 800;
    font-family: 'Inter', sans-serif;
    padding-left: 15px;
    width: 100%;
  }
</style>
