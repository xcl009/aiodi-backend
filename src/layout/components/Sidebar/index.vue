<template>
  <div :class="{'has-logo':showLogo}">
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <div v-if="sidebar.opened" class="pt-15 pl-10 pr-5" @click="renewal">
        <div class="flex align-center ">
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

    <el-dialog :title="`您好！账户${contractInfo.renewalStatus == 1 ? '已到期，请及时续费' : contractInfo.renewalStatus == 2 ? '即将到期，请及时续费' : '正常'}`" :visible.sync="renewalDialog" width="660px" :modal-append-to-body="false" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="contractInfo.renewalStatus != 1">
      <div class="renewal-box">
        <div class="flex flex-wrap justify-around">
          <div v-for="item in moneyArr" v-if="(item.contract_type == 2 && contractInfo.date_type == 2) || (item.contract_type != 2)" class="p-30 money-item radius-10 rel cursor" :class="{'act': item.contract_type == contract_type}" @click="contract_type = item.contract_type; renewal();">
            <span class="abs title fs-s2 text-white">{{ item.title }}</span>
            <div class="text-red f-w">￥<span class="fs-b5">{{ item.service_price }}</span></div>
            <div class="mb-5 b-line" />
            <div class="fs-s2 text-primary">{{ item.introduce }}</div>
            <div class="abs check">
              <span class="el-icon-check" />
            </div>
          </div>
        </div>
        <div class="l-t mt-40 pt-40 flex flex-wrap justify-around text-center">
          <div>
            <div class="p-10 qrcode-box">
              <div id="qrcode" />
            </div>
            <div class="mt-10 mb-10 text-wx">
              <i class="iconfont icon-weixinzhifu" />
              <span>微信支付</span>
            </div>
            <div class="fs-s2 text-red">
              <span>打开微信(扫一扫)</span>
            </div>
          </div>
          <div>
            <div class="p-10 qrcode-box ali">
              <div id="qrcode_ali" />
            </div>
            <div class="mt-10 mb-10 text-ali">
              <i class="iconfont icon-iconfontrectangle390" />
              <span>支付宝支付</span>
            </div>
            <div class="fs-s2 text-red">
              <span>打开支付宝(扫一扫)</span>
            </div>
          </div>
        </div>

        <div v-for="item in moneyArr" v-if="item.contract_type == contract_type" class="mt-40 fs-s2 text-gray text-center">提示：您选择{{ item.title }}，{{ contract_type == 0 ? '账户永久有效' : '账户到期时间：' + renewalInfo.expiry_date }}</div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  mapGetters
} from 'vuex'
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import variables from '@/styles/variables.scss'
import QRCode from 'qrcodejs2'
import { getToken, setToken, removeToken } from '@/utils/auth'

export default {
  components: {
    SidebarItem,
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
    /**
       * 获取合同
       */
    getContract(id) {
      this.$get('agentapi/pay/contract_order', {
        renew_agent_id: id
      }).then(res => {
        const attach_info = res.attach_info; const now = Date.parse(new Date()) / 1000
        this.moneyArr = res.service_save_data
        this.contract_type = attach_info.date_type
        attach_info.renewalStatus = now >= attach_info.end_date ? 1 : now >= attach_info.end_date - 518400 ? 2 : 0
        if(this.token1 && attach_info.renewalStatus > 0){
          attach_info.renewalStatus = 2
        }
        this.contractInfo = attach_info
        if (attach_info.renewalStatus > 0 && attach_info.end_date > 0 && attach_info.date_type != 0) this.renewal()
      })
    },

    /**
       * 续费
       */
    renewal() {
      this.$get('agentapi/pay/get_contract_qrcode', {
        contract_type: this.contract_type,
        renew_agent_id: this.agentInfo.id
      }).then(res => {
        this.renewalDialog = true
        this.renewalInfo = res
        setTimeout(() => {
          document.getElementById('qrcode').innerHTML = ''
          new QRCode('qrcode', {
            width: 150,
            height: 150,
            text: res.wx_qrcode_url
          })

          document.getElementById('qrcode_ali').innerHTML = ''
          new QRCode('qrcode_ali', {
            width: 150,
            height: 150,
            text: res.zfb_qrcode_url
          })
        }, 500)
      })
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

  .renewal-box{
    .money-item{
      border: 3px solid #eee;
      &.act{
        border-color: red;
        .check{
          opacity: 1;
        }
      }
      transition: all 1s;
    }
    .check{
      bottom: 0;
      right: 0;
      width: 0;
      height: 0;
      border-bottom: 30px solid red;
      border-left: 30px solid transparent;
      opacity: 0;
      transition: all 1s;
    }
    .el-icon-check{
      margin-left: -18px;
      margin-top: 13px;
      font-weight: bold;
      font-size: 16px;
      color: #fff;
    }
    .b-line{
      height: 1px;
      background-image: linear-gradient(to right, #ffffff, #da181c, #ffffff);
    }
    .title{
      left: -2px;
      top: -2px;
      padding: 3px 5px;
      border-radius: 10px 0 10px 0;
      background-image: linear-gradient(to right, #ff15e0, #da181c);
    }
    .text-red{
      color: red;
    }
    .text-wx{
      color: #4bb414;
    }
    .text-ali{
      color: #07aaf0;
    }

    .qrcode-box{
      width: 174px;
      height: 174px;
      border: 2px solid #4bb414;
      &.ali{
        border-color: #07aaf0;
      }
    }
  }

</style>
