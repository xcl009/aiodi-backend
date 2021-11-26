import { $post, $get } from '@/utils/request'

export function login(data) {
  return $post('/open/login', data)
}

export function codeLogin(data) {
  return $post('/commonapi/register/check_captche', data)
}

export function getInfo(token) {
  return $get('/agentapi/my_user_info', {
    token: token
  })
}

export function getPlatformConfig(params = {}) {
  return $get('/commonapi/get_platform_config', params)
}

export function getDeviceType() {
  return $get('/agentapi/ucenter/my_device_type')
}

export function postSetRecode(data) {
  return $post('/agentapi/log/add_record', data)
}
