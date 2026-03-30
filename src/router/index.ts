import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
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
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
