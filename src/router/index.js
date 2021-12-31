import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * admin角色权限菜单
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
        component: () => import('@/saas/home/home'),
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
        component: () => import('@/saas/order/index'),
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
        component: () => import('@/saas/device/index'),
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
        component: () => import('@/saas/store/index'),
        meta: {
          keepAlive: true,
          title: '商户管理',
          icon: 'store'
        }
      }
    ]
  },
  {
    path: '/userManage',
    component: Layout,
    children: [
      {
        path: '/userList',
        name: 'userList',
        component: () => import('@/saas/userManage/index'),
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
        path: 'index',
        name: 'agent',
        component: () => import('@/saas/agent/index'),
        meta: {
          keepAlive: true,
          title: '我的品牌'
        }
      },
      {
        path: 'subAgent',
        name: 'subAgent',
        component: () => import('@/saas/agent/subAgent'),
        meta: {
          keepAlive: true,
          title: '下级管理'
        }
      },
      {
        path: 'create',
        name: 'partnerCreate',
        component: () => import('@/saas/agent/edit'),
        meta: {
          title: '添加品牌',
          activeMenu: '/partner/index'
        },
        hidden: true
      },
      {
        path: 'edit/:aid(\\d+)',
        name: 'partnerCreate',
        component: () => import('@/saas/agent/edit'),
        meta: {
          title: '修改品牌信息',
          activeMenu: '/partner/index'
        },
        hidden: true
      },
    ]
  },
  {
    path: '/app',
    component: Layout,
    redirect: '/app/market',
    meta: {
      title: '服务管理',
      icon: 'fuwu'
    },
    children: [
      {
        path: 'payRecord',
        name: 'payRecord',
        component: () => import('@/saas/app/payRecord'),
        meta: {
          title: '服务记录',
          keepAlive: true
        }
      },
      {
        path: 'market',
        name: 'market',
        component: () => import('@/saas/app/market'),
        meta: {
          title: '定价设置',
          keepAlive: true
        }
      },
      {
        path: 'create',
        name: 'create',
        component: () => import('@/saas/app/edit'),
        meta: {
          title: '添加服务'
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
        component: () => import('@/saas/user/index'),
        meta: {
          title: '个人信息'
        }
      },
      {
        path: 'lpw',
        name: 'loginPw',
        component: () => import('@/saas/user/loginPw'),
        meta: {
          title: '登陆密码'
        }
      }
    ]
  },
  {
    path: '/money',
    component: Layout,
    redirect: '/money/index',
    meta: {
      title: '收益明细'
    },
    hidden: true,
    children: [
      {
        path: 'income',
        name: 'income',
        component: () => import('@/saas/money/income'),
        meta: {
          title: '收益明细'
        }
      },
      {
        path: 'dayMoney',
        name: 'dayMoney',
        component: () => import('@/saas/money/dayMoney'),
        meta: {
          title: '日交易额'
        }
      }
    ]
  }
]

/**
 * brand,agent角色权限菜单
 */
export const brandRoutes = [
  {
    path: '/',
    redirect: '/home',
    component: Layout,
    children: [
      {
        path: '/home',
        name: 'home',
        component: () => import('@/brand/home/home'),
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
    redirect: '/order/meOrder',
    meta: {
      title: '订单管理',
      icon: 'order'
    },
    children: [
      {
        path: 'meOrder',
        name: 'meOrder',
        component: () => import('@/brand/order/index'),
        meta: {
          title: '我的订单'
        },
        props:{
          user_type: 0
        }
      },
      {
        path: 'subOrder',
        name: 'subOrder',
        component: () => import('@/brand/order/index'),
        meta: {
          title: '下级订单'
        },
        props: {
          user_type: 1
        }
      }
    ]
  },
  {
    path: '/device',
    component: Layout,
    redirect: '/device/meDevice',
    meta: {
      title: '设备管理',
      icon: 'device'
    },
    children: [
      {
        path: 'meDevice',
        name: 'meDevice',
        component: () => import('@/brand/device/index'),
        meta: {
          title: '我的设备'
        },
        props:{
          user_type: 0
        }
      },
      {
        path: 'subDevice',
        name: 'subDevice',
        component: () => import('@/brand/device/index'),
        meta: {
          title: '下级设备'
        },
        props:{
          user_type: 1
        }
      },
      {
        path: 'qrcode',
        name: 'qrcode',
        component: () => import('@/brand/qrcode/index'),
        meta: {
          keepAlive: true,
          title: '设备二维码'
        }
      },
      {
        path: 'create',
        name: 'qrcodeCreate',
        component: () => import('@/brand/qrcode/create'),
        meta: {
          title: '生成二维码'
        },
        hidden: true
      },
      {
        path: 'createRecord',
        name: 'createRecord',
        component: () => import('@/brand/qrcode/createRecord'),
        meta: {
          title: '二维码生成记录'
        },
        hidden: true
      }
    ]
  },
  {
    path: '/store',
    component: Layout,
    redirect: '/store/meStore',
    meta: {
      title: '商户管理',
      icon: 'store'
    },
    children: [
      {
        path: 'meStore',
        name: 'meStore',
        component: () => import('@/brand/store/index'),
        meta: {
          keepAlive: true,
          title: '我的商户'
        },
        props:{
          user_type: 0
        }
      },
      {
        path: 'subStore',
        name: 'subStore',
        component: () => import('@/brand/store/index'),
        meta: {
          keepAlive: true,
          title: '下级商户'
        },
        props:{
          user_type: 1
        }
      },
      {
        path: 'create',
        name: 'shopCreate',
        component: () => import('@/brand/store/edit'),
        meta: {
          title: '添加商户',
          activeMenu: '/store/meStore'
        },
        hidden: true
      },
      {
        path: 'edit/:store_id(\\d+)',
        name: 'shopCreate',
        component: () => import('@/brand/store/edit'),
        meta: {
          title: '修改商户信息',
          activeMenu: '/store/meStore'
        },
        hidden: true
      }
    ]
  },
  {
    path: '/userManage',
    component: Layout,
    redirect: '/userManage/userList',
    meta: {
      title: '用户管理',
      icon: 'userList'
    },
    children: [
      {
        path: 'userList',
        name: 'userList',
        component: () => import('@/brand/userManage/index'),
        meta: {
          title: '用户列表'
        }
      },
      {
        path: 'payComplaints',
        name: 'payComplaints',
        component: () => import('@/brand/userManage/payComplaints'),
        meta: {
          title: '用户投诉'
        }
      },
      {
        path: 'feedback',
        name: 'userFeedback',
        component: () => import('@/brand/userManage/feedback'),
        meta: {
          title: '用户反馈'
        }
      }
    ]
  },
  {
    path: '/agent',
    component: Layout,
    redirect: '/agent/index',
    meta: {
      title: '代理管理',
      icon: 'agent'
    },
    children: [
      {
        path: 'index',
        name: 'agent',
        component: () => import('@/brand/agent/index'),
        meta: {
          keepAlive: true,
          title: '我的代理'
        }
      },
      {
        path: 'subAgent',
        name: 'subAgent',
        component: () => import('@/brand/agent/subAgent'),
        meta: {
          keepAlive: true,
          title: '下级管理'
        }
      },
      {
        path: 'create',
        name: 'agentCreate',
        component: () => import('@/brand/agent/edit'),
        meta: {
          title: '添加代理',
          activeMenu: '/agent/index'
        },
        hidden: true
      },
      {
        path: 'edit/:aid(\\d+)',
        name: 'agentCreate',
        component: () => import('@/brand/agent/edit'),
        meta: {
          title: '修改代理信息',
          activeMenu: '/agent/index'
        },
        hidden: true
      }
    ]
  },
  {
    path: '/capital',
    component: Layout,
    redirect: '/capital/agentWithdraw',
    meta: {
      title: '资金管理',
      icon: 'zijing'
    },
    children: [
      {
        path: 'agentWithdraw',
        name: 'agentWithdraw',
        component: () => import('@/brand/capital/agentWithdraw'),
        meta: {
          keepAlive: true,
          title: '代理提现'
        },
        props: {
          user_type: 1
        }
      },
      {
        path: 'storeWithdraw',
        name: 'storeWithdraw',
        component: () => import('@/brand/capital/agentWithdraw'),
        meta: {
          keepAlive: true,
          title: '商户提现'
        },
        props: {
          user_type: 2
        }
      },
      {
        path: 'userWithdraw',
        name: 'userWithdraw',
        component: () => import('@/brand/capital/userWithdraw'),
        meta: {
          keepAlive: true,
          title: '用户提现'
        },
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
        component: () => import('@/brand/user/index'),
        meta: {
          title: '个人信息'
        }
      },
      {
        path: 'lpw',
        name: 'loginPw',
        component: () => import('@/brand/user/loginPw'),
        meta: {
          title: '登陆密码'
        }
      }
    ]
  },
  {
    path: '/money',
    component: Layout,
    redirect: '/money/index',
    meta: {
      title: '收益明细'
    },
    hidden: true,
    children: [
      {
        path: 'income',
        name: 'income',
        component: () => import('@/brand/money/income'),
        meta: {
          title: '收益明细'
        }
      },
      {
        path: 'dayMoney',
        name: 'dayMoney',
        component: () => import('@/brand/money/dayMoney'),
        meta: {
          title: '日交易额'
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
    path: '*',
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
