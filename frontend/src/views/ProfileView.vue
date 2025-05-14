<template>
  <div class="profile-view">
    <n-card title="个人资料" style="max-width: 500px; margin: 0 auto;">
      <n-form :model="profileForm" :rules="profileRules" ref="profileFormRef" label-width="80">
        <n-form-item label="头像" path="avatar">
          <n-upload :max="1" accept="image/*" :default-file-list="profileForm.avatar ? [{url: profileForm.avatar, name: '头像', status: 'finished'}] : []" @change="handleAvatarUpload">
            <n-button>上传头像</n-button>
          </n-upload>
        </n-form-item>
        <n-form-item label="昵称" path="nickname">
          <n-input v-model:value="profileForm.nickname" placeholder="请输入昵称" />
        </n-form-item>
        <n-form-item label="个人简介" path="bio">
          <n-input v-model:value="profileForm.bio" placeholder="请输入个人简介" type="textarea" />
        </n-form-item>
        <n-form-item label="邮箱" path="email">
          <n-input v-model:value="profileForm.email" placeholder="请输入邮箱" />
        </n-form-item>
        <n-form-item label="社交链接" path="socialLinks">
          <n-dynamic-input v-model:value="profileForm.socialLinks" :on-create="onCreateSocialLink">
  <template #default="{ value }">
    <n-space vertical>
      <n-input v-model:value="value.name" placeholder="名称" />
      <n-input v-model:value="value.url" placeholder="链接" />
      <n-input v-model:value="value.icon" placeholder="图标" />
    </n-space>
  </template>
</n-dynamic-input>
        </n-form-item>
        <n-form-item>
          <n-button type="primary" @click="handleSubmit">保存资料</n-button>
        </n-form-item>
      </n-form>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { storeToRefs } from 'pinia'
import { useMessage, NCard, NForm, NFormItem, NInput, NButton, NUpload, NDynamicInput, NSpace } from 'naive-ui'

const message = useMessage()
const settingsStore = useSettingsStore()
const { profileSettings } = storeToRefs(settingsStore)

const profileFormRef = ref()
const profileForm = ref({ ...profileSettings.value })

watch(profileSettings, (val: any) => {
  Object.assign(profileForm.value, val)
})

const profileRules = {
  nickname: { required: true, message: '请输入昵称', trigger: 'blur' },
  email: { required: true, message: '请输入邮箱', trigger: 'blur' }
}

const handleAvatarUpload = (options: { file: any, fileList: any[] }) => {
  if (options.file.url) {
    profileForm.value.avatar = options.file.url
  }
}

const onCreateSocialLink = () => ({ name: '', url: '', icon: '' })

const handleSubmit = async () => {
  profileFormRef.value?.validate(async (errors: any) => {
    if (!errors) {
      try {
        await settingsStore.saveProfileSettings(profileForm.value)
        message.success('资料保存成功')
      } catch (e) {
        message.error('保存失败')
      }
    }
  })
}
</script>

<style scoped>
.profile-view {
  padding: 40px 0;
}
</style>
