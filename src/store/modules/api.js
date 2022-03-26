import Vue from 'vue'
import { getRegions, getServiceType } from '@/api/api'

const result = {}
const actions = {
  /**
   * 获取区域
   */
  getRegions(){
    return new Promise((resolve, reject) => {
      if(Vue.prototype.regions){
        resolve(Vue.prototype.regions)
        return
      }
      getRegions().then(res => {
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
  }
}

export default {
  namespaced: true,
  actions
}
