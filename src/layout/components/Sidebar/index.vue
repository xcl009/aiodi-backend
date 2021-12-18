<template>
  <div>
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <div v-if="sidebar.opened && showLogo" class="pt-15 pl-10 pr-5" @click="renewal">
        <div class="flex align-center" v-if="showLogo">
          <el-avatar :size="40" :src="agentInfo.avatar">
            <img src="" width="40" height="50">
          </el-avatar>
          <div class="text-cut flex1 pl-5">
            <div class="text-cut fs-c">{{ agentInfo.name }}</div>
            <span class="fs-s1 text-gray">{{ agentInfo.agent_name }}</span>
          </div>
        </div>
        <div v-if="contractInfo.date_type > 0" class="mt-5 fs-s1 cursor text-center">
          <el-tag type="danger" size="mini" class="radius-15">{{ parseTime(contractInfo.end_date, '{y}-{m}-{d}') }}到期</el-tag>
        </div>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="false"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item v-for="route in permission_routes" :key="route.path" :item="route" :base-path="route.path" />
      </el-menu>
    </el-scrollbar>
    <div class="abs hamburger-container text-center cursor" @click="toggleSideBar">
      <svg-icon slot="prefix" :icon-class="sidebar.opened ? 'fold' : 'unfold'" />
    </div>
    <!-- <hamburger :is-active="sidebar.opened" class="abs hamburger-container"  /> -->
  </div>
</template>

<script>
import {
  mapGetters
} from 'vuex'
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import Hamburger from '@/components/Hamburger'
import variables from '@/styles/variables.scss'
import QRCode from 'qrcodejs2'
import { getToken, setToken, removeToken } from '@/utils/auth'

export default {
  components: {
    SidebarItem,
    Hamburger,
    Logo
  },
  computed: {
    ...mapGetters([
      'permission_routes',
      'sidebar',
      'avatar'
    ]),
    agentInfo() {
      const agentInfo = this.$store.state.user.agentInfo
      return agentInfo
    },
    activeMenu() {
      const route = this.$route
      const {
        meta,
        path
      } = route
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo
    },
    variables() {
      return variables
    },
    isCollapse() {
      return !this.sidebar.opened
    }
  },
  data() {
    return {
      contractInfo: {},
      renewalInfo: {},
      renewalDialog: false,
      contract_type: 0,
      moneyArr: [],
      token1: getToken('token1') || ''
    }
  },
  mounted() {

  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    }
  }
}
</script>

<style lang="scss" scoped>
   /deep/ .el-tag--primary{
    background: none;
    border-color: #67c23a;
    border-radius: 10px;
   }
  /deep/ .el-tag--info{
    border-radius: 10px;
  }
  .scrollbar-wrapper{
    color: #4E5969;
  }
  .el-scrollbar{
    position: relative;
  }
  .hamburger-container {
    right: 10px;
    bottom: 60px;
    width: 35px;
    height: 35px;
    svg{
      margin-right: 0 !important;
      width: 20px;
      height: 20px;
    }
  }
  .hideSidebar{
    .hamburger-container {
      right: 0;
      width: 100%;
    }
  }
</style>
