import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import './styles.css'
import './assets/main.css' // 引入全局样式
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';

const app = createApp(App)


app.use(Antd)

app.use(router)
app.use(i18n)
app.mount('#app')