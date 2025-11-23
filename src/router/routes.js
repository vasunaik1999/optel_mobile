const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/LoginPage.vue') }],
  },
  {
    path: '/home',
    meta: { requiresAuth: true },
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
    meta: { requiresAuth: true },
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/MarkBoughtPage.vue') }],
  },
  {
    path: '/redeem',
    meta: { requiresAuth: true },
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/RedeemCommissionPage.vue') }],
  },
  {
    path: '/scan-verify',
    meta: { requiresAuth: true },
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/ScanVerifyPage.vue') }],
  },
  {
    path: '/ai-insights',
    meta: { requiresAuth: true },
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
