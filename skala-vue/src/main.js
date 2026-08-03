import { createApp } from 'vue'
import { createPinia } from 'pinia'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faFire,
  faSnowflake,
  faCloud,
  faSun,
  faCloudRain,
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import './assets/retro-theme.css'

import App from './App.vue'
import router from './router'

library.add(faFire, faSnowflake, faCloud, faSun, faCloudRain, faMagnifyingGlass)

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.component('FontAwesomeIcon', FontAwesomeIcon)

app.mount('#app')
