import Vue from 'vue'
import { login, codeLogin, logout, getInfo, getPlatformConfig, getDeviceType, postSetRecode } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: '',
    deviceNameObj: {},
    deviceKeyObj: {},
    agentDevice: [],
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
  SET_LEVEL: (state, level) => {
    state.level = level
  },
  SET_AGENT_DEVICE: (state, res) => {
    state.deviceNameObj = res.deviceNameObj
    state.deviceKeyObj = res.deviceKeyObj
    state.agentDevice = res.agentDevice
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
      login({ username: username.trim(), password: password }).then(data => {
        commit('SET_TOKEN', data.token)
        setToken(data.token)
        setToken(data.user_id, 'user_id')
        if(data.is_qrcode == 1) {
          data.belong_partner_aid = 96
        }
        setToken(data.belong_partner_aid || data.user_id, 'agent_id')
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
      getInfo(state.token).then(data => {
        if (data.code > 0) {
          reject('验证失败，请重新登录。')
        }
        let role = ['terminal','partner','agent','director','salesman','merchants']
        data.level_key = role[data['agent_level']]
        data.virtual_divide = 0
        if(data.agent_level == 5){
          let percent = {
            "0": "bao",
            "4": "wash",
            "1": "thread",
            "2": "massage",
            "3": "zhuang",
            "6": "blower",
            "7": "condom",
            "8": "humidifier",
          }
          for (var i in percent){
            if (data[percent[i] + '_virtual_divide'] == 1){
              data.virtual_divide = 1
              break
            }
          }
        }
        window.agentInfo = data

        const { user_name, avatar, agent_level } = data

        if(data.agent_level == 0 ){
          var icon_link = document.createElement('link')
              icon_link.type = 'image/x-icon'
              icon_link.rel = 'shortcut icon'
              icon_link.href = data.avatar
          document.getElementsByTagName('head')[0].appendChild(icon_link)
          document.title = `管理后台-共享充电宝,共享按摩枕,共享洗衣机,充电线,充电器-贴牌代理加盟的共享SaaS平台。`;
        }

        commit('SET_NAME', user_name)
        commit('SET_AVATAR', avatar)
        commit('SET_AGENTINFO', data)
        resolve(data)
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
        if(getToken('user_id') == 97) {
          commit('SET_AGENTINFO', {})
          commit('SET_AGENT_DEVICE', {
            deviceNameObj: {},
            deviceKeyObj: {},
            agentDevice: {}
          })
        }
        if(data.mini_name){
          var icon_link = document.createElement('link')
              icon_link.type = 'image/x-icon'
              icon_link.rel = 'shortcut icon'
              icon_link.href = data.mini_logo || data.mini_logo
          document.getElementsByTagName('head')[0].appendChild(icon_link)
          document.title = `管理后台-${data.mini_name},共享充电宝,共享按摩枕,共享洗衣机,充电线,充电器-贴牌代理加盟的共享SaaS平台。`;
        }
        data.time_unit = data.fund_fee_time_unit == 0 ? '分钟' : '小时'
        Vue.prototype.SITE_INFO = data
        window.siteInfo = data
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
  getDeviceType({ commit, state }) {
    return new Promise((resolve, reject) => {
      getDeviceType().then(res => {
        let deviceNameObj = {}, deviceKeyObj = {}, agentDevice = []
        for(var i in res){
          let d = res[i]
          if(d.taked > 0){
            deviceNameObj[d.depend_name] = d.depend_type
            agentDevice.push(d)
          }
          deviceKeyObj[d.depend_type] = d.depend_name
        }
        window.deviceNameObj = deviceNameObj
        commit('SET_AGENT_DEVICE', JSON.parse(JSON.stringify({
          deviceNameObj: deviceNameObj,
          deviceKeyObj: deviceKeyObj,
          agentDevice: agentDevice
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
