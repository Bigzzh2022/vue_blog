import request from './config'

export interface BangumiInfo {
  id: number
  title: string
  cover: string
  progress: string
  total_episodes: number
  watched_episodes: number
  season_id: string
  media_id: string
  score: number
  status: number // 0: 想看, 1: 在看, 2: 看完
  updated_at: string
}

export const syncBiliBangumi = () => {
  return request({
    url: '/bangumi/sync',
    method: 'POST'
  })
}

export const getBangumiList = (params?: { status?: number }) => {
  return request<BangumiInfo[]>({
    url: '/bangumi/list',
    method: 'GET',
    params
  })
}
