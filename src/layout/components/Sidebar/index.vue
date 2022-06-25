<template>
  <div>
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <div v-if="sidebar.opened" class="pt-15 mb-10 text-center cursor"><!-- @click="toRenewal" -->
        <el-avatar :size="40" :src="agentInfo.avatar"></el-avatar>
        <div class="mt-5 pl-10 pr-10 fs-c1 text-cut">{{ agentInfo.nickname }}</div>
        <div class="mt-5 fs-s4" v-if="isBrand()" @click="$router.push({path: `/money/khyCoin`})">快活币: <span class="text-black">{{ money.happyCurrencyCount || 0 }}</span></div>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="true"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item v-for="route in permission_routes" :key="route.path" :item="route" :base-path="route.path" />
      </el-menu>
    </el-scrollbar>
    <!-- <div class="abs hamburger-container text-center cursor" @click="toggleSideBar">
      <svg-icon slot="prefix" :icon-class="sidebar.opened ? 'fold' : 'unfold'" />
    </div> -->
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
      money: {},
      token1: getToken('token1') || ''
    }
  },
  mounted() {
    if(this.isBrand()){
      this.getBalance()
    }
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    /**
     * 获取可提现金额
     */
    getBalance(){
      this.$get('iot-saas-pay/api/pay/withdraw/balance').then(res => {
        this.money = res || {}
      })
    },
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
