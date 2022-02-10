<template>
  <div class="flex align-center navbar" style="overflow: initial;">
    <!-- <img src="https://oss.kuaihuoya.net/pwd/2021-01-13/170336089.jpg" height="50" alt="" class="ml-10" :class="{'ml-30': device != 'mobile'}" @click="toggleSideBar"> -->
    <div class="flex1"></div>

    <!-- <breadcrumb class="breadcrumb-container" /> -->

    <div class="right-menu flex align-center">
      <!-- <div class="pl-15 pr-15 menu-item flex align-center">
        <svg-icon icon-class="head_new" class="head_new"></svg-icon>
      </div> -->
      <el-dropdown class="mr-10 hover-effect" trigger="click">
        <div class="pl-15 pr-15 menu-item flex align-center">
          <svg-icon icon-class="head_user" class="head_user"></svg-icon>
        </div>
        <el-dropdown-menu slot="dropdown">
          <router-link to="/user/index">
            <el-dropdown-item>个人信息</el-dropdown-item>
          </router-link>
          <router-link to="/user/lpw">
            <el-dropdown-item>登录密码</el-dropdown-item>
          </router-link>
          <el-dropdown-item divided @click.native="toAdmin()" v-if="token1">
            <span>返回总后台</span>
          </el-dropdown-item>
          <el-dropdown-item divided @click.native="logout" v-else>
            <span>退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import { delComma } from '@/utils/index'
import { getToken, setToken, removeToken } from '@/utils/auth'

export default {
  components: {
    Breadcrumb,
    Hamburger
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'name'
    ]),
    agentInfo(){
      let agentInfo = this.$store.state.user.agentInfo
      return agentInfo
    },
    device(){
      return this.$store.state.app.device
    },
    siteInfo(){
      return siteInfo
    }
  },
  data() {
    return {
      updateWxxcx: false,
      updateAlixcx: false,
      token1: getToken('token1') || ''
    }
  },
  mounted(){

  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },

    /**
     * 获取列表
     */
    getConfigs() {
      this.$get('WxOpen/getConfigs', {
        tag: 'wm01'
      }).then(res => {
        this.getWxxcx(res['wm010001'])
        this.getAlixcx(res['wm010006'])
      })
    },

    /**
     * 获取微信小程序列表
     */
    getWxxcx(template_id) {
      this.$get('WxOpen/getWxList', {
        page: 1,
		limit: 10,
        wx_status: 1
      }).then(res => {
        let list = res.list
        for(var i = 0; i < list.length; i++){
          if(list[i].mini_info.latest_code != template_id || list[i].mini_info.option_status != 6){
            this.updateWxxcx = true
            break
          }
        }
      })
    },

    /**
     * 获取支付宝小程序列表
     */
    getAlixcx(template_version) {
      this.$get('AlipayMini/getConfigList', {
        page: 1
      }).then(res => {
        let list = res.list
        for(var i = 0; i < list.length; i++){
          if((list[i].app_name.indexOf('模版') == -1) && (list[i].templateInfo.template_version != template_version || list[i].templateInfo.status != 'RELEASE')){
            this.updateAlixcx = true
            break
          }
        }
      })
    },

    async logout() {
      let url = ''
      url = `/login`
      await this.$store.dispatch('user/logout')
      location.href = url
    },

    /**
     * 返回总后台
     */
    toAdmin(){
      setToken(this.token1)
      setToken(this.config.admin_id, 'user_id')
      setToken(this.config.admin_id, 'agent_id')
      removeToken('token1')
      setTimeout(()=>{
        location.href = '/home'
      }, 100)
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 60px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 1px #E5E6EB;
  z-index: 2;
  .right-menu {
    float: right;
    height: 100%;
    line-height: 36px;
    &:focus {
      outline: none;
    }
    .menu-item{
      height: 60px;
      position: relative;
      cursor: pointer;
      .el-icon-caret-bottom {
        cursor: pointer;
        position: absolute;
        top: 22px;
        font-size: 12px;
      }
      svg.head_new {
        width: 17px;
        height: 17px;
      }
      svg.head_user {
        width: 20px;
        height: 20px;
      }
    }
  }
}
.el-dropdown-menu{
  top: 35px !important;
}
</style>
