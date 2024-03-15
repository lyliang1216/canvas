import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { loadSvg } from '@/icons'

import App from './App.vue'
import router from './router'

const app = createApp(App)

loadSvg(app)

app.use(createPinia())
app.use(router)

app.mount('#app')
