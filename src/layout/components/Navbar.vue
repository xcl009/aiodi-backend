<template>
  <div class="navbar" style="overflow: initial;">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb class="breadcrumb-container" />

    <div class="right-menu flex align-center">
      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="avatar-wrapper">
          <img :src="avatar+'?imageView2/1/w/80/h/80'" class="user-avatar">
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <router-link to="/user/config">
            <el-dropdown-item>我的设置</el-dropdown-item>
          </router-link>
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
      'avatar'
    ]),
    agentInfo(){
      let agentInfo = this.$store.state.user.agentInfo
      return agentInfo
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

    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
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
  height: 40px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  z-index: 2;
  .hamburger-container {
    line-height: 36px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 36px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 10px;

      .avatar-wrapper {
        height: 40px;
        padding: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 30px;
          height: 30px;
          border-radius: 5px;
          border: thin solid #ccc;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          top: 22px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
