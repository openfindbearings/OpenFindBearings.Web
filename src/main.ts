import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import router from './router'
import 'ant-design-vue/dist/reset.css'
import './style.css'
import App from './App.vue'

const app = createApp(App)
app.use(Antd)
app.component('SearchOutlined', SearchOutlined)
app.use(router)
app.mount('#app')
