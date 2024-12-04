<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="text-center px-4">
      <!-- 404 数字 -->
      <h1 class="text-9xl font-bold text-primary transition-all duration-300 hover:scale-105">
        404
      </h1>
      
      <!-- 标题 -->
      <h2 class="mt-4 text-3xl font-semibold text-gray-800">
        页面未找到
      </h2>
      
      <!-- 描述文本 -->
      <p class="mt-4 text-gray-600">
        抱歉，您访问的页面不存在或已被移除。
      </p>
      
      <!-- 按钮组 -->
      <div class="mt-8 space-x-4">
        <n-button type="primary" size="large" @click="router.push('/')">
          <template #icon>
            <n-icon>
              <HomeOutline />
            </n-icon>
          </template>
          返回首页
        </n-button>
        
        <n-button size="large" @click="router.go(-1)">
          <template #icon>
            <n-icon>
              <ArrowBackOutline />
            </n-icon>
          </template>
          返回上一页
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { HomeOutline, ArrowBackOutline } from '@vicons/ionicons5'

const router = useRouter()
</script>

<style scoped>
.text-primary {
  background: linear-gradient(135deg, #18a058 0%, #36ad6a 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.bg-primary {
  background: linear-gradient(135deg, #18a058 0%, #36ad6a 100%);
}
</style>