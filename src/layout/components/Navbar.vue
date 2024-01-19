<template>
  <div class="rel flex navbar" style="overflow: initial;">
    <div class="abs pt-10 pb-10 pl-20 pr-20 cursor line-1" @click="toggleSideBar">
      <svg-icon slot="prefix" :icon-class="sidebar.opened ? 'fold' : 'unfold'" />
    </div>
    <div class="flex1 title-box text-center text-white">
      <div>
        <div class="cn">{{ agentInfo.nickname }}{{ $t('layout.admins') }}</div>
      </div>
    </div>
    <div class="abs right-menu flex align-center">
      <template v-if="device != 'mobile'">
        <!-- <div class="pl-30 pr-30 flex align-center text-primary cursor l-r" v-if="isBrand()" @click="getJoinCode">
        <svg-icon icon-class="head_link" class="mr-10 head_new"></svg-icon>
        邀请链接获取
      </div> -->
        <div class="pl-15 pr-15 menu-item flex align-center" @click="setRows(3, 2)" v-if="isBrand()">
          <el-badge is-dot :hidden="!updateDetails.isNews" class="news-dot">
            <i class="el-icon-bell fs-b2 text-white"></i>
          </el-badge>
          <span class="ml-10 text-white">{{ $t('system.updateDetails') }}</span>
        </div>
        <div class="pl-15 pr-15 menu-item flex align-center" @click="handleScreen">
          <i class="el-icon-full-screen fs-b2 text-white"></i>
          <span class="ml-10 text-white">{{ $t('layout.fullScreen') }}</span>
        </div>
      </template>
      <el-dropdown class="mr-10 hover-effect" trigger="click">
        <div class="pl-15 pr-15 menu-item flex align-center">
          <svg-icon icon-class="head_user" class="head_user text-white"></svg-icon>
          <span class="ml-10 text-white">{{ $t('layout.me') }}</span>
        </div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="setRows(3, 3)" v-if="isBrand()">
            <span>{{ $t('layout.personalSettings') }}</span>
          </el-dropdown-item>
          <router-link to="/user/index">
            <el-dropdown-item>{{ $t('layout.userinfo') }}</el-dropdown-item>
          </router-link>
          <el-dropdown-item>
            <div class="rel">
              <el-dropdown trigger="click" placement="top-start">
                <div>{{ $t('layout.langSelect') }}</div>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item  @click.native="waitOnLine('zh_CN')">
                    <span>中文版本(简体)</span>
                  </el-dropdown-item>
                  <el-dropdown-item @click.native="waitOnLine('zh_HK')">中文版本(繁體)</el-dropdown-item>
                  <el-dropdown-item @click.native="waitOnLine('en_US')">English</el-dropdown-item>
                  <el-dropdown-item @click.native="waitOnLine('ru_RU')">Tiếng Việt</el-dropdown-item>
                  <el-dropdown-item @click.native="waitOnLine('vi_VN')">Русский язык</el-dropdown-item>
                  <el-dropdown-item >{{ $t('layout.otherLang') }}</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </el-dropdown-item>
          <router-link to="/user/lpwd">
            <el-dropdown-item>{{ $t('public.loginPassword') }}</el-dropdown-item>
          </router-link>
          <router-link to="/user/opwd">
            <el-dropdown-item>{{ $t('public.operationPassword') }}</el-dropdown-item>
          </router-link>
          <el-dropdown-item divided @click.native="toAdmin()" v-if="token1">
            <span>{{ $t('layout.returnAdmin') }}</span>
          </el-dropdown-item>
          <el-dropdown-item divided @click.native="logout" v-else>
            <span>{{ $t('layout.logOff') }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <!-- <el-dialog :visible.sync="inviteDialog" width="500px" :modal-append-to-body="true" :append-to-body="true" :close-on-click-modal="false">
      <div class="fs-c1 text-black text-center" slot="title">邀请二维码</div>
      <div class="p-30 flex flex-wrap justify-around text-center">
        <div class="p-10 qrcode-box">
          <div id="inviteQrcode" />
        </div>
      </div>
      <div class="pb-30 pt-20 text-center">
        <el-button type="primary" @click="copyText()" class="mr-30">复制链接</el-button>
        <el-button type="primary" @click="saveQrcode()">下载二维码</el-button>
      </div>
    </el-dialog> -->

    <el-drawer :title="dialogTitle[dialogType]" :visible.sync="drawerStatus" :append-to-body="true">
      <template v-if="dialogType == 1">
        <div class="p-30 flex flex-wrap justify-around text-center">
          <div class="p-10 qrcode-box">
            <div id="inviteQrcode" />
          </div>
        </div>
        <div class="pb-30 pt-20 text-center">
          <el-button type="primary" @click="copyText()" class="mr-30">{{ $t('layout.copyLink') }}</el-button>
          <el-button type="primary" @click="saveQrcode()">{{ $t('layout.downloadCode') }}</el-button>
        </div>
      </template>
      <template v-if="dialogType == 2">
        <div class="pl-40 pr-40" v-html="updateDetails.updateDetails" style="width: 500px;"></div>
      </template>
      <template v-if="dialogType == 3">
        <el-form class="custom-form pl-20 pr-20" @submit.native.prevent="dialogConfirm()">
          <div class="mb-15 text-black">{{ $t('layout.storeId') }}</div>
          <el-form-item :label="$t('layout.storeId')">
            <el-input v-model="dform.storeId" :placeholder="$t('layout.storeId')"></el-input>
            <div class="mb-15 flex fs-c1" style="line-height: 1.8;">
              <div>{{ $t('public.tips') }}：</div>
              <div>{{ $t('layout.text') }}<br><span class="text-danger">{{ $t('layout.text1') }}</span></div>
            </div>
          </el-form-item>

          <div class="mb-15 text-black">{{ $t('layout.dataSimulation') }}</div>
          <el-form-item :label="$t('layout.doublingState')">
            <el-switch v-model="dform.active" :active-value="1" :inactive-value="0" />
          </el-form-item>
          <el-form-item :label="$t('layout.doublingMultiple')">
            <el-input v-model="dform.multiple" :placeholder="$t('layout.doublingMultiple')"></el-input>
            <div class="flex fs-c1" style="line-height: 1.8;">
              <div>{{ $t('public.tips') }}：</div>
              <div>{{ $t('layout.text2') }}</div>
            </div>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="[3].indexOf(dialogType) > -1">
        <div style="height: 66px;"></div>
        <div class="p-15 mt-30 abs bfixed bg-white text-right l-t">
          <el-button size="medium" class="bg-body" @click="drawerStatus = false">{{ $t('public.cancel') }}</el-button>
          <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">{{ $t('public.confirm')
          }}</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import screenfull from 'screenfull'
import QRCode from 'qrcodejs2'
import { copyText, unixTime } from '@/utils/index'
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
    agentInfo() {
      let agentInfo = this.$store.state.user.agentInfo
      return agentInfo
    },
    device() {
      return this.$store.state.app.device
    },
    siteInfo() {
      return siteInfo
    }
  },
  data() {
    return {
      clickSubmit: false,
      updateWxxcx: false,
      updateAlixcx: false,
      token1: getToken('token1') || '',

      inviteUrl: '',
      inviteDialog: false,

      screenfull: false,

      // 更新明细
      updateDetails: {},

      // 弹出相关
      dialogType: 1,
      dialogStatus: false,
      drawerStatus: false,
      dialogTitle: {
        1: this.$t('layout.invitationCode'),
        2: this.$t('layout.systemUpdateDetails'),
        3: this.$t('layout.defaultStore')
      },
      dform: {}
    }
  },
  mounted() {
    if (this.isBrand()) this.getConfigs()
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },

    /**
     * 获取配置
     */
    getConfigs() {
      this.$get('iot-saas-pay/open/pay/system/config', {
        key: 'systemUpdateDetails'
      }).then(res => {
        if (res && res.valueJson) {
          let valueJson = JSON.parse(res.valueJson), readUpTime = localStorage.getItem(`readUpTime${this.agentInfo.id}`)
          if (readUpTime != valueJson.updateTime && this.currentTime() - unixTime(valueJson.updateTime) < 30 * 86400) {
            valueJson.isNews = true
          }
          this.updateDetails = valueJson
        }
      })
    },

    /**
     * 操作商户
     * @param {Object} type 1 dialog类型 3 drawer类型
     * @param {Object} dialogType dialog内容显示类型 1: '结束订单' 2: '更新明细'
     */
    setRows(type, dialogType) {
      switch (type) {
        case 1:
          this.dialogType = dialogType
          this.dialogStatus = true
          break
        case 3:
          this.dialogType = dialogType
          this.drawerStatus = true
          if (dialogType == 2) {
            this.updateDetails.isNews = false
            localStorage.setItem(`readUpTime${this.agentInfo.id}`, this.updateDetails.updateTime)
            setToken(`readUpTime${this.agentInfo.id}`, this.updateDetails.updateTime)
          } else if (dialogType == 3) {
            this.$get('iot-saas-basic/admin/settings/find', {
              code: 'DEFAULT_STORE'
            }).then(res => {
              if (res && res.setting) {
                this.$set(this.dform, 'storeId', res.setting)
              }
            })
            this.$get('iot-saas-basic/admin/settings/find', {
              code: 'DATA_MULTIPLE'
            }).then(res => {
              if (res && res.setting) {
                let info = JSON.parse(res.setting)
                this.$set(this.dform, 'active', info.active)
                this.$set(this.dform, 'multiple', info.multiple)
              }
            })
          }
          break
      }
    },

    /**
     * 弹窗确认
     */
    dialogConfirm() {
      let that = this;
      let curRow = this.curRow,
        curIdx = this.curIdx,
        params = JSON.parse(JSON.stringify(this.dform))
      switch (this.dialogType) {
        case 3:
          this.$post('iot-saas-basic/admin/settings/saveStore', {
            storeId: params.storeId
          }).then(res => {

          })
          this.$post('iot-saas-basic/admin/settings/saveMultiple', {
            active: params.active || 0,
            multiple: params.multiple || 0
          }).then(res => {
            this.$message({
              message: that.$t('public.operationSuccessful'),
              type: 'success'
            })
            this.drawerStatus = false
          })
          break
      }
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
        for (var i = 0; i < list.length; i++) {
          if (list[i].mini_info.latest_code != template_id || list[i].mini_info.option_status != 6) {
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
        for (var i = 0; i < list.length; i++) {
          if ((list[i].app_name.indexOf('模版') == -1) && (list[i].templateInfo.template_version != template_version || list[i].templateInfo.status != 'RELEASE')) {
            this.updateAlixcx = true
            break
          }
        }
      })
    },

    async logout() {
      let url = ''
      url = `/login/${this.agentInfo.brandId}`
      await this.$store.dispatch('user/logout')
      location.href = url
    },

    /**
     * 返回总后台
     */
    toAdmin() {
      setToken(this.token1)
      removeToken('token1')
      setTimeout(() => {
        location.href = '/home'
      }, 100)
    },

    /**
     * 获取邀请链接地址
     */
    getJoinCode() {
      this.inviteDialog = true
      if (this.active_url) {
        return
      }
      this.$post('iot-saas-basic/admin/brand/buildInvitationCode', {
        brandId: this.agentInfo.brandId
      }).then(res => {
        this.invitationCode = res.invitationCode
        this.alertLink(res.invitationCode)
      })
    },

    /**
     * 设置二维码
     */
    alertLink(code) {
      let gid = this.agentInfo.brandId
      let url = `${location.origin}/brandReg/${gid}/${code}`
      this.inviteUrl = url
      document.getElementById('inviteQrcode').innerHTML = ''
      new QRCode('inviteQrcode', {
        width: 150,
        height: 150,
        text: url
      })
    },

    /**
     * 复制链接
     */
    copyText() {
      copyText(this.inviteUrl)
      this.$message({
        message: this.$t('public.copySuccess'),
        type: 'success'
      })
    },

    handleScreen() {
      if (!screenfull.isEnabled) {
        return false
      }
      screenfull.toggle()
    },

    waitOnLine(e) {
      localStorage.setItem('lang',e)
      this.$i18n.locale = e
      location.reload()
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 40px;
  overflow: hidden;
  position: relative;
  background-color: #01183A;
  z-index: 2;

  .title-box {
    height: 65px;
    background-image: url('../../assets/head_bg.svg');
    background-size: auto 100%;
    background-position: center;

    .cn {
      margin-top: 12px;
      font-size: 25px;
    }
  }

  .right-menu {
    right: 0;
    top: 0;
    height: 100%;
    line-height: 36px;

    &:focus {
      outline: none;
    }

    .menu-item {
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

  /deep/ .news-dot {
    .is-dot {
      top: 8px;
    }
  }
}

.el-dropdown-menu {
  top: 35px !important;
}</style>
