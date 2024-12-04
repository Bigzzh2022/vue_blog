<template>
  <div class="register-view">
    <div class="register-container">
      <div class="register-box">
        <RegisterForm />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import RegisterForm from '@/components/RegisterForm.vue'
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
}

.register-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.register-box {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.register-header {
  text-align: center;
  padding: 20px 20px 0;
}

.register-header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.register-header p {
  margin: 10px 0 0;
  color: #666;
  font-size: 14px;
}

.register-header a {
  color: #1e3c72;
  text-decoration: none;
  font-weight: 500;
}

.register-header a:hover {
  text-decoration: underline;
}

/* 移动端适配 */
@media screen and (max-width: 480px) {
  .register-container {
    padding: 0;
  }
  
  .register-box {
    height: 100%;
    max-width: 100%;
    border-radius: 0;
  }
  
  .register-header {
    padding-top: 40px;
  }
}
</style> 