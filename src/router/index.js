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
  // {
  //   path: '/goods',
  //   component: Layout,
  //   meta: {
  //     title: '默认计费',
  //     icon: 'mall'
  //   },
  //   children: [
  //     {
  //       path: 'billing',
  //       name: 'billing',
  //       component: () => import('@/views/system/billing'),
  //       meta: {
  //         title: '默认计费'
  //       }
  //     }
  //   ],
  // },
  {
    path: '/cashSet',
    component: Layout,
    meta: {
      title: '概率押金',
      icon: 'mall'
    },
    children: [
      {
        path: '',
        name: 'cashSet',
        component: () => import('@/views/system/cashSet'),
        meta: {
          title: '提现规则设置'
        }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    redirect: '/user/index',
    meta: {
      title: '个人信息',
      icon: 'user'
    },
    hidden: true,
    children: [
      {
        path: 'index',
        name: 'userInfo',
        component: () => import('@/views/user/index'),
        meta: {
          title: '个人信息'
        }
      },
      {
        path: 'lpwd',
        name: 'loginPwd',
        component: () => import('@/views/user/loginPwd'),
        meta: {
          title: '登陆密码'
        }
      },
      {
        path: 'opwd',
        name: 'operatePwd',
        component: () => import('@/views/user/operatePwd'),
        meta: {
          title: '操作密码'
        }
      },
      {
        path: 'checkPwd',
        name: 'checkPwd',
        component: () => import('@/views/user/checkPwd'),
        meta: {
          title: '安全验证'
        }
      }
    ]
  }
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
