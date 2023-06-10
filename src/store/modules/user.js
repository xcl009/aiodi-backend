import Vue from 'vue'
import { login, codeLogin, logout, getInfo, getPlatformConfig, getMyDevice, getSaasDevice, getConstant, getWdConstant, getAuthMenu } from '@/api/user'
import { arrayToObj } from '@/utils/index'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: '',
    siteInfo: {},
    agentInfo: {},
    Ability: {},
    Constant: {}
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_USER_TYPE: (state, userType) => {
    state.userType = userType
  },
  SET_AGENT_DEVICE: (state, res) => {
    state.myDeviceName = res.myDeviceName
    state.myDeviceId = res.myDeviceId
    state.myDevice = res.myDevice
    state.myProfitRatio = res.myProfitRatio
  },
  SET_SITEINFO: (state, res) => {
    state.siteInfo = res
  },
  SET_AGENTINFO: (state, res) => {
    state.agentInfo = res
  },
  SET_ABILITY: (state, res) => {
    state.Ability = res
  },
  SET_CONSTANT: (state, res) => {
    state.Constant = res
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password.trim(), loginType: 'UP' }).then(data => {
        commit('SET_TOKEN', data.loginToken.accessToken)
        commit('SET_NAME', data.username)
        commit('SET_USER_TYPE', data.userType)
        Vue.prototype.userType = data.userType
        setToken(data.loginToken.accessToken)
        setToken('pc', 'appid')
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 验证码登录 login
  codeLogin({ commit }, formData) {
    const { phone_num, captche_num } = formData
    return new Promise((resolve, reject) => {
      codeLogin({ phone_num: phone_num.trim(), captche_num: captche_num }).then(data => {
        commit('SET_TOKEN', data.token)
        setToken(data.token)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(data => {
        if(data.userType){
          if(data.brandId){
            setToken(data.brandId, 'brandId')
          }
          getAuthMenu({ifTreeStructure: true}).then(res => {
            let menu = [], AssignAbility = [], Ability = {}
            res = res || []
            res.map(item => {
              Ability[item.label] = true
              if(item.displayFlag != 'CANNOT_ASSIGN'){
                AssignAbility.push({
                  id: item.id,
                  parentId: item.parentId,
                  displayFlag: item.displayFlag,
                  name: item.name
                })
              }
              let childMenu = []
              if(item.childrenAuthList && item.childrenAuthList.length > 0){
                item.childrenAuthList.map(sitem => {
                  Ability[sitem.label] = true
                  if(sitem.displayFlag != 'CANNOT_ASSIGN'){
                    AssignAbility.push({
                      id: sitem.id,
                      parentId: sitem.parentId,
                      displayFlag: sitem.displayFlag,
                      name: sitem.name
                    })
                  }
                  if(sitem.menuType == 'MENU' && sitem.url){
                    let smenu = JSON.parse(sitem.url)
                    childMenu.push({
                      path: smenu.path,
                      name: sitem.label,
                      component: smenu.src,
                      meta: {
                        title: sitem.name,
                        activeMenu: smenu.activeMenu || '',
                        keepAlive: smenu.keepAlive || false,
                        breadcrumb: sitem.breadcrumb || true,
                      },
                      hidden: smenu.hidden || false,
                      props: smenu.props || {}
                    })
                  }
                })
              }
              if(item.menuType == 'MENU' && item.url){
                let fmenu = JSON.parse(item.url)
                menu.push({
                  component: 'Layout',
                  path: fmenu.path,
                  redirect: fmenu.redirect || '',
                  meta: {
                    title: item.name,
                    icon: item.icon,
                    breadcrumb: fmenu.breadcrumb || true,
                  },
                  hidden: fmenu.hidden || false,
                  children: childMenu
                })
              }
            })
            data.AssignAbility = AssignAbility
            window.agentInfo = data
            commit('SET_NAME', data.nickname || data.username)
            commit('SET_AVATAR', data.avastar || '')
            commit('SET_AGENTINFO', data)
            commit('SET_ABILITY', Ability)
            resolve({
              roles: [data.userType],
              menu: menu
            })
          })
        }
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get platform config
  getPlatformConfig({ commit, state }, params = {}) {
    return new Promise((resolve, reject) => {
      getPlatformConfig({
        brandId: params.brandId || getToken('brandId')
      }).then(data => {
        data = data || {}
        commit('SET_SITEINFO', data)
        if(data.appName){
          var icon_link = document.createElement('link')
              icon_link.type = 'image/x-icon'
              icon_link.rel = 'shortcut icon'
              icon_link.href = data.appLogo
          document.getElementsByTagName('head')[0].appendChild(icon_link)
          document.title = `${data.appName}-管理后台`;
        }
        data.time_unit = data.fund_fee_time_unit == 0 ? '分钟' : '小时'
        data.withdrawType = {
          1: "微信提现",
          2: "微信收款码",
          3: "支付宝提现",
          4: "支付宝收款码",
          5: "银行卡"
        }
        Vue.prototype.SITE_INFO = data
        resolve(data)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      removeToken() // must remove  token  first
      resetRouter()
      commit('RESET_STATE')
      resolve()
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      removeToken('user_id')
      commit('RESET_STATE')
      resolve()
    })
  },

  // 获取当前代理设备类型
  getMyDevice({ commit, state }) {
    return new Promise((resolve, reject) => {
      if(Vue.prototype.isSaas()){
        getSaasDevice().then(res => {
          let myDeviceName = {}, myDeviceId = {}, myDevice = [], myProfitRatio = {}
          for(var i in res){
            let d = res[i]
            if(!d.fatherCode){
              myDeviceName[d.name] = d.code
              myDeviceId[d.code] = d.name
              myProfitRatio[d.code] = 100
            }
            myDevice.push(d)
          }
          commit('SET_AGENT_DEVICE', JSON.parse(JSON.stringify({
            myDeviceName: myDeviceName,
            myDeviceId: myDeviceId,
            myDevice: myDevice,
            myProfitRatio: myProfitRatio
          })))
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      } else {
        getMyDevice().then(res => {
          let myDeviceName = {}, myDeviceId = {}, myDevice = [], myProfitRatio = {}
          for(var i in res){
            let d = res[i]
            if(!d.fatherCode){
              myDeviceName[d.name] = d.deviceTypeCode
              myDeviceId[d.deviceTypeCode] = d.name
              myProfitRatio[d.deviceTypeCode] = d.profitRatio
            }
            myDevice.push(d)
          }
          commit('SET_AGENT_DEVICE', JSON.parse(JSON.stringify({
            myDeviceName: myDeviceName,
            myDeviceId: myDeviceId,
            myDevice: myDevice,
            myProfitRatio: myProfitRatio
          })))
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      }
    })
  },

  // 获取常数
  getConstant({ commit, state }) {
    return new Promise((resolve, reject) => {
      getConstant().then(res => {
        getWdConstant().then(wdres => {
          let allObj = Object.assign(res, wdres)
          commit('SET_CONSTANT', allObj)
          resolve(allObj)
        })
      }).catch(error => {
        reject(error)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
