import { asyncRoutes, constantRoutes } from '@/router'

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
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      let accessedRoutes
      for(var i in asyncRoutes){
        if(agentInfo.agent_level == 5 && agentInfo.virtual_divide == 1){
          if((asyncRoutes[i].path.indexOf('/home') > -1 || asyncRoutes[i].path.indexOf('/order') > -1) && asyncRoutes[i]['meta']['roles']){
            asyncRoutes[i]['meta']['roles'].splice(asyncRoutes[i]['meta']['roles'].indexOf('merchants'), 1);
          }
        }
        if(agentInfo.check_order == 0 && asyncRoutes[i].path == '/order'){
          asyncRoutes[i]['meta']['roles'] = ['']
        }
        if(agentInfo.withdraw_right == 0 && asyncRoutes[i].path == '/withdraw'){
          asyncRoutes[i]['children'][4]['meta']['roles'] = ['']
          asyncRoutes[i]['children'][5]['meta']['roles'] = ['']
          if(agentInfo.agent_level == 5) asyncRoutes[i]['meta']['roles'] = ['']
        }
        if(agentInfo.business_type == 1 && asyncRoutes[i].path == '/withdraw'){
          asyncRoutes[i]['children'][0]['meta']['roles'] = ['']
          asyncRoutes[i]['children'][1]['meta']['roles'] = ['']
        }
        if(agentInfo.business_type == 1 && asyncRoutes[i].path == '/adver'){
          asyncRoutes[i]['meta']['roles'] = ['']
        }
        if(asyncRoutes[i].path == '/run'){
          if(deviceNameObj && Object.values(deviceNameObj).indexOf(0) == -1 && asyncRoutes[i]['children'][3]){
            asyncRoutes[i]['children'][3]['meta']['roles'] = ['']
          }
        }
        if(asyncRoutes[i].path == '/condom'){
          if(deviceNameObj && Object.values(deviceNameObj).indexOf(7) == -1){
            asyncRoutes[i]['meta']['roles'] = ['']
          }
          if(agentInfo.take_my_product != 1){
            asyncRoutes[i]['children'][0]['meta']['roles'] = ['']
            asyncRoutes[i]['children'][2]['meta']['roles'] = ['']
            if(agentInfo.agent_level == 5) {
              asyncRoutes[i]['children'][4]['meta']['roles'] = ['']
            }
          }
        }
        if(asyncRoutes[i].path == '/entity'){
          if(deviceNameObj && Object.values(deviceNameObj).length == 1 && Object.values(deviceNameObj).indexOf(0) > -1){
            asyncRoutes[i]['meta']['roles'] = ['']
          }
        }
        // if(asyncRoutes[i].path == '/setting'){
        //   if(deviceNameObj && Object.values(deviceNameObj).length == 1 && Object.values(deviceNameObj).indexOf(0) > -1){
        //     asyncRoutes[i]['children'][6]['meta']['roles'] = ['']
        //   }
        // }
        if(asyncRoutes[i].path == '/wx'){
          if(siteInfo && !siteInfo.wx_third_api_switch){
            asyncRoutes[i].hidden = true
          }
        }
        if(asyncRoutes[i].path == '/station'){
          if(siteInfo && !siteInfo.wx_third_api_switch){
            asyncRoutes[i].hidden = true
          }
        }
        if(asyncRoutes[i].path == '/ali'){
          if(siteInfo && !siteInfo.zfb_third_api_switch){
            asyncRoutes[i].hidden = true
          }
        }
      }
      if (roles.includes('admin')) {
        accessedRoutes = asyncRoutes || []
      } else {
        accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      }
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
