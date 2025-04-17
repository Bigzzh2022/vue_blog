import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import CategoryView from '../views/CategoryView.vue'
import TimelineView from '../views/TimelineView.vue'
import FriendsView from '../views/FriendsView.vue'
import SearchView from '@/views/SearchView.vue'
import NotFound from '../views/NotFound.vue'
import { userService } from '@/services/userService'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      requiresGuest: true
    }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: {
      requiresGuest: true
    }
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
    meta: {
      requiresAuth: true,
      requiresAdmin: true
    },
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
      },
      {
        path: 'pages',
        name: 'pages',
        component: () => import('../views/admin/PagesView.vue')
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
    path: '/user',
    name: 'user-center',
    component: () => import('../views/UserCenterView.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/:slug',
    name: 'static-page',
    component: () => import('../views/StaticPageView.vue'),
    props: true
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

// 全局路由守卫
router.beforeEach((to, from, next) => {
  const isLoggedIn = userService.isLoggedIn();
  
  // 获取用户信息 (这只是简单的模拟，实际中可能需要从store或API获取)
  const userInfo = userService.getSavedUserInfo && userService.getSavedUserInfo();
  const isAdmin = userInfo?.role === 'admin';
  
  // 需要登录的页面
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isLoggedIn) {
      // 如果未登录，重定向到登录页
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
    } else if (to.matched.some(record => record.meta.requiresAdmin) && !isAdmin) {
      // 如果需要管理员权限但不是管理员
      next({ path: '/' });
    } else {
      next();
    }
  } 
  // 游客专属页面（如登录/注册）
  else if (to.matched.some(record => record.meta.requiresGuest)) {
    if (isLoggedIn) {
      // 如果已登录，重定向到首页
      next({ path: '/' });
    } else {
      next();
    }
  } 
  // 其他页面正常访问
  else {
    next();
  }
});

export default router
