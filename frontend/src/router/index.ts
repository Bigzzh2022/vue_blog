import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import CategoryView from '../views/CategoryView.vue'
import TimelineView from '../views/TimelineView.vue'
import FriendsView from '../views/FriendsView.vue'
import SearchView from '@/views/SearchView.vue'
import NotFound from '../views/NotFound.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView
  },
  {
    path: '/categories',
    name: 'categories-page',
    component: CategoryView
  },
  {
    path: '/category/:slug',
    name: 'category-detail',
    component: CategoryView,
    props: true
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/admin/AdminLayout.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('../views/admin/DashboardView.vue')
      },
      {
        path: 'posts',
        name: 'admin-posts',
        component: () => import('../views/admin/PostsView.vue')
      },
      {
        path: 'posts/edit',
        name: 'post-edit',
        component: () => import('../views/admin/PostEditView.vue')
      },
      {
        path: 'posts/edit/:id',
        name: 'post-edit-id',
        component: () => import('../views/admin/PostEditView.vue')
      },
      {
        path: 'tags',
        name: 'tags',
        component: () => import('../views/admin/TagsView.vue')
      },
      {
        path: 'categories',
        name: 'categories',
        component: () => import('../views/admin/CategoriesView.vue')
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('../views/admin/SettingsView.vue')
      },
      {
        path: 'media',
        name: 'media',
        component: () => import('../views/admin/MediaView.vue')
      },
      {
        path: 'links',
        name: 'links',
        component: () => import('../views/admin/LinksView.vue')
      }
    ]
  },
  {
    path: '/timeline',
    name: 'timeline',
    component: TimelineView
  },
  {
    path: '/friends',
    name: 'friends',
    component: FriendsView
  },
  {
    path: '/article/:id',
    name: 'article',
    component: () => import('../views/ArticleView.vue')
  },
  {
    path: '/search',
    name: 'search',
    component: SearchView,
    meta: {
      title: '搜索结果'
    }
  },
  {
    path: '/chase',
    name: 'chase',
    component: () => import('../views/ChaseView.vue'),
    meta: {
      title: '追番'
    }
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: () => import('../views/FavoritesView.vue'),
    meta: {
      title: '收藏'
    }
  },
  {
    path: '/notes',
    name: 'notes',
    component: () => import('../views/NotesView.vue'),
    meta: {
      title: '记录'
    }
  },
  {
    path: '/monitor',
    name: 'monitor',
    component: () => import('../views/MonitorView.vue'),
    meta: {
      title: '监控'
    }
  },
  // 404 路由应该放在最后
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound,
    meta: {
      title: '页面未找到'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
