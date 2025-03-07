import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import View from '../views/view.vue'
import map from '../views/newmap.vue'
import mapLocation from '../views/mapLocation.vue'

const routes = [
  {
    path: '/',
    name: 'HomePage',
    component: HomePage,
  },
  {
    path: '/view/:id',
    name: 'view',
    component: View, // 用户详情页
    props: true, // 将路由参数作为组件的 props
  },
  {
    path: '/map',
    name: 'Map',
    component: map, // 用户详情页
    props: true, // 将路由参数作为组件的 props
  },
  {
    path: '/mapLocation',
    name: 'mapLocation',
    component: mapLocation, // 用户详情页
    props: true, // 将路由参数作为组件的 props
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
