import { $post, $get } from '@/utils/request'

export function getRegions(data) {
  return $get('iot-saas-basic/admin/regions', data)
}

export function getServiceType() {
  return $get('iot-saas-basic/admin/service/market/serviceType')
}

export function getPayChannel(data) {
  return $get('iot-saas-pay/admin/pay/channel/all', data)
}