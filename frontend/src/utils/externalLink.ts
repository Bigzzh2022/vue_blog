/**
 * 检查URL是否为外部链接
 * @param url 要检查的URL
 * @returns 如果是外部链接返回true，否则返回false
 */
export function isExternalLink(url: string): boolean {
  // 如果以http://或https://开头，并且不是当前域名，则视为外部链接
  if (!url) return false
  
  // 相对路径不算外部链接
  if (url.startsWith('/') || url.startsWith('#') || url.startsWith('./') || url.startsWith('../')) {
    return false
  }

  try {
    // 使用URL构造函数解析链接
    const urlObj = new URL(url, window.location.origin)
    
    // 检查域名是否与当前域名不同
    return urlObj.hostname !== window.location.hostname
  } catch (e) {
    // 如果URL无效，返回false
    return false
  }
}

/**
 * 安全地打开链接，如果是外部链接则触发回调函数
 * @param url 要打开的URL
 * @param callback 当确认为外部链接时的回调
 */
export function safeOpenLink(url: string, callback: (url: string) => void): void {
  if (isExternalLink(url)) {
    // 如果是外部链接，调用回调
    callback(url)
  } else {
    // 如果是内部链接，直接导航
    window.location.href = url
  }
} 