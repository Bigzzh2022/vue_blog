<template>
  <div class="home">
    <!-- 封面区域 -->
    <section class="cover-section">
      <!-- 轮播图背景 -->
      <div class="carousel-container" v-if="carouselEnabled">
        <NCarousel
          class="carousel"
          effect="fade"
          keyboard
          draggable
          :autoplay="true"
          :interval="carouselInterval * 1000"
          :show-dots="showDots"
          dot-type="line"
          direction="horizontal"
        >
          <img 
            v-for="(image, index) in carouselImages" 
            :key="index" 
            :src="image" 
            class="carousel-img" 
          />
        </NCarousel>
        <div class="carousel-overlay"></div>
      </div>

      <!-- 头像和简介 -->
      <div class="profile">
        <div class="avatar-container">
          <img :src="avatar || defaultAvatar" alt="avatar" class="avatar">
        </div>
        <div class="intro">
          <h1>{{ siteTitle }}</h1>
          <p>{{ siteDescription }}</p>
          <p>{{ bio }}</p>
        </div>
      </div>

      <!-- 社交链接 -->
      <div class="social-links">
        <a v-for="link in socialLinks" :key="link.name" :href="link.url" class="social-link" target="_blank" rel="noopener noreferrer">
          <img :src="getSocialIcon(link.icon)" :alt="link.name">
        </a>
      </div>

      <!-- 访客计数 -->
      <div class="visit-count">
        访客
      </div>

      <!-- 向下滚动箭头 -->
      <div class="scroll-down" @click="scrollToContent">
        <i class="arrow-down"></i>
      </div>
    </section>

    <!-- 内容区域 -->
    <section class="content-section" ref="contentRef">
      <!-- 公告区域 -->
      <div class="notice-section">
        <h2>公告</h2>
        <div class="notice-card">
          <p>欢迎来到我的博客！</p>
          <p>这里记录了我的学习笔记、生活感悟和技术分享。</p>
        </div>
      </div>

      <!-- 文章列表区域 -->
      <div class="articles-section">
        <h2>最新文章</h2>
        <div class="article-list">
          <div class="article-card" v-for="i in 3" :key="i">
            <div class="article-cover"></div>
            <div class="article-content">
              <h3>文章标题</h3>
              <p class="article-desc">这是文章的简要描述，介绍文章的主要内容...</p>
              <div class="article-meta">
                <span>2024-01-01</span>
                <span>阅读: 100</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 底部区域 -->
    <footer class="site-footer">
      <div class="footer-content">
        <div class="footer-text">{{ footerText }}</div>
        <div class="footer-links">
          <a v-for="link in footerLinks" :key="link.name" :href="link.url" target="_blank">{{ link.name }}</a>
        </div>
        <div class="copyright">
          © {{ startYear }} - {{ currentYear }} {{ siteTitle }}
        </div>
        <div v-if="icp" class="icp">
          <a href="https://beian.miit.gov.cn/" target="_blank">{{ icp }}</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { NCarousel } from 'naive-ui'
import { useSettingsStore } from '@/stores/settings'
import defaultAvatar from '@/assets/avatar.jpg'
// 导入所有图标
import wechatIcon from '@/assets/icons/wechat.svg'
import githubIcon from '@/assets/icons/github.svg'
import bilibiliIcon from '@/assets/icons/bilibili.svg'
import zhihuIcon from '@/assets/icons/zhihu.svg'
import weiboIcon from '@/assets/icons/weibo.svg'
import qqIcon from '@/assets/icons/qq.svg'
import emailIcon from '@/assets/icons/email.svg'
import twitterIcon from '@/assets/icons/twitter.svg'
import facebookIcon from '@/assets/icons/facebook.svg'
import instagramIcon from '@/assets/icons/instagram.svg'
import youtubeIcon from '@/assets/icons/youtube.svg'
import juejinIcon from '@/assets/icons/juejin.svg'
import linkedinIcon from '@/assets/icons/linkedin.svg'
import linkIcon from '@/assets/icons/link.svg'

// 图标映射
const iconMap: Record<string, string> = {
  wechat: wechatIcon,
  github: githubIcon,
  bilibili: bilibiliIcon,
  zhihu: zhihuIcon,
  weibo: weiboIcon,
  qq: qqIcon,
  email: emailIcon,
  twitter: twitterIcon,
  facebook: facebookIcon,
  instagram: instagramIcon,
  youtube: youtubeIcon,
  juejin: juejinIcon,
  linkedin: linkedinIcon,
  link: linkIcon
}

// 页面引用
const contentRef = ref<HTMLElement | null>(null)
const settingsStore = useSettingsStore()

// 网站基本信息
const siteTitle = ref('渐开线的小窝')
const siteDescription = ref('给时光以生命，给岁月以文明')
const bio = ref('千万不要因为走得太久，而忘记了我们为什么出发')
const avatar = ref('')
const socialLinks = ref<Array<{ name: string; url: string; icon: string }>>([])
const icp = ref('')
const startYear = ref(2023)
const currentYear = computed(() => new Date().getFullYear())
const footerText = ref('感谢您的访问')
const footerLinks = ref<Array<{ name: string; url: string }>>([])

// 轮播图相关配置
const carouselEnabled = ref(false)
const carouselApiUrl = ref('')
const carouselInterval = ref(5)
const carouselImageCount = ref(5)
const carouselImages = ref<string[]>([])
const showDots = ref(true)

// 获取设置
const getSettings = async () => {
  try {
    // 加载基本设置
    const settings = settingsStore.getBasicSettings()
    
    siteTitle.value = settings.siteTitle
    siteDescription.value = settings.siteDescription
    carouselEnabled.value = settings.carouselEnabled || false
    carouselApiUrl.value = settings.carouselApiUrl || ''
    carouselInterval.value = settings.carouselInterval || 5
    carouselImageCount.value = settings.carouselImageCount || 5
    icp.value = settings.icp || ''
    startYear.value = settings.startYear || 2023
    footerText.value = settings.footerText || '感谢您的访问'
    footerLinks.value = settings.footerLinks || []
    
    // 加载个人资料
    const profile = settingsStore.getProfileSettings()
    avatar.value = profile.avatar || ''
    bio.value = profile.bio || ''
    socialLinks.value = profile.socialLinks || []
    
    if (carouselEnabled.value && carouselApiUrl.value) {
      await fetchCarouselImages()
    }
  } catch (error) {
    console.error('获取设置失败:', error)
  }
}

// 获取轮播图片
const fetchCarouselImages = async () => {
  try {
    // 如果API URL为空或包含{count}占位符且未被替换，进行替换
    const url = carouselApiUrl.value.includes('{count}') 
      ? carouselApiUrl.value.replace('{count}', carouselImageCount.value.toString())
      : carouselApiUrl.value
    
    const response = await fetch(url)
    
    // 判断API返回格式
    // 1. 如果是JSON数组格式
    if (response.headers.get('content-type')?.includes('application/json')) {
      const data = await response.json()
      if (Array.isArray(data)) {
        carouselImages.value = data.slice(0, carouselImageCount.value)
      } else if (data.data && Array.isArray(data.data)) {
        carouselImages.value = data.data.slice(0, carouselImageCount.value)
      } else {
        // 单个图片URL的情况
        carouselImages.value = [data.url || data.imgurl || data.src || data]
      }
    } else {
      // 2. 如果直接返回图片，那么只有一张
      carouselImages.value = [url]
    }
    
    // 如果无法获取图片，使用默认图片
    if (carouselImages.value.length === 0) {
      carouselImages.value = [
        'https://picsum.photos/1920/1080?random=1',
        'https://picsum.photos/1920/1080?random=2',
        'https://picsum.photos/1920/1080?random=3'
      ]
    }
  } catch (error) {
    console.error('获取轮播图失败:', error)
    // 使用默认图片
    carouselImages.value = [
      'https://picsum.photos/1920/1080?random=1',
      'https://picsum.photos/1920/1080?random=2',
      'https://picsum.photos/1920/1080?random=3'
    ]
  }
}

// 滚动到内容区域
const scrollToContent = () => {
  contentRef.value?.scrollIntoView({ 
    behavior: 'smooth',
    block: 'start'
  })
}

// 获取社交图标
const getSocialIcon = (icon: string): string => {
  return iconMap[icon] || iconMap.link
}

onMounted(() => {
  // 加载设置，初始化轮播图
  settingsStore.loadSettingsFromStorage()
  getSettings()
})
</script>

<style scoped>
.home {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.cover-section {
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  color: white;
  padding: 20px;
  overflow: hidden;
}

/* 轮播图相关样式 */
.carousel-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.carousel {
  width: 100%;
  height: 100%;
}

.carousel-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(30, 60, 114, 0.6);
  z-index: 1;
}

.profile, .social-links, .visit-count, .scroll-down {
  position: relative;
  z-index: 2;
}

.content-section {
  min-height: 100vh;
  width: 100%;
  background: #f5f5f5;
  padding: 60px 20px;
}

.profile {
  text-align: center;
  margin-bottom: 40px;
}

.avatar-container {
  margin-bottom: 20px;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.2);
  object-fit: cover;
  transition: transform 0.3s;
}

.avatar:hover {
  transform: scale(1.05);
}

.intro {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
}

.intro h1 {
  font-size: 2em;
  margin-bottom: 15px;
}

.intro p {
  margin: 10px 0;
  font-size: 1.1em;
  line-height: 1.6;
}

.social-links {
  display: flex;
  gap: 20px;
  margin: 30px 0;
}

.social-link {
  width: 45px;
  height: 45px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.social-link:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.2);
}

.social-link img {
  width: 20px;
  height: 20px;
  filter: brightness(0) invert(1);
}

.visit-count {
  margin-top: 20px;
  padding: 10px 30px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(5px);
}

.scroll-down {
  position: absolute;
  bottom: 40px;
  cursor: pointer;
}

.arrow-down {
  display: block;
  width: 20px;
  height: 20px;
  border-right: 3px solid white;
  border-bottom: 3px solid white;
  transform: rotate(45deg);
  animation: bounce 2s infinite;
  animation-timing-function: ease-in-out;
}

@keyframes bounce {
  0%, 100% {
    transform: rotate(45deg) translate(0, 0);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: rotate(45deg) translate(-10px, -10px);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}

.notice-section,
.articles-section {
  max-width: 1200px;
  margin: 0 auto 60px;
}

h2 {
  font-size: 28px;
  color: #333;
  margin-bottom: 20px;
}

.notice-card {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.article-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.article-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s;
}

.article-card:hover {
  transform: translateY(-4px);
}

.article-cover {
  height: 160px;
  background: #e0e0e0;
}

.article-content {
  padding: 16px;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  color: #999;
  font-size: 14px;
  margin-top: 12px;
}

/* 底部样式 */
.site-footer {
  background: #f5f5f5;
  border-top: 1px solid #eee;
  padding: 30px 20px;
  text-align: center;
  color: #666;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-text {
  margin-bottom: 15px;
  font-size: 16px;
}

.footer-links {
  margin-bottom: 20px;
}

.footer-links a {
  color: #666;
  margin: 0 10px;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #18a058;
}

.copyright {
  margin-bottom: 10px;
  font-size: 14px;
}

.icp {
  font-size: 12px;
}

.icp a {
  color: #999;
  text-decoration: none;
}

.icp a:hover {
  color: #18a058;
}

@media (max-width: 768px) {
  .intro {
    padding: 15px;
    margin: 0 10px;
  }

  .social-links {
    gap: 15px;
  }

  .social-link {
    width: 40px;
    height: 40px;
  }

  .article-list {
    grid-template-columns: 1fr;
  }
  
  .footer-links a {
    margin: 0 5px;
  }
}
</style>
