import { $post, $get } from '@/utils/request'

export function login(data) {
  return $post('iot-saas-user/open/admin/login', data)
}

export function codeLogin(data) {
  return $post('commonapi/register/check_captche', data)
}

export function getInfo(token) {
  return $get('iot-saas-user/getLoginUser')
}
export function getPlatformConfig(params = {}) {
  return $get('commonapi/get_platform_config', params)
}

export function getMyDevice() {
  return $get('iot-saas-device/admin/device/type/loadAll')
}

export function getConstant() {
  return $get('iot-saas-order/api/order/getInitMap')
}

export function postSetRecode(data) {
  return $post('agentapi/log/add_record', data)
}
