import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/brandReg/:gid?/:code?',
    component: () => import('@/views/login/brandReg'),
    hidden: true
  },
  {
    path: '/login/:gid?',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '*',
    component: () => import('@/views/404'),
    hidden: true
  },
  {
    path: '/factoryEject',
    component: () => import('@/views/factory/eject'),
    hidden: true
  },
  // {
  //   path: '/user',
  //   component: Layout,
  //   redirect: '/user/index',
  //   meta: {
  //     title: '个人信息',
  //     icon: 'user'
  //   },
  //   hidden: true,
  //   children: [
  //     {
  //       path: 'index',
  //       name: 'userInfo',
  //       component: () => import('@/views/user/index'),
  //       meta: {
  //         title: '个人信息'
  //       }
  //     },
  //     {
  //       path: 'lpwd',
  //       name: 'loginPwd',
  //       component: () => import('@/views/user/loginPwd'),
  //       meta: {
  //         title: '登陆密码'
  //       }
  //     },
  //     {
  //       path: 'opwd',
  //       name: 'operatePwd',
  //       component: () => import('@/views/user/operatePwd'),
  //       meta: {
  //         title: '操作密码'
  //       }
  //     },
  //     {
  //       path: 'checkPwd',
  //       name: 'checkPwd',
  //       component: () => import('@/views/user/checkPwd'),
  //       meta: {
  //         title: '安全验证'
  //       }
  //     }
  //   ]
  // },
  // {
  //   path: '/activity',
  //   component: Layout,
  //   redirect: '/activity/index',
  //   meta: {
  //     title: '活动管理',
  //     icon: 'user'
  //   },
  //   children: [
  //     {
  //       path: 'index',
  //       name: 'activityList',
  //       component: () => import('@/views/activity/index'),
  //       meta: {
  //         title: '活动管理',
  //         keepAlive: true,
  //       }
  //     },
  //     {
  //       path: 'edit',
  //       name: 'activityEdit',
  //       component: () => import('@/views/activity/edit'),
  //       hidden: true,
  //       meta: {
  //         title: '添加活动',
  //         keepAlive: false,
  //       }
  //     },
  //     {
  //       path: 'prize',
  //       name: 'prize',
  //       component: () => import('@/views/activity/prize'),
  //       meta: {
  //         title: '奖品',
  //         keepAlive: true,
  //       }
  //     },
  //     {
  //       path: 'prizeEdit',
  //       name: 'prizeEdit',
  //       hidden: true,
  //       component: () => import('@/views/activity/prizeEdit'),
  //       meta: {
  //         title: '添加',
  //         keepAlive: false,
  //       }
  //     },
  //     {
  //       path: 'lottery',
  //       name: 'lottery',
  //       component: () => import('@/views/activity/lottery'),
  //       meta: {
  //         title: '中奖列表',
  //         keepAlive: true,
  //       }
  //     },
  //   ]
  // },
]

const createRouter = () => new Router({
  mode: 'history', // require service support
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
