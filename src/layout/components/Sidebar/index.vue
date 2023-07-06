<template>
  <div>
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <div v-if="sidebar.opened" class="pt-15 mb-10 text-center text-white cursor"><!-- @click="toRenewal" -->
        <el-avatar :size="40" :src="agentInfo.avatar"></el-avatar>
        <!-- <div class="mt-5 pl-10 pr-10 fs-c1 text-cut">{{ agentInfo.nickname }}</div> -->
        <div class="mt-10 fs-s4" v-if="isBrand()" @click="$router.push({path: `/money`})">快活币: <span class="text-white">{{ money.happyCurrencyNum || 0 }}</span></div>
        <div class="mt-5 fs-s4" v-if="isBrand()" @click="setRows(1, {}, 1)">
          <template v-if="vipInfo.expiresDatetime"><span class="text-danger">{{ vipInfo.expiresStr ? vipInfo.expiresStr : `到期时间:${ parseTime(vipInfo.expiresDatetime, '{y}-{m}-{d}')}` }}</span></template>
          <template v-else><span class="text-danger">暂未开通VIP，请开通</span></template>
        </div>
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
    <div class="abs hamburger-container text-center cursor" @click="toggleSideBar">
      <svg-icon slot="prefix" :icon-class="sidebar.opened ? 'fold' : 'unfold'" />
    </div>
    <!-- <hamburger :is-active="sidebar.opened" class="abs hamburger-container"  /> -->

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" :modal-append-to-body="false" :close-on-click-modal="false" width="600px">
      <!-- <div>
        <div class="flex align-center">
          <el-avatar :size="50" :src="agentInfo.avatar"></el-avatar>
          <div>
            <div>开通账号：{{ agentInfo.nickname }}</div>
            <div>
              <template v-if="vipInfo.expiresDatetime"><span>{{ vipInfo.expiresStr ? vipInfo.expiresStr : `到期时间:${ parseTime(vipInfo.expiresDatetime, '{y}-{m}-{d}')}` }}</span></template>
              <template v-else><span>未开通</span></template>
            </div>
          </div>
          <div>众多功能免费用</div>
          <div>开通VIP</div>
        </div>
      </div> -->
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 1 && vipService.priceSettings">
        <div class="vip-content fs-c1 text-black">
          <div class="mb-10"><span class="text-danger" v-if="vipInfo.expiresDatetime">VIP到期时间：{{ vipInfo.expiresDatetime }}</span><span v-else>您暂未开通VIP</span>，VIP可免费选用服务市场众多默认功能</div>
          <div class="flex align-center justify-center vip-money fs-a1 text-center">
            <div class="pt-30 pb-30 item cursor" :class="{'act': dform.cycle == item.cycle}" v-for="item in vipPriceArr" @click="dform.mkey = item.mkey;dform.cycle = item.cycle">
              <div>{{ item.name }}</div>
              <div class="mt-5 text-danger">￥<span class="money">{{ vipPrice[item.mkey] }}</span></div>
            </div>
          </div>
          <div class="flex align-center justify-center mt-20">
            <span>快活币余额：</span>
            <svg-icon icon-class="KHB"></svg-icon>
            <span class="fs-b1">{{ money.happyCurrencyNum || 0 }}</span>
            <span class="ml-20 text-primary cursor" @click="$refs.rechargeCoin.show()">立即充值</span>
          </div>
          <div class="pb-20 mt-30 text-center">
            <el-button class="bg-body" @click="dialogStatus = false" v-if="vipInfo.status == 1">取消</el-button>
            <el-button type="danger" :disabled="clickSubmit" @click="$refs.rechargeCoin.show()" v-if="money.happyCurrencyNum < vipPrice[dform.mkey]">快活币不足，马上充值</el-button>
            <el-button type="danger" :disabled="clickSubmit" @click="dialogConfirm()" v-else>立即支付￥{{ vipPrice[dform.mkey] }}</el-button>
          </div>
        </div>
      </template>
      <div class="pb-20 mt-30 text-center" v-if="dialogType != 1">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">取消</el-button>
        <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">{{ dialogType == 1 ? '立即支付￥498' : '确定' }}</el-button>
      </div>
    </el-dialog>

    <recharge-khy-coin ref="rechargeCoin"></recharge-khy-coin>
  </div>
</template>

<script>
import {
  mapGetters
} from 'vuex'
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import Hamburger from '@/components/Hamburger'
import RechargeKhyCoin from '@/components/RechargeKhyCoin/'
import variables from '@/styles/variables.scss'
import QRCode from 'qrcodejs2'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { arrayToObj, formatSeconds, currentTime, unixTime } from '@/utils/index'
export default {
  components: {
    SidebarItem,
    Hamburger,
    Logo,
    RechargeKhyCoin
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
      clickSubmit: false,
      money: {},
      token1: getToken('token1') || '',

      // vip服务信息
      vipService: {},
      vipPriceArr: [
        {
          name: '月度VIP',
          mkey: 'mthPrice',
          cycle: 'MONTH'
        },
        // {
        //   name: '年度VIP',
        //   mkey: 'yearPrice',
        //   cycle: 'YEAY'
        // },
        // {
        //   name: '永久VIP',
        //   mkey: 'overPrice',
        //   cycle: 'PERMANENT'
        // }
      ],
      vipPrice: {},

      //品牌vip信息
      vipInfo: {},

      // 弹出相关
      dialogType: 1,
      dialogStatus: false,
      dialogTitle: {
        1: 'VIP续费'
      },
      curRow: {},
      curIdx: 0,
      dform: {
        cycle: 'MONTH',
        mkey: 'mthPrice',
        priceCode: ''
      }
    }
  },
  mounted() {
    if(this.isBrand()){
      this.getBalance()
      this.$root.$on('getBalance', ()=> {
        this.getBalance()
      })
      this.getVipPrice()
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
      this.$get('iot-saas-basic/client/service/market/record/findPage?page=0&size=10&priceCode=BRAND_MEMBER').then(res => {
        if(res && res.rows && res.rows.length > 0){
          let info = res.rows[0]
          if(info.orderStatusName == '已到期'){
            info.expiresStr = '已过期' + formatSeconds(currentTime() - unixTime(info.expiresDatetime), 'd')
            this.getVipService(2)
          } else {
            let expiresStr = formatSeconds(unixTime(info.expiresDatetime) - currentTime(), 'd')
            if(!expiresStr || parseInt(expiresStr.substring(0, expiresStr.length - 1)) <= 5){
              expiresStr = expiresStr ? expiresStr + '后到期' : '今日到期'
              this.getVipService(2)
              info.expiresStr = expiresStr
            }else{
              info.status = 1
              this.getVipService()
            }
          }
          this.vipInfo = info
          this.$store.dispatch('rests/changeSetting', {
            key: 'expiresDatetime',
            value: info.expiresDatetime
          })
        } else {
          this.dialogTitle[1] = 'VIP开通'
          this.getVipService(2)
        }
      })
    },

    /**
     * 获取vip详情
     */
    getVipPrice(){
      this.$get('iot-saas-basic/client/service/market/vip/price').then(res => {
        this.vipPrice = res
      })
    },

    /**
     * 获取VIP服务
     */
    getVipService(type = 1){
      this.$get(`iot-saas-basic/admin/service/market/${this.config.vip_service_id}`).then(res => {
        this.dform.priceCode = res.priceSettings[0].priceCode
        res.priceSettings = arrayToObj(res.priceSettings, 'priceCode')
        for(var i in this.cycle){
          if(res.priceSettings[this.dform.priceCode][this.cycle[i].key] > 0){
            this.dform.cycle = this.cycle[i].code
            break
          }
        }
        this.vipService = res
        if(type == 2) this.setRows(1, {}, 1)
      })
    },


    /**
     * 操作数据
     * @param {Object} type 1 dialog类型
     * @param {Object} row 选择当前数据
     * @param {Object} dialogType dialog内容显示类型 1: '续费'
     * @param {Object} idx 当前数据所在位置
     */
    setRows(type, row, dialogType, idx) {
      switch (type) {
        case 1:
          this.dialogType = dialogType
          this.curRow = row
          this.curIdx = idx
          this.dialogStatus = true
          break
      }
    },

    /**
     * 弹窗确认
     */
    dialogConfirm() {
      let curRow = this.curRow,
        curIdx = this.curIdx,
        params = JSON.parse(JSON.stringify(this.dform))
      if(this.clickSubmit) return
      this.clickSubmit = true
      switch (this.dialogType) {
        case 1:
          params.payTypeCode = 'HAPPY_MONEY'
          params.serviceId = this.config.vip_service_id
          delete params.mkey
          this.$post('iot-saas-basic/client/service/market/buy', params).then(res => {
            this.$message({
              message: '支付成功',
              type: 'success'
            })
            setTimeout(() => {
              this.$store.dispatch('user/getInfo')
              this.getBalance()
              this.clickSubmit = false
              this.dialogStatus = false
            }, 1000)
          }).catch(err => {
            this.clickSubmit = false
          })
          break
      }
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
    right: 15px;
    bottom: 15px;
    width: 20px;
    height: 20px;
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

  .el-tag {
    border-radius: 2px;

    .svg-icon {
      vertical-align: -5px;
    }

    &.text-primary {
      color: #3CA1FE;
      border-color: #3CA1FE;
    }
  }

  .vip-content{
    .vip-money{
      .item{
        width: 160px;
        border: 1px solid #E5E6EB;
        border-radius: 8px;
        &.act{
          background: #FFF7E8;
          border-color: #FF7D00;
        }
      }
      .money{
        font-size: 32px;
      }
    }
    .svg-icon{
      margin-right: 8px !important;
    }
  }
</style>
