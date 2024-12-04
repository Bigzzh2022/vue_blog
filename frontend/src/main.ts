import './assets/main.css'
import { createApp } from 'vue'
import type { App } from 'vue'
import { createPinia } from 'pinia'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import router from './router'
import App from './App.vue'

// 导入 naive-ui 组件
import {
  create,
  NButton,
  NForm,
  NFormItem,
  NInput,
  NIcon,
  NMessageProvider,
  NConfigProvider,
  NTag,
  NButtonGroup
} from 'naive-ui'

/* 添加图标到库中 */
library.add(fas, fab, far)

/* 创建 Vue 应用 */
const app: App = createApp(App)
const pinia = createPinia()

/* 注册 naive-ui 组件 */
const naive = create({
  components: [
    NButton,
    NForm,
    NFormItem,
    NInput,
    NIcon,
    NMessageProvider,
    NConfigProvider,
    NTag,
    NButtonGroup
  ]
})

app.use(pinia)
app.use(router)
app.use(naive)
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')
