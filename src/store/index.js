import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import app from './modules/app'
import settings from './modules/settings'
import user from './modules/user'
import api from './modules/api'
import permission from './modules/permission'
import rests from './modules/rests'
import tagsView from './modules/tagsView'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    settings,
    user,
    permission,
    rests,
    tagsView,
    api
  },
  getters
})

export default store
