import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@/router/index.js'
import 'tdesign-vue-next/es/style/index.css';
import App from './App.vue'

import '@/assets/style/index.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
