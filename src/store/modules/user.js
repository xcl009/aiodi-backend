import Vue from 'vue'
import { login, codeLogin, logout, getInfo, getPlatformConfig, getMyDevice, postSetRecode } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: '',
    siteInfo: {},
    agentInfo: {}
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
  },
  SET_SITEINFO: (state, res) => {
    state.siteInfo = res
  },
  SET_AGENTINFO: (state, res) => {
    state.agentInfo = res
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      // setToken('55555555555')
      // setToken('111', 'user_id')
      // resolve({})
      // return
      login({ username: username.trim(), password: password, loginType: 'UP', 'appid': 'pc' }).then(data => {
        console.log(data)
        commit('SET_TOKEN', data.loginToken.accessToken)
        commit('SET_NAME', data.username)
        commit('SET_USER_TYPE', data.userType)
        Vue.prototype.userType = data.userType
        setToken(data.loginToken.accessToken)
        setToken(data.loginToken.refreshToken, 'refreshToken')
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
        setToken(data.user_id, 'user_id')
        setToken(data.belong_partner_aid || data.user_id, 'agent_id')
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
        window.agentInfo = {}
        commit('SET_NAME', 'saas')
        commit('SET_AVATAR', '/logo.png')
        commit('SET_AGENTINFO', {
          avatar: '/logo.png',
          name: 'saas'
        })
        resolve({
          roles: ['saas']
        })
      // getInfo(state.token).then(data => {
      //   if (data.code > 0) {
      //     reject('验证失败，请重新登录。')
      //   }
      //   const { user_name, avatar, agent_level } = data
      //   commit('SET_NAME', 'saas')
      //   commit('SET_AVATAR', avatar)
      //   commit('SET_AGENTINFO', data)
      //   resolve(data)
      // }).catch(error => {
      //   reject(error)
      // })
    })
  },

  // get platform config
  getPlatformConfig({ commit, state }, params = {}) {
    return new Promise((resolve, reject) => {
      getPlatformConfig(params).then(data => {
        commit('SET_SITEINFO', data)
        if(data.mini_name){
          var icon_link = document.createElement('link')
              icon_link.type = 'image/x-icon'
              icon_link.rel = 'shortcut icon'
              icon_link.href = data.mini_logo || data.mini_logo
          document.getElementsByTagName('head')[0].appendChild(icon_link)
          document.title = `${data.mini_name}-管理后台`;
        }
        data.time_unit = data.fund_fee_time_unit == 0 ? '分钟' : '小时'
        Vue.prototype.SITE_INFO = data
        resolve(data)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      removeToken() // must remove  token  first
      removeToken('user_id')
      if(getToken('agent_id') == 1) removeToken('agent_id')
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
      getMyDevice().then(res => {
        let myDeviceName = {}, myDeviceId = {}, myDevice = []
        for(var i in res){
          let d = res[i]
          myDeviceName[d.name] = d.id
          myDeviceId[d.id] = d.name
          myDevice.push(d)
        }
        commit('SET_AGENT_DEVICE', JSON.parse(JSON.stringify({
          myDeviceName: myDeviceName,
          myDeviceId: myDeviceId,
          myDevice: myDevice
        })))
        resolve(res)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 提交操作记录
  postSetRecode({}, tag_id) {
    postSetRecode({tag_id: tag_id})
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
