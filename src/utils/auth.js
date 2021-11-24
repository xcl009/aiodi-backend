import Cookies from 'js-cookie'

const TokenKey = 'token'

export function getToken(key = TokenKey) {
  return Cookies.get(key)
}

export function setToken(token, key = TokenKey) {
  return Cookies.set(key, token, { expires: 7 })
}

export function removeToken(key = TokenKey) {
  return Cookies.remove(key)
}
