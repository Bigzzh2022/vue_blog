import type { App, Directive, DirectiveBinding } from 'vue'
import { isExternalLink } from '@/utils/externalLink'

interface SafeLinkOptions {
  showAlert: (url: string) => void
}

// 全局事件处理器
let globalOptions: SafeLinkOptions | null = null

/**
 * 处理链接点击事件
 */
function handleLinkClick(event: MouseEvent, url: string): void {
  // 检查是否是外部链接
  if (isExternalLink(url)) {
    // 阻止默认行为
    event.preventDefault()
    
    // 检查是否有全局选项
    if (globalOptions) {
      // 显示安全提示
      globalOptions.showAlert(url)
    }
  }
}

/**
 * 安全链接指令
 */
const safeLink: Directive<HTMLElement, boolean | undefined> = {
  mounted(el, binding) {
    // 如果是a标签且有href属性
    if (el.tagName.toLowerCase() === 'a' && el.hasAttribute('href')) {
      const url = el.getAttribute('href') || ''
      
      // 创建事件监听器
      const clickListener = (event: Event) => {
        if (event instanceof MouseEvent) {
          handleLinkClick(event, url)
        }
      }
      
      // 保存监听器引用以便后续移除
      el._safeClickListener = clickListener
      
      // 添加点击事件监听器
      el.addEventListener('click', clickListener)
    }
  },
  
  unmounted(el) {
    // 移除事件监听器
    if (el._safeClickListener) {
      el.removeEventListener('click', el._safeClickListener)
      delete el._safeClickListener
    }
  }
}

// 扩展HTMLElement接口以包含我们的自定义属性
declare global {
  interface HTMLElement {
    _safeClickListener?: (event: Event) => void
  }
}

/**
 * 设置全局选项
 */
export function setGlobalSafeLinkOptions(options: SafeLinkOptions): void {
  globalOptions = options
}

/**
 * 注册指令
 */
export function registerSafeLink(app: App): void {
  app.directive('safe-link', safeLink)
} 