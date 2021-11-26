import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [{
    path: '/',
    component: Layout,
    redirect: '/home',
    hidden: true,
    children: [{
        path: 'index',
        name: 'shop',
        component: () => import('@/views/shop/index'),
        meta: {
          title: '商户管理',
          roles: ['terminal', 'partner', 'agent', 'director', 'salesman']
        }
      },
      {
        path: 'detail/:id(\\d+)',
        name: 'shopDetail',
        component: () => import('@/views/shop/detail'),
        meta: {
          title: '商户详情',
          roles: ['terminal', 'partner', 'agent', 'director', 'salesman', 'merchants']
        }
      },
      {
        path: 'create',
        name: 'shopCreate',
        component: () => import('@/views/shop/edit'),
        meta: {
          title: '添加商户',
          roles: ['terminal','partner', 'agent', 'director', 'salesman']
        }
      },
      {
        path: 'edit/:id(\\d+)',
        name: 'shopEdit',
        component: () => import('@/views/shop/edit'),
        meta: {
          title: '编辑商户',
          roles: ['terminal', 'partner', 'agent', 'director', 'salesman', 'merchants']
        }
      }
    ]
  },
  {
    path: '/login/:gid?',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/regist',
    component: () => import('@/views/login/regist'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  }
]

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 * ['terminal','partner','agent','director','salesman','merchants'] ['总站','合伙人','代理商','主管','业务员','商家']
 */
export const asyncRoutes = [{
    path: '/home',
    component: Layout,
    meta: {
      roles: ['terminal', 'partner', 'agent', 'director', 'salesman', 'merchants']
    },
    children: [{
        path: '/home',
        name: 'home',
        component: () => import('@/views/home/home'),
        meta: {
          title: '主页',
          icon: 'home'
        }
      },
      {
        path: 'income',
        name: 'income',
        component: () => import('@/views/home/income'),
        meta: {
          title: '收益明细'
        },
        hidden: true
      },
      {
        path: 'operateData',
        name: 'operateData',
        component: () => import('@/views/home/operateData'),
        meta: {
          title: '运营数据'
        },
        hidden: true
      },
      {
        path: 'article',
        name: 'article',
        component: () => import('@/views/home/article'),
        meta: {
          title: '最新公告'
        },
        hidden: true
      },
      {
        path: 'updateRecord',
        name: 'updateRecord',
        component: () => import('@/views/home/updateRecord'),
        meta: {
          title: '更新公告'
        },
        hidden: true
      },
      {
        path: 'feedbackEdit',
        name: 'feedbackEdit',
        component: () => import('@/views/feedback/edit'),
        meta: {
          title: '提交工单'
        },
        hidden: true
      },
      {
        path: 'feedback',
        name: 'feedback',
        component: () => import('@/views/feedback/feedback'),
        meta: {
          title: '工单记录'
        },
        hidden: true
      },
      {
        path: 'dayMoney',
        name: 'dayMoney',
        component: () => import('@/views/home/dayMoney'),
        meta: {
          title: '日金额统计'
        },
        hidden: true
      }
    ]
  },
  {
    path: '/order',
    component: Layout,
    redirect: '/order/morder',
    meta: {
      title: '订单管理',
      icon: 'order',
      roles: ['terminal', 'partner', 'agent', 'director', 'salesman', 'merchants']
    },
    children: [
      {
        path: 'order',
        name: 'order',
        component: () => import('@/views/order/order'),
        meta: {
          title: '全部订单'
        },
        props: {
          user_type: 2
        },
        hidden: true
      },
      {
        path: 'morder',
        name: 'morder',
        component: () => import('@/views/order/order'),
        meta: {
          title: '我的订单'
        },
        props: {
          user_type: 0
        },
        hidden: true
      },
      {
        path: 'meOrder',
        name: 'meOrder',
        component: () => import('@/views/order/order'),
        meta: {
          title: '我的订单',
          roles: ['partner', 'agent', 'director', 'salesman', 'merchants']
        },
        props: {
          user_type: 0
        }
      },
      {
        path: 'subOrder',
        name: 'subOrder',
        component: () => import('@/views/order/order'),
        meta: {
          title: '下级订单',
          roles: ['partner', 'agent', 'director']
        },
        props: {
          user_type: 1
        }
      },
      {
        path: 'subOrder',
        name: 'subOrder',
        component: () => import('@/views/order/order'),
        meta: {
          title: '订单管理',
          roles: ['terminal']
        },
        props: {
          user_type: 1
        }
      },
      {
        path: 'detail',
        name: 'detail',
        component: () => import('@/views/order/detail'),
        meta: {
          title: '订单详情'
        },
        hidden: true
      },
      // {
      //   path: 'accredit',
      //   name: 'accredit',
      //   component: () => import('@/views/order/accredit'),
      //   meta: {
      //     title: '授权订单',
      //     roles: ['terminal', 'partner', 'agent']
      //   }
      // },
      {
        path: 'editAccredit',
        name: 'editAccredit',
        component: () => import('@/views/order/editAccredit'),
        meta: {
          title: '添加授权订单',
          roles: ['partner']
        },
        hidden: true
      },
      {
        path: 'scanCode',
        name: 'scanCode',
        component: () => import('@/views/order/scanCode'),
        meta: {
          title: '扫码记录'
        },
        hidden: true
      },
      {
        path: 'scanStat',
        name: 'scanStat',
        component: () => import('@/views/order/scanStat'),
        meta: {
          title: '扫码统计'
        },
        hidden: true
      }
    ]
  },
  {
    path: '/equipment',
    component: Layout,
    redirect: '/equipment/index',
    meta: {
      title: '设备管理',
      icon: 'equipment',
      roles: ['terminal', 'partner', 'agent', 'director', 'salesman', 'merchants']
    },
    children: [
      {
        path: 'shopEquip',
        name: 'shopEquip',
        component: () => import('@/views/equipment/shopEquip'),
        meta: {
          title: '我的设备',
          roles: ['merchants']
        }
      },
      {
        path: 'index',
        name: 'equipment',
        component: () => import('@/views/equipment/index'),
        meta: {
          title: '我的设备',
          roles: ['partner', 'agent', 'director', 'salesman']
        },
        // props: {
        //   user_type: 0
        // },
        props: (route) => ({ user_type: route.query.user_type || 0 })
      },
      {
        path: 'subEquipment',
        name: 'subEquipment',
        component: () => import('@/views/equipment/index'),
        meta: {
          title: '下级设备',
          roles: ['partner', 'agent', 'director']
        },
        props: {
          user_type: 1
        }
      },
      {
        path: 'subEquipment',
        name: 'subEquipment',
        component: () => import('@/views/equipment/index'),
        meta: {
          title: '设备管理',
          roles: ['terminal']
        },
        props: {
          user_type: 1
        }
      },
      {
        path: 'powerBankRecord/:id(\\d+)',
        name: 'powerBankRecord',
        component: () => import('@/views/equipment/powerBankRecord'),
        meta: {
          title: '流通记录',
          activeMenu: '/equipment/powerBank'
        },
        hidden: true
      },
      {
        path: 'popup/:goods_sn',
        name: 'equipPopup',
        component: () => import('@/views/equipment/popup'),
        meta: {
          title: '设备弹出',
          activeMenu: '/equipment/index'
        },
        hidden: true
      },
      {
        path: 'popupRecord/:goods_sn',
        name: 'popupRecord',
        component: () => import('@/views/equipment/popupRecord'),
        meta: {
          title: '设备弹出记录',
          activeMenu: '/equipment/index'
        },
        hidden: true
      },
      {
        path: 'signal',
        name: 'signal',
        component: () => import('@/views/equipment/signal'),
        meta: {
          title: '设备信号曲线图',
          activeMenu: '/equipment/index'
        },
        hidden: true
      },
      {
        path: 'adver/:id(\\d+)',
        name: 'shopAdver',
        component: () => import('@/views/shop/adver'),
        meta: {
          title: '跳转广告',
          activeMenu: '/shop/index'
        },
        hidden: true
      },
      {
        path: 'oemQrcode',
        name: 'oemQrcode',
        component: () => import('@/views/qrcode/oemQrcode'),
        meta: {
          keepAlive: true,
          title: '设备二维码',
          roles: ['partner']
        }
      },
      {
        path: 'bindRecord',
        name: 'bindRecord',
        component: () => import('@/views/equipment/bindRecord'),
        meta: {
          keepAlive: true,
          title: '铺货记录'
        },
        hidden: true
      }
    ]
  },
  {
    path: '/shop',
    component: Layout,
    redirect: '/shop/index',
    meta: {
      title: '商户管理',
      icon: 'shop',
      roles: ['terminal', 'partner', 'agent', 'director', 'salesman']
    },
    children: [
      {
        path: 'allShop',
        name: 'allShop',
        component: () => import('@/views/shop/index'),
        meta: {
          keepAlive: true,
          title: '全部商户'
        },
        props: {
          user_type: 2
        },
        hidden: true
      },
      {
        path: 'index',
        name: 'shop',
        component: () => import('@/views/shop/index'),
        meta: {
          keepAlive: true,
          title: '我的商户',
          roles: ['partner', 'agent', 'director', 'salesman']
        },
        props: {
          user_type: 0
        }
      },
      {
        path: 'subShop',
        name: 'subShop',
        component: () => import('@/views/shop/index'),
        meta: {
          keepAlive: true,
          title: '下级商户',
          roles: ['partner', 'agent', 'director']
        },
        props: {
          user_type: 1
        }
      },
      {
        path: 'subShop',
        name: 'subShop',
        component: () => import('@/views/shop/index'),
        meta: {
          keepAlive: true,
          title: '商户管理',
          roles: ['terminal']
        },
        props: {
          user_type: 1
        }
      },
      {
        path: 'detail/:id(\\d+)',
        name: 'shopDetail',
        component: () => import('@/views/shop/detail'),
        meta: {
          title: '商户详情',
          activeMenu: '/shop/index'
        },
        hidden: true
      },
      {
        path: 'create',
        name: 'shopCreate',
        component: () => import('@/views/shop/edit'),
        meta: {
          title: '添加商户',
          roles: ['partner', 'agent', 'director', 'salesman']
        }
      },
      {
        path: 'edit/:id(\\d+)',
        name: 'shopEdit',
        component: () => import('@/views/shop/edit'),
        meta: {
          title: '编辑商户',
          activeMenu: '/shop/index'
        },
        hidden: true
      },
      {
        path: 'setvip',
        name: 'setvip',
        component: () => import('@/views/shop/setvip'),
        meta: {
          title: '添加会员',
          activeMenu: '/shop/index'
        },
        hidden: true
      },
      {
        path: 'billing/:id(\\d+)',
        name: 'billing',
        component: () => import('@/views/shop/billing'),
        meta: {
          title: '计费设置',
          activeMenu: '/shop/index'
        },
        hidden: true
      },
      {
        path: 'steal/:id(\\d+)',
        name: 'steal',
        component: () => import('@/views/shop/steal'),
        meta: {
          title: 'DD设置',
          activeMenu: '/shop/index'
        },
        hidden: true
      },
      {
        path: 'withdraw',
        name: 'shopWithdraw',
        component: () => import('@/views/shop/withdraw'),
        meta: {
          title: '商户提现信息设置',
          activeMenu: '/shop/index'
        },
        hidden: true
      },
      {
        path: 'public/:id(\\d+)',
        name: 'shopPublic',
        component: () => import('@/views/shop/public'),
        meta: {
          title: '公众号设置',
          activeMenu: '/shop/index'
        },
        hidden: true
      },
      {
        path: 'replySet',
        name: 'replySet',
        component: () => import('@/views/shop/replySet'),
        meta: {
          title: '关注回复设置'
        },
        hidden: true
      },
      {
        path: 'dayStat/:id(\\d+)',
        name: 'dayStat',
        component: () => import('@/views/shop/dayStat'),
        meta: {
          title: '数据统计'
        },
        hidden: true
      }
    ]
  },
  {
    path: '/shop',
    component: Layout,
    redirect: '/shop/myShop',
    meta: {
      title: '我的商户',
      icon: 'shop',
      roles: ['merchants']
    },
    children: [{
      path: 'myShop',
      name: 'myShop',
      component: () => import('@/views/shop/myShop'),
      meta: {
        title: '我的商户'
      }
    }]
  },
  {
    path: '/userManage',
    component: Layout,
    redirect: '/userManage/userList',
    meta: {
      title: '用户管理',
      icon: 'userList',
      roles: ['terminal', 'partner', 'agent', 'director', 'salesman']
    },
    children: [{
        path: 'userList',
        name: 'userList',
        component: () => import('@/views/user/userList'),
        meta: {
          title: '用户列表',
          roles: ['terminal', 'partner', 'agent', 'director', 'salesman', 'merchants']
        }
      },
      {
        path: 'payComplaints',
        name: 'payComplaints',
        component: () => import('@/views/user/payComplaints'),
        meta: {
          title: '用户投诉',
          roles: ['partner'],
          keepAlive: true
        }
      },
      {
        path: 'PCDetail',
        name: 'PCDetail',
        component: () => import('@/views/user/PCDetail'),
        meta: {
          title: '用户投诉详情',
          roles: ['partner']
        },
        hidden: true
      },
      {
        path: 'userFeedback',
        name: 'userFeedback',
        component: () => import('@/views/feedback/userFeedback'),
        meta: {
          title: '用户反馈',
          roles: ['partner']
        }
      },
      {
        path: 'portrait',
        name: 'portrait',
        component: () => import('@/views/user/portrait'),
        meta: {
          title: '用户画像',
          roles: ['partner']
        }
      },
      {
        path: 'user_order',
        name: 'user_order',
        component: () => import('@/views/order/order'),
        meta: {
          title: '用户订单'
        },
        props: {
          user_type: 2
        },
        hidden: true
      }
    ]
  },
  {
    path: '/qrcode',
    component: Layout,
    redirect: '/qrcode/index',
    meta: {
      title: '二维码管理',
      icon: 'qrcode',
      roles: ['terminal', 'partner']
    },
    children: [
      {
        path: 'index',
        name: 'qrcode',
        component: () => import('@/views/qrcode/index'),
        meta: {
          keepAlive: true,
          title: '二维码管理',
          roles: ['terminal']
        }
      },
      {
        path: 'edit',
        name: 'qrcodeEdit',
        component: () => import('@/views/qrcode/edit'),
        meta: {
          title: '编辑二维码'
        },
        hidden: true
      },
      {
        path: 'create',
        name: 'qrcodecreate',
        component: () => import('@/views/qrcode/create'),
        meta: {
          title: '生成二维码'
        },
        hidden: true
      }
    ]
  },
  {
    path: '/partner',
    component: Layout,
    redirect: '/partner/index',
    meta: {
      title: '品牌管理',
      icon: 'agent',
      roles: ['terminal']
    },
    children: [
      {
        path: 'index',
        name: 'agent',
        component: () => import('@/views/agent/index'),
        meta: {
          title: '我的品牌',
          keepAlive: true
        },
        props: {
          user_type: 0
        }
      },
      {
        path: 'subAgent',
        name: 'subAgent',
        component: () => import('@/views/agent/index'),
        meta: {
          title: '下级代理',
          keepAlive: true
        },
        props: {
          user_type: 1
        }
      },
      {
        path: 'create',
        name: 'agentCreate',
        component: () => import('@/views/agent/edit'),
        meta: {
          title: '添加品牌'
        }
      },
    ],
  },
  {
    path: '/agent',
    component: Layout,
    redirect: '/agent/index',
    meta: {
      title: '代理管理',
      icon: 'agent',
      roles: ['terminal', 'partner', 'agent', 'director']
    },
    children: [{
        path: 'index',
        name: 'agent',
        component: () => import('@/views/agent/index'),
        meta: {
          title: '我的代理',
          roles: ['partner', 'agent', 'director'],
          keepAlive: true
        },
        props: {
          user_type: 0
        }
      },
      {
        path: 'subAgent',
        name: 'subAgent',
        component: () => import('@/views/agent/index'),
        meta: {
          title: '下级代理',
          roles: ['partner', 'agent'],
          keepAlive: true
        },
        props: {
          user_type: 1
        }
      },
      {
        path: 'create',
        name: 'agentCreate',
        component: () => import('@/views/agent/edit'),
        meta: {
          title: '添加代理',
          roles: ['partner', 'agent', 'director']
        }
      },
      {
        path: 'edit/:id(\\d+)',
        name: 'agentEdit',
        component: () => import('@/views/agent/edit'),
        meta: {
          title: '编辑代理',
          activeMenu: '/agent/index',
          roles: ['terminal', 'partner', 'agent', 'director']
        },
        hidden: true
      },
      {
        path: 'equip',
        name: 'agentEquip',
        component: () => import('@/views/agent/equip'),
        meta: {
          title: '代理设备',
          activeMenu: '/agent/index',
          roles: ['terminal', 'partner', 'agent', 'director']
        },
        hidden: true
      },
      {
        path: 'contract',
        name: 'contract',
        component: () => import('@/views/agent/contract'),
        meta: {
          title: '合同管理',
          activeMenu: '/agent/contract'
        },
        hidden: true
      },
      {
        path: 'agentBilling',
        name: 'agentBilling',
        component: () => import('@/views/agent/billing'),
        meta: {
          title: '合伙人计费方式',
          activeMenu: '/agent/index'
        },
        hidden: true
      }
    ],
  },
  {
    path: '/condom',
    component: Layout,
    redirect: '/condom/goods',
    meta: {
      title: '商品管理',
      icon: 'agent',
      roles: ['partner', 'agent', 'director', 'salesman', 'merchants']
    },
    children: [
      {
        path: 'goods',
        name: 'condomGoods',
        component: () => import('@/views/condom/goods'),
        meta: {
          title: '商品管理',
          roles: ['partner', 'agent', 'director', 'merchants'],
          keepAlive: true
        }
      },
      {
        path: 'billing',
        name: 'condomBilling',
        component: () => import('@/views/setting/billing'),
        meta: {
          title: '默认设置',
          roles: ['partner']
        },
        props: {
          cutDevice: 7
        }
      },
      {
        path: 'goodsEdit',
        name: 'condomGoodsEdit',
        component: () => import('@/views/condom/goodsEdit'),
        meta: {
          title: '添加商品',
          roles: ['partner', 'agent', 'director', 'merchants']
        }
      },
      {
        path: 'shopGoods/:id(\\d+)',
        name: 'shopCondomGoods',
        component: () => import('@/views/condom/shopGoods'),
        meta: {
          title: '关联商品',
          roles: ['partner', 'agent', 'director', 'salesman']
        },
        props: {
          type: 1
        },
        hidden: true
      },
      {
        path: 'shopGoodes',
        name: 'shopCondomGoods',
        component: () => import('@/views/condom/shopGoods'),
        meta: {
          title: '关联商品',
          roles: ['merchants']
        },
        props: {
          type: 2
        }
      },
      {
        path: 'plusGoods',
        name: 'plusGoods',
        component: () => import('@/views/condom/plusGoods'),
        meta: {
          title: '补货记录',
          roles: ['partner', 'agent', 'director', 'salesman']
        },
        hidden: true
      },
    ],
  },
  {
    path: '/withdraw',
    component: Layout,
    redirect: '/withdraw/reviewe',
    meta: {
      title: '资金管理',
      icon: 'zijing'
    },
    children: [{
        path: 'reviewe',
        name: 'reviewe',
        component: () => import('@/views/withdraw/reviewe'),
        meta: {
          title: '代理提现',
          roles: ['partner', 'agent', 'director']
        },
        props: {
          user_type: 1
        }
      },
      {
        path: 'shopReviewe',
        name: 'shopReviewe',
        component: () => import('@/views/withdraw/reviewe'),
        meta: {
          title: '商户提现',
          roles: ['partner', 'agent', 'director', 'salesman']
        },
        props: {
          user_type: 2
        }
      },
      {
        path: 'userReviewe',
        name: 'userReviewe',
        component: () => import('@/views/withdraw/userReviewe'),
        meta: {
          title: '用户提现',
          roles: ['partner']
        },
      },
      {
        path: 'doorfee',
        name: 'doorfee',
        component: () => import('@/views/withdraw/doorfee'),
        meta: {
          title: '入场费记录',
          roles: ['partner']
        },
      },
      {
        path: 'withdraw',
        name: 'withdraw',
        component: () => import('@/views/withdraw/withdraw'),
        meta: {
          title: '申请提现',
          roles: ['agent', 'director', 'salesman', 'merchants']
        }
      },
      {
        path: 'record',
        name: 'withdrawRecord',
        component: () => import('@/views/withdraw/record'),
        meta: {
          title: '我的提现记录',
          roles: ['agent', 'director', 'salesman', 'merchants']
        }
      },
      {
        path: 'recharge',
        name: 'recharge',
        component: () => import('@/views/withdraw/recharge'),
        meta: {
          title: '充值记录',
          roles: ['partner']
        },
      },
      {
        path: 'cashpledge',
        name: 'cashpledge',
        component: () => import('@/views/withdraw/cashpledge'),
        meta: {
          title: '退押管理',
          roles: ['partner']
        },
      },
      {
        path: 'member',
        name: 'member',
        component: () => import('@/views/withdraw/member'),
        meta: {
          title: '会员开通记录',
          roles: ['partner']
        },
      }
    ]
  },
  {
    path: '/entity',
    component: Layout,
    redirect: '/entity/card',
    meta: {
      title: '充值卡',
      icon: 'withdraw',
      roles: ['partner']
    },
    children: [
      {
        path: 'card',
        name: 'entityCard',
        component: () => import('@/views/entity/card'),
        meta: {
          title: '充值卡'
        }
      },
      {
        path: 'charge',
        name: 'charge',
        component: () => import('@/views/entity/charge'),
        meta: {
          title: '充值记录'
        }
      },
      {
        path: 'chargeMoney',
        name: 'chargeMoney',
        component: () => import('@/views/entity/chargeMoney'),
        meta: {
          title: '充值设置'
        }
      },
    ]
  },
  {
    path: '/run',
    component: Layout,
    redirect: '/run/repair',
    meta: {
      title: '运营管理',
      icon: 'run',
      roles: ['terminal', 'partner', 'agent', 'director', 'salesman']
    },
    children: [
      {
        path: 'shopAlarm',
        name: 'shopAlarm',
        component: () => import('@/views/run/shopAlarm'),
        meta: {
          title: '商户警报',
          roles: ['terminal', 'partner', 'agent', 'director', 'salesman']
        }
      },
      {
        path: 'deviceOrder',
        name: 'deviceOrder',
        component: () => import('@/views/run/deviceOrder'),
        meta: {
          title: '设备购买记录',
          roles: ['terminal', 'partner']
        }
      },
      {
        path: 'repair',
        name: 'repair',
        component: () => import('@/views/equipment/repair'),
        meta: {
          title: '设备报修记录',
        }
      },
      {
        path: 'powerBank',
        name: 'powerBank',
        component: () => import('@/views/equipment/powerBank'),
        meta: {
          title: '充电宝管理',
          roles: ['terminal', 'partner', 'agent', 'director', 'salesman']
        }
      },
      {
        path: 'operating',
        name: 'operating',
        component: () => import('@/views/equipment/operating'),
        meta: {
          title: '设备运营',
          roles: ['terminal', 'partner', 'agent', 'director', 'salesman']
        }
      },
      {
        path: 'device',
        name: 'deviceType',
        component: () => import('@/views/setting/device'),
        meta: {
          title: '设备类型',
          roles: ['terminal']
        }
      }
    ]
  },
  {
    path: '/adver',
    component: Layout,
    redirect: '/adver/weChatBase',
    meta: {
      title: '广告管理',
      icon: 'ad'
    },
    children: [
      {
        path: 'weChatBase',
        name: 'weChatAdBase',
        component: () => import('@/views/adver/weChatBase'),
        meta: {
          title: '微信广告',
          roles: ['terminal', 'partner']
        }
      },
      {
        path: 'weChatList',
        name: 'weChatAdList',
        component: () => import('@/views/adver/weChatList'),
        meta: {
          title: '广告列表',
          activeMenu: '/adver/weChatBase',
          roles: ['terminal', 'partner']
        },
        hidden: true
      },
      {
        path: 'weChatData',
        name: 'weChatData',
        component: () => import('@/views/adver/weChatData'),
        meta: {
          title: '微信广告数据',
          activeMenu: '/adver/weChatBase',
          roles: ['terminal', 'partner']
        },
        hidden: true
      },
      {
        path: 'position',
        name: 'adPosition',
        component: () => import('@/views/adver/position'),
        meta: {
          title: '传统广告',
          roles: ['terminal', 'partner', 'agent', 'director', 'merchants']
        }
      },
      {
        path: 'adAudit',
        name: 'adAudit',
        component: () => import('@/views/adver/adAudit'),
        meta: {
          title: '广告审核',
          roles: ['partner']
        }
      },
      {
        path: 'setPower',
        name: 'setPower',
        component: () => import('@/views/adver/position'),
        meta: {
          title: '广告位'
        },
        hidden: true
      },
      {
        path: 'photo',
        name: 'adPhoto',
        component: () => import('@/views/adver/photo'),
        meta: {
          activeMenu: '/adver/position',
          title: '广告列表',
        },
        hidden: true
      },
      {
        path: 'edit',
        name: 'adEdit',
        component: () => import('@/views/adver/edit'),
        meta: {
          activeMenu: '/adver/position',
          title: '添加广告',
        },
        hidden: true
      },
      {
        path: 'bindEquip',
        name: 'bindEquip',
        component: () => import('@/views/adver/bindEquip'),
        meta: {
          activeMenu: '/adver/position',
          title: '广告绑定设备'
        },
        hidden: true
      }
    ]
  },
  {
    path: '/signup',
    component: Layout,
    redirect: '/signup/index',
    meta: {
      title: '报名活动',
      icon: 'signup',
      roles: ['partner']
    },
    children: [
      {
        path: 'index',
        name: 'signupAct',
        component: () => import('@/views/signup/index'),
        meta: {
          title: '活动列表',
          roles: ['partner']
        }
      },
      {
        path: 'edit',
        name: 'signupEdit',
        component: () => import('@/views/signup/edit'),
        meta: {
          title: '添加活动'
        }
      },
      {
        path: 'signIn',
        name: 'signIn',
        component: () => import('@/views/signup/signIn'),
        meta: {
          title: '报名记录'
        },
        hidden: true
      }
    ]
  },
  {
    path: '/wx',
    component: Layout,
    redirect: '/wx/index',
    meta: {
      title: '微信小程序',
      icon: 'wx',
      roles: ['terminal', 'partner']
    },
    children: [
      {
        path: 'create',
        name: 'createXcx',
        component: () => import('@/views/wx/edit'),
        meta: {
          title: '绑定小程序',
          roles: ['terminal', 'partner']
        },
        hidden: true
      },
      {
        path: 'edit/:id(\\d+)',
        name: 'editXcx',
        component: () => import('@/views/wx/edit'),
        meta: {
          title: '修改小程序',
          roles: ['terminal', 'partner']
        },
        hidden: true
      },
      {
        path: 'domain',
        name: 'domainXcx',
        component: () => import('@/views/wx/domain'),
        meta: {
          title: '小程序域名',
          roles: ['terminal', 'partner']
        },
        hidden: true
      },
      {
        path: 'index',
        name: 'wxindex',
        component: () => import('@/views/wx/index'),
        meta: {
          title: '小程序管理',
          roles: ['terminal']
        }
      },
      {
        path: 'wxpublic',
        name: 'wxpublic',
        component: () => import('@/views/wx/wxpublic'),
        meta: {
          title: '公众号管理',
          roles: ['terminal']
        }
      },
      {
        path: 'public',
        name: 'public',
        component: () => import('@/views/wx/public'),
        meta: {
          title: '微信公众号',
          roles: ['terminal']
        },
        hidden: true
      },
      {
        path: 'draft',
        name: 'wxdraft',
        component: () => import('@/views/wx/draft'),
        meta: {
          title: '草稿列表',
          roles: ['terminal']
        }
      },
      {
        path: 'temp',
        name: 'wxtemp',
        component: () => import('@/views/wx/temp'),
        meta: {
          title: '模板列表',
          roles: ['terminal']
        }
      },
      {
        path: 'systemConfig',
        name: 'systemConfig',
        component: () => import('@/views/wx/systemConfig'),
        meta: {
          title: '系统配置',
          roles: ['terminal']
        }
      }
    ]
  },
  {
    path: '/ali',
    component: Layout,
    redirect: '/ali/index',
    meta: {
      title: '支付宝小程序',
      icon: 'ali',
      roles: ['terminal', 'partner']
    },
    children: [
      {
        path: 'index',
        name: 'aliindex',
        component: () => import('@/views/ali/index'),
        meta: {
          title: '支付宝小程序',
          roles: ['terminal']
        }
      },
      {
        path: 'create',
        name: 'createXcx',
        component: () => import('@/views/ali/edit'),
        meta: {
          title: '绑定小程序',
          roles: ['terminal', 'partner']
        },
        hidden: true
      },
      {
        path: 'edit/:id(\\d+)',
        name: 'editXcx',
        component: () => import('@/views/ali/edit'),
        meta: {
          title: '修改小程序',
          roles: ['terminal', 'partner']
        },
        hidden: true
      }
    ]
  },
  /* {
    path: '/mall',
    component: Layout,
    meta: {
      title: '在线商城',
      icon: 'mall'
    },
    children: [{
      path: 'index',
      name: 'mall',
      component: () => import('@/views/mall/index'),
      meta: {
        title: '在线商城'
      }
    }]
  }, */
  {
    path: '/user',
    component: Layout,
    redirect: '/user/index',
    meta: {
      title: '我的信息',
      icon: 'user'
    },
    hidden: true,
    children: [
      {
        path: 'index',
        name: 'userInfo',
        component: () => import('@/views/user/index'),
        meta: {
          title: '资料管理'
        }
      },
      {
        path: 'lpw',
        name: 'loginPw',
        component: () => import('@/views/user/loginPw'),
        meta: {
          title: '登录密码'
        }
      },
      {
        path: 'wpw',
        name: 'withdrawPw',
        component: () => import('@/views/user/withdrawPw'),
        meta: {
          title: '提现密码',
          roles: ['agent', 'director', 'salesman', 'merchants']
        }
      },
      {
        path: 'config',
        name: 'userConfig',
        component: () => import('@/views/user/config'),
        meta: {
          title: '我的设置'
        },
        hidden: true
      },
    ]
  },
  {
    path: '/setting',
    component: Layout,
    redirect: '/setting/index',
    meta: {
      title: '系统设置',
      icon: 'setting',
      roles: ['partner']
    },
    children: [{
        path: 'index',
        name: 'wxindex',
        component: () => import('@/views/wx/index'),
        meta: {
          title: '微信小程序',
          roles: ['partner']
        }
      },
      {
        path: 'public',
        name: 'public',
        component: () => import('@/views/wx/public'),
        meta: {
          title: '微信公众号',
          roles: ['partner']
        }
      },
      {
        path: 'aliIndex',
        name: 'alindex',
        component: () => import('@/views/ali/index'),
        meta: {
          title: '支付宝小程序',
          roles: ['partner']
        }
      },
      {
        path: 'system',
        name: 'systemSetting',
        component: () => import('@/views/setting/system'),
        meta: {
          title: '系统设置',
          roles: ['partner']
        }
      },
      {
        path: 'mytmpl',
        name: 'mytmpl',
        component: () => import('@/views/setting/mytmpl'),
        meta: {
          title: '模板消息',
          roles: ['partner']
        }
      },
      {
        path: 'share',
        name: 'share',
        component: () => import('@/views/setting/share'),
        meta: {
          title: '分享设置',
          roles: ['partner']
        }
      },
      {
        path: 'billing',
        name: 'billingSetting',
        component: () => import('@/views/setting/billing'),
        meta: {
          title: '默认设置',
          roles: ['partner']
        }
      },
      {
        path: 'info',
        name: 'infoSetting',
        component: () => import('@/views/setting/info'),
        meta: {
          title: '平台信息'
        }
      },
      {
        path: 'helpSetting',
        name: 'helpSetting',
        component: () => import('@/views/setting/helpSetting'),
        meta: {
          title: '帮助中心',
          roles: ['partner']
        }
      },
      {
        path: 'alink',
        name: 'alink',
        component: () => import('@/views/setting/link'),
        meta: {
          title: '相关链接',
          roles: ['partner']
        }
      }
    ]
  },
  {
    path: '/station',
    component: Layout,
    redirect: '/station/renewRecord',
    meta: {
      title: '贴牌管理',
      icon: 'setting',
      roles: ['terminal']
    },
    children: [
      {
        path: 'renewRecord',
        name: 'renewRecord',
        component: () => import('@/views/station/renewRecord'),
        meta: {
          title: '续费记录'
        }
      },
      {
        path: 'oemMoney',
        name: 'oemMoney',
        component: () => import('@/views/station/oemMoney'),
        meta: {
          title: '续费设置'
        }
      }
    ]
  },
  {
    path: '/tutorial',
    component: Layout,
    redirect: '/tutorial/tutorial',
    meta: {
      title: '公告教程',
      icon: 'gonggao',
      roles: ['terminal', 'partner', 'agent', 'director']
    },
    children: [
      {
        path: 'tutorial',
        name: 'tutorial',
        component: () => import('@/views/tutorial/list'),
        meta: {
          title: '使用教程'
        },
        props: {
          type: 3,
          title: '教程'
        },
      },
      {
        path: 'notice',
        name: 'notice',
        component: () => import('@/views/tutorial/list'),
        meta: {
          title: '最新公告'
        },
        props: {
          type: 1,
          title: '公告'
        },
      },
      {
        path: 'news',
        name: 'news',
        component: () => import('@/views/tutorial/list'),
        meta: {
          title: '头条新闻'
        },
        props: {
          type: 2,
          title: '头条'
        },
      },
      {
        path: 'update',
        name: 'update',
        component: () => import('@/views/tutorial/list'),
        meta: {
          title: '更新公告',
          roles: ['terminal']
        },
        props: {
          type: 4,
          title: '更新公告'
        }
      },
      {
        path: 'edit',
        name: 'tutorialEdit',
        component: () => import('@/views/tutorial/edit'),
        meta: {
          activeMenu: '/tutorial/tutorial',
          title: '编辑'
        },
        hidden: true
      },
      {
        path: 'detail/:id(\\d+)',
        name: 'tutorialDetail',
        component: () => import('@/views/tutorial/detail'),
        meta: {
          title: '详情'
        },
        hidden: true
      }
    ]
  },
  /* {
    path: '/permission',
    component: Layout,
    meta: {
      title: '权限管理',
      icon: 'gonggao',
      roles: ['terminal']
    },
    children: [
      {
        path: 'add',
        name: 'AddPermisson',
        component: () => import('@/views/permission/add'),
        meta: {
          title: '添加权限'
        }
      },
      {
        path: 'role',
        name: 'RolePermission',
        component: () => import('@/views/permission/role'),
        meta: {
          title: '角色管理'
        }
      }
    ],
  }, */

  // 404 page must be placed at the end !!!
  {
    path: '*',
    redirect: '/404',
    hidden: true
  }
]

const createRouter = () => new Router({
  mode: 'history', // require service support
  routes: constantRoutes,
  scrollBehavior(to, from, savePosition) {
    if (savePosition) {
      return savePosition
    } else {
      return {
        x: 0,
        y: 0
      }
    }
  }
})

const router = createRouter()

// router.beforeEach((to, from, next) => {
//     if (_hmt) {
//         if (to.path) {
//             _hmt.push(['_trackPageview', '/#' + to.fullPath]);
//         }
//     }
//     next();
// });

// router.afterEach((to, from, next) => {
//   window.scrollTo(0, 0)
// })

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
