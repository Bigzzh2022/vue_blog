<template>
  <div class="home">
    <!-- 封面区域 -->
    <section class="cover-section">
      <!-- 头像和简介 -->
      <div class="profile">
        <div class="avatar-container">
          <img src="@/assets/avatar.jpg" alt="avatar" class="avatar">
        </div>
        <div class="intro">
          <h1>渐开线的小窝</h1>
          <p>给时光以生命，给岁月以文明</p>
          <p>千万不要因为走得太久，而忘记了我们为什么出发</p>
        </div>
      </div>

      <!-- 社交链接 -->
      <div class="social-links">
        <a href="#" class="social-link">
          <img src="@/assets/icons/wechat.svg" alt="微信">
        </a>
        <a href="#" class="social-link">
          <img src="@/assets/icons/bilibili.svg" alt="哔哩哔哩">
        </a>
        <a href="#" class="social-link">
          <img src="@/assets/icons/github.svg" alt="GitHub">
        </a>
        <a href="#" class="social-link">
          <img src="@/assets/icons/zhihu.svg" alt="知乎">
        </a>
        <a href="#" class="social-link">
          <img src="@/assets/icons/email.svg" alt="邮箱">
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const contentRef = ref<HTMLElement | null>(null)

const scrollToContent = () => {
  contentRef.value?.scrollIntoView({ 
    behavior: 'smooth',
    block: 'start'
  })
}
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
}
</style>
