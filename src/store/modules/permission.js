import { saasRoutes, brandRoutes, agentRoutes, storeRoutes, constantRoutes } from '@/router'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []
  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param authMenu
 */
export function filterAsyncRoutesAuthMenu(routes, authMenu) {
  var res = []
  routes.forEach(route => {
    const tmp = { ...route }, path = tmp.path.replace('/', ''), redirect = tmp.redirect ? tmp.redirect.replace('/', '') : '0'
    if(authMenu.indexOf(path) > -1 || authMenu.indexOf(redirect) > -1){
      if (tmp.children) {
        tmp.children = filterAsyncRoutesAuthMenu(tmp.children, authMenu)
      }
      res.push(tmp)
    }
  })
  if(res.length == 0) res = routes
  return res
}


const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }, info) {
    // TODO 设置角色权限菜单
    return new Promise(resolve => {
      let accessedRoutes, asyncRoutes = []
      if (info.roles.includes('admin')) {
        asyncRoutes = saasRoutes
      } else if (info.roles.includes('store')) {
        asyncRoutes = storeRoutes
      } else if (info.roles.includes('agent')) {
        asyncRoutes = agentRoutes
      } else {
        asyncRoutes = brandRoutes
      }
      //accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      accessedRoutes = filterAsyncRoutesAuthMenu(asyncRoutes, info.authMenu)
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
