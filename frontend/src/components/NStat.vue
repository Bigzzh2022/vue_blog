<template>
  <div class="n-stat">
    <div class="n-stat-label">{{ label }}</div>
    <div class="n-stat-value">
      <slot name="value"></slot>
    </div>
    <div v-if="$slots.footer" class="n-stat-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NStat',
  props: {
    label: {
      type: String,
      required: true
    },
    tabularNums: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.n-stat {
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.n-stat:hover {
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.n-stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.n-stat-value {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.5;
  color: #18a058;
}

.n-stat-footer {
  margin-top: 8px;
  font-size: 12px;
  color: #606266;
}
</style> 