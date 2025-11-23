const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/LoginPage.vue') }],
  },
  {
    path: '/home',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/HomePage.vue') }],
  },
  {
    path: '/settings',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/SettingsPage.vue') }],
  },
  {
    path: '/mark-bought',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/MarkBoughtPage.vue') }],
  },
  {
    path: '/redeem',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/RedeemCommissionPage.vue') }],
  },
  {
    path: '/scan-verify',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/ScanVerifyPage.vue') }],
  },
  {
    path: '/ai-insights',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/PainterInsightsPage.vue') }],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('src/pages/errors/ErrorNotFound.vue'),
  },
]

export default routes
