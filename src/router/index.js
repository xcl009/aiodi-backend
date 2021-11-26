import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * saas角色权限菜单
 */
export const saasRoutes = [
  {
    path: '/',
    redirect: '/home',
    component: Layout,
    children: [
      {
        path: '/home',
        name: 'home',
        component: () => import('@/views/home/home'),
        meta: {
          title: '主页',
          icon: 'home'
        }
      },
    ],
  },
  {
    path: '/order',
    component: Layout,
    children: [
      {
        path: '/order',
        name: 'order',
        component: () => import('@/views/order/index'),
        meta: {
          title: '订单管理',
          icon: 'order'
        },
        props:{
          user_type: 1
        }
      }
    ]
  },
  {
    path: '/device',
    component: Layout,
    children: [
      {
        path: '/device',
        name: 'device',
        component: () => import('@/views/device/index'),
        meta: {
          title: '设备管理',
          icon: 'device'
        }
      }
    ]
  },
  {
    path: '/store',
    component: Layout,
    children: [
      {
        path: '/store',
        name: 'store',
        component: () => import('@/views/store/index'),
        meta: {
          title: '商户管理',
          icon: 'store'
        }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    children: [
      {
        path: '/userManage',
        name: 'userManage',
        component: () => import('@/views/userManage/index'),
        meta: {
          title: '用户管理',
          icon: 'userList'
        }
      }
    ]
  },
  {
    path: '/partner',
    component: Layout,
    redirect: '/partner/index',
    meta: {
      title: '品牌管理',
      icon: 'agent'
    },
    children: [
      {
        path: '/index',
        name: 'agent',
        component: () => import('@/views/agent/index'),
        meta: {
          title: '我的品牌',
          keepAlive: true
        }
      },
      {
        path: '/subAgent',
        name: 'subAgent',
        component: () => import('@/views/agent/subAgent'),
        meta: {
          title: '下级管理',
          keepAlive: true
        }
      },
      {
        path: '/create',
        name: 'agentCreate',
        component: () => import('@/views/agent/edit'),
        meta: {
          title: '添加品牌'
        }
      },
    ]
  },
  {
    path: '/app',
    component: Layout,
    redirect: '/app/market',
    meta: {
      title: '服务管理',
      icon: 'agent'
    },
    children: [
      {
        path: 'payRecord',
        name: 'payRecord',
        component: () => import('@/views/app/payRecord'),
        meta: {
          title: '服务记录',
          keepAlive: true
        }
      },
      {
        path: 'market',
        name: 'market',
        component: () => import('@/views/app/market'),
        meta: {
          title: '定价设置',
          keepAlive: true
        }
      },
      {
        path: 'create',
        name: 'create',
        component: () => import('@/views/app/edit'),
        meta: {
          title: '添加服务'
        }
      }
    ]
  }
]

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => import({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
