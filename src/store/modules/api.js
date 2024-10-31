import Vue from 'vue'
import { getRegions, getServiceType, getPayChannel } from '@/api/api'

const result = {}
const actions = {
  /**
   * 获取区域
   */
  getRegions({ commit, state }, params = {}){
    return new Promise((resolve, reject) => {
      if(Vue.prototype.regions){
        resolve(Vue.prototype.regions)
        return
      }
      getRegions(params).then(res => {
        Vue.prototype.regions = res
        resolve(res)
      }).catch(error => {
        reject(error)
      })
    })
  },

  /**
   * 获取区域
   */
  getServiceType(){
    return new Promise((resolve, reject) => {
      if(result.serviceType){
        resolve(result.serviceType)
        return
      }
      getServiceType().then(res => {
        result.serviceType = res
        resolve(res)
      }).catch(error => {
        reject(error)
      })
    })
  },

  /**
   * 获取所有支付通电
   */
  getPayChannel({ commit, state }) {
    return new Promise((resolve, reject) => {
      if(result.payChannel){
        resolve(result.payChannel)
        return
      }
      getPayChannel().then(res => {
        let payChannel = {}
        res.map(item => {
          payChannel[item.payType] = item
        })
        result.payChannel = payChannel
        resolve(payChannel)
      }).catch(error => {
        reject(error)
      })
    })
  }
}

export default {
  namespaced: true,
  actions
}
