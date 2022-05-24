import { $post, $get } from '@/utils/request'

export function getRegions() {
  return $get('iot-saas-basic/admin/regions')
}

export function getServiceType() {
  return $get('iot-saas-basic/admin/service/market/serviceType')
}