<template>
  <div class="register-view">
    <div class="animated-bg">
      <div class="circle c1"></div>
      <div class="circle c2"></div>
      <div class="circle c3"></div>
    </div>
    
    <div class="register-container">
      <div class="register-box">
        <div class="logo-area">
          <h2>注册账号</h2>
        </div>
        <RegisterForm />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import RegisterForm from '@/components/RegisterForm.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faUserPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faUserPlus)
</script>

<style scoped>
.register-view {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.animated-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.c1 {
  width: 500px;
  height: 500px;
  top: -100px;
  right: -100px;
  animation: float 20s infinite linear;
}

.c2 {
  width: 600px;
  height: 600px;
  bottom: -200px;
  left: -100px;
  animation: float 30s infinite linear reverse;
}

.c3 {
  width: 300px;
  height: 300px;
  top: 40%;
  right: 20%;
  animation: float 15s infinite ease-in-out;
}

@keyframes float {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-40px) rotate(180deg);
  }
  100% {
    transform: translateY(0) rotate(360deg);
  }
}

.register-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  z-index: 1;
  padding-top: 80px;
}

.register-box {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: fadeIn 0.6s ease-out;
}

.logo-area {
  padding: 20px 0 10px;
  text-align: center;
}

.logo {
  width: 60px;
  height: 60px;
  margin: 0 auto;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 30px;
  box-shadow: 0 4px 10px rgba(30, 60, 114, 0.3);
}

.logo-area h4 {
  margin: 15px 0 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.logo-area h2 {
  margin: 10px 0 5px;
  color: #333;
  font-size: 24px;
  font-weight: 600;
}

.logo-area .welcome-text {
  color: #666;
  font-size: 14px;
  margin-bottom: 10px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 移动端适配 */
@media screen and (max-width: 480px) {
  .register-container {
    padding: 0;
    padding-top: 90px;
  }
  
  .register-box {
    height: 100%;
    max-width: 100%;
    border-radius: 0;
    animation: none;
  }
  
  .logo-area {
    padding-top: 60px;
  }
}
</style> 