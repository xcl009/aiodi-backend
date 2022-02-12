const getters = {
  permission_routes: state => state.permission.routes,
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  userType: state => state.user.userType,
  myDeviceName: state => state.user.myDeviceName,
  myDeviceId: state => state.user.myDeviceId,
  myDevice: state => state.user.myDevice,
  siteInfo: state => state.user.siteInfo,
  agentInfo: state => state.user.agentInfo,
  Constant: state => state.user.Constant,
  rests: state => state.rests
}
export default getters
