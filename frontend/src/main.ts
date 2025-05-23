import './assets/main.css'
import { createApp } from 'vue'
import type { App as VueApp } from 'vue'
import { createPinia } from 'pinia'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import router from './router'
import AppComponent from './App.vue'
import { registerSafeLink } from './directives/safeLink'

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
  NButtonGroup,
  NCard,
  NGrid,
  NGridItem,
  NStatistic,
  NList,
  NListItem,
  NThing,
  NSpace,
  NSpin,
  NEmpty,
  NAlert
} from 'naive-ui'

/* 添加图标到库中 */
library.add(fas, fab, far)

/* 创建 Vue 应用 */
const app: VueApp = createApp(AppComponent)
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
    NButtonGroup,
    NCard,
    NGrid,
    NGridItem,
    NStatistic,
    NList,
    NListItem,
    NThing,
    NSpace,
    NSpin,
    NEmpty,
    NAlert
  ]
})

app.use(pinia)
app.use(router)
app.use(naive)
app.component('font-awesome-icon', FontAwesomeIcon)

// 注册安全链接指令
registerSafeLink(app)

app.mount('#app')
