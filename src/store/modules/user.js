import Vue from 'vue'
import { login, codeLogin, logout, getInfo, getPlatformConfig, getMyDevice, getConstant, postSetRecode } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: '',
    siteInfo: {},
    agentInfo: {},
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
  },
  SET_SITEINFO: (state, res) => {
    state.siteInfo = res
  },
  SET_AGENTINFO: (state, res) => {
    state.agentInfo = res
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
      login({ username: username.trim(), password: password.trim(), loginType: 'UP', 'appid': 'pc' }).then(data => {
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
        setToken(data.user_id, 'user_id')
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
        window.agentInfo = data
        commit('SET_NAME', data.nickname || data.username)
        commit('SET_AVATAR', data.avastar || '')
        commit('SET_AGENTINFO', {
          avatar: data.avastar || '',
          name: data.nickname
        })
        resolve({
          roles: [data.userType]
        })
      }).catch(error => {
        reject(error)
      })
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

  // 获取常数
  getConstant({ commit, state }) {
    return new Promise((resolve, reject) => {
      getConstant().then(res => {
        console.log(res)
        commit('SET_CONSTANT', res)
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
