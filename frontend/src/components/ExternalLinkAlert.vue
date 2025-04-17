<template>
  <div v-if="visible" class="external-link-modal">
    <div class="modal-backdrop" @click="cancel"></div>
    <div class="modal-container">
      <div class="modal-content">
        <div class="alert-header">
          <div class="alert-icon">
            <font-awesome-icon :icon="['fas', 'exclamation-triangle']" />
          </div>
          <h3>请注意您的账号和财产安全</h3>
        </div>
        <div class="alert-body">
          <p>您即将离开本站，前往：<a :href="url" target="_blank" rel="noopener noreferrer">{{ url }}</a></p>
          <p class="warning-text">外部链接可能存在风险，请确认链接安全性</p>
        </div>
        <div class="alert-footer">
          <button class="btn-primary" @click="proceed">
            <font-awesome-icon :icon="['fas', 'external-link-alt']" />
            继续访问
          </button>
          <button class="btn-secondary" @click="cancel">
            <font-awesome-icon :icon="['fas', 'times']" />
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { 
  faExclamationTriangle, 
  faExternalLinkAlt, 
  faTimes
} from '@fortawesome/free-solid-svg-icons'

library.add(faExclamationTriangle, faExternalLinkAlt, faTimes)

const props = defineProps<{
  url: string,
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'cancel'): void,
  (e: 'proceed'): void,
  (e: 'update:visible', value: boolean): void
}>()

watch(() => props.visible, (newValue) => {
  if (newValue) {
    // 禁止背景滚动
    document.body.style.overflow = 'hidden'
  } else {
    // 恢复背景滚动
    document.body.style.overflow = 'auto'
  }
})

const proceed = () => {
  // 在新窗口打开链接
  window.open(props.url, '_blank', 'noopener,noreferrer')
  // 关闭弹窗
  emit('update:visible', false)
  emit('proceed')
}

const cancel = () => {
  emit('update:visible', false)
  emit('cancel')
}
</script>

<style scoped>
.external-link-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(3px);
  z-index: 1001;
}

.modal-container {
  position: relative;
  z-index: 1002;
  width: 90%;
  max-width: 480px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: slide-up 0.3s ease-out;
}

.modal-content {
  padding: 24px;
}

.alert-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
}

.alert-icon {
  font-size: 22px;
  color: #ff6b6b;
}

.alert-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
  font-weight: 600;
}

.alert-body {
  margin-bottom: 24px;
}

.alert-body p {
  margin: 8px 0;
  color: #555;
  line-height: 1.6;
}

.alert-body a {
  color: #f56c6c;
  font-weight: 500;
  text-decoration: none;
  word-break: break-all;
}

.alert-body a:hover {
  text-decoration: underline;
}

.warning-text {
  color: #F56C6C !important;
  font-size: 14px;
}

.alert-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

button {
  padding: 10px 16px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #F56C6C;
  color: white;
}

.btn-primary:hover {
  background-color: #e74c3c;
}

.btn-secondary {
  background-color: #eee;
  color: #666;
}

.btn-secondary:hover {
  background-color: #ddd;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 576px) {
  .modal-container {
    width: 95%;
  }
  
  .alert-footer {
    flex-direction: column-reverse;
  }
  
  button {
    width: 100%;
    justify-content: center;
  }
}
</style> 