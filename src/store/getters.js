const getters = {
  permission_routes: state => state.permission.routes,
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  deviceNameObj: state => state.user.deviceNameObj,
  deviceKeyObj: state => state.user.deviceKeyObj,
  agentDevice: state => state.user.agentDevice,
  siteInfo: state => state.user.siteInfo,
  agentInfo: state => state.user.agentInfo,
  rests: state => state.rests
}
export default getters
