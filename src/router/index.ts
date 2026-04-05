import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('../views/Landing.vue')
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/products',
    name: 'ProductList',
    component: () => import('../views/ProductList.vue')
  },
  {
    path: '/products/:id',
    name: 'ProductDetail',
    component: () => import('../views/ProductDetail.vue')
  },
  {
    path: '/products/compare',
    name: 'ProductCompare',
    component: () => import('../views/ProductCompare.vue')
  },
  {
    path: '/inquiry',
    name: 'Inquiry',
    component: () => import('../views/Inquiry.vue')
  },
  {
    path: '/inquiry/:id',
    name: 'InquiryDetail',
    component: () => import('../views/InquiryDetail.vue')
  },
  {
    path: '/user/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/user/profile',
    name: 'UserCenter',
    component: () => import('../views/UserCenter.vue')
  },
  {
    path: '/user/inquiries',
    name: 'MyInquiries',
    component: () => import('../views/user/MyInquiries.vue')
  },
  {
    path: '/user/inquiries/:id',
    name: 'MyInquiryDetail',
    component: () => import('../views/user/InquiryDetail.vue')
  },
  {
    path: '/market/inquiries',
    name: 'MarketInquiries',
    component: () => import('../views/market/MarketInquiries.vue')
  },
  {
    path: '/market/inquiries/:id',
    name: 'MarketInquiryDetail',
    component: () => import('../views/market/MarketInquiryDetail.vue')
  },
  {
    path: '/market/inquiries/:id/quote',
    name: 'QuoteSubmit',
    component: () => import('../views/market/QuoteSubmit.vue')
  },
  {
    path: '/user/quotes',
    name: 'MyQuotes',
    component: () => import('../views/user/MyQuotes.vue')
  },
  {
    path: '/user/quotes/:id',
    name: 'QuoteDetail',
    component: () => import('../views/user/QuoteDetail.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
