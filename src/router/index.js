import { createRouter, createWebHashHistory } from 'vue-router'

import DefaultLayout from '@/layouts/DefaultLayout'
import DefaultLayoutStandAlone from '@/standalone/layouts/DefaultLayoutStandAlone'

// Route groups
const appRoutes = [
  {
    path: '/app/dashboard',
    name: 'Dashboard',
    component: () =>
      import(/* webpackChunkName: "dashboard" */ '@/views/Dashboard.vue'),
    meta: {
      requiresAuth: true,
      title: 'Dashboard',
    },
  },
  
  {
    path: '/app/RobotInspection',
    name: 'Robot Inspection',
    component: () =>
      import(
        /* webpackChunkName: "reports" */ '@/views/RobotInspection.vue'
      ),
    meta: {
      requiresAuth: true,
      title: 'Robot Inspection',
    },
  },

  {
    path: '/app/CameraSettings',
    name: 'Camera Settings',
    component: () =>
      import(
        /* webpackChunkName: "reports" */ '@/views/CameraSettings.vue'
      ),
    meta: {
      requiresAuth: true,
      title: 'Camera Settings',
    },
  },

  {
    path: '/app/CollectingSample',
    name: 'Collecting Sample',
    component: () =>
      import(
        /* webpackChunkName: "reports" */ '@/views/CollectingSample.vue'
      ),
    meta: {
      requiresAuth: true,
      title: 'Collecting Sample',
    },
  },

  {
    path: '/app/InspectionClass',
    name: 'Inspection Class',
    component: () =>
      import(
        /* webpackChunkName: "reports" */ '@/views/InspectionClass.vue'
      ),
    meta: {
      requiresAuth: true,
      title: 'Inspection Class',
    },
  },

  {
    path: '/app/HistoryInspection',
    name: 'History Inspection',
    component: () =>
      import(
        /* webpackChunkName: "reports" */ '@/views/HistoryInspection.vue'
      ),
    meta: {
      requiresAuth: true,
      title: 'History Inspection',
    },
  },

  {
    path: '/app/TestModel',
    name: 'Test Model',
    component: () =>
      import(
        /* webpackChunkName: "reports" */ '@/views/TestModel.vue'
      ),
    meta: {
      requiresAuth: true,
      title: 'Test Model',
    },
  },
]

const authRoutes = [
  {
    path: '/auth/register',
    name: 'Register',
    component: () =>
      import(/* webpackChunkName: "reports" */ '@/views/Register/Register.vue'),
    meta: {
      title: 'Register',
    },
  },
  {
    path: '/auth/login',
    name: 'Login',
    component: () =>
      import(/* webpackChunkName: "reports" */ '@/views/Login/Login.vue'),
    meta: {
      title: 'Login',
    },
  },
]

// Error pages
const errorRoutes = [
  {
    path: '/404',
    name: 'Page404',
    component: () =>
      import(/* webpackChunkName: "error-404" */ '@/views/pages/Page404'),
    meta: { title: 'Page Not Found' },
  },
  {
    path: '/500',
    name: 'Page500',
    component: () =>
      import(/* webpackChunkName: "error-500" */ '@/views/pages/Page500'),
    meta: { title: 'Server Error' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
]

const isStandalone = process.env.VUE_APP_STANDALONE_SINGLE_SPA === 'true'
console.log('Stand alone single SPA: ', isStandalone)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: isStandalone ? DefaultLayoutStandAlone : DefaultLayout,
    redirect: '/app/RobotInspection',
    children: [...appRoutes],
  },
  ...authRoutes,
  ...errorRoutes,
]

const isTokenExpired = (token) => {
  if (!token) return true
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (!payload.exp) return false
    return Date.now() >= payload.exp * 1000
  } catch (e) {
    return true
  }
}

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
  scrollBehavior() {
    // always scroll to top
    return { top: 0 }
  },
})

// Navigation guards for authentication
router.beforeEach((to, from, next) => {
  // Update document title
  if (to.meta.title) {
    document.title = `Robot Inspection - ${to.meta.title}`
  }

  /*
  const token = localStorage.token
  const isLoggedIn = !!token && token !== '' && !isTokenExpired(token)
  if (token && isTokenExpired(token)) {
    localStorage.removeItem('token')
  }
  // Redirect to login only if route requires auth and not logged in
  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: 'Login' })
    return
  }
  // Prevent logged in user from accessing login/register
  if ((to.name === 'Login' || to.name === 'Register') && isLoggedIn) {
    next({ name: 'Dashboard' })
    return
  }
  */
  next()
})

export default router
