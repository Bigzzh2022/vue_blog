import http from '@/services/http'
import type { BasicSettings, ProfileSettings, AdvancedSettings } from '@/stores/settings'

export const settingsService = {
  // 获取基本设置
  async getBasicSettings() {
    const res = await http.get<BasicSettings>('/settings/basic')
    return res.data
  },
  // 保存基本设置
  async saveBasicSettings(settings: Partial<BasicSettings>) {
    const res = await http.put<BasicSettings>('/settings/basic', settings)
    return res.data
  },

  // 获取个人资料设置
  async getProfileSettings() {
    const res = await http.get<ProfileSettings>('/settings/profile')
    return res.data
  },
  // 保存个人资料设置
  async saveProfileSettings(settings: Partial<ProfileSettings>) {
    const res = await http.put<ProfileSettings>('/settings/profile', settings)
    return res.data
  },

  // 获取高级设置
  async getAdvancedSettings() {
    const res = await http.get<AdvancedSettings>('/settings/advanced')
    return res.data
  },
  // 保存高级设置
  async saveAdvancedSettings(settings: Partial<AdvancedSettings>) {
    const res = await http.put<AdvancedSettings>('/settings/advanced', settings)
    return res.data
  }
}

export default settingsService
