import { $post, $get } from '@/utils/request'

export function login(data) {
  return $post('iot-saas-user/open/admin/login', data)
}

export function codeLogin(data) {
  return $post('commonapi/register/check_captche', data)
}

export function getInfo(token) {
  return $get('agentapi/my_user_info', {
    token: token
  })
}

export function getPlatformConfig(params = {}) {
  return $get('commonapi/get_platform_config', params)
}

export function getMyDevice() {
  return $get('iot-saas-device/device/type/loadAll')
}

export function postSetRecode(data) {
  return $post('agentapi/log/add_record', data)
}
