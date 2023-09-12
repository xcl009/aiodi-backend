<template>
  <div>
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <div v-if="sidebar.opened" class="pt-15 mb-10 text-center text-white cursor">
        <el-avatar :size="40" :src="agentInfo.avatar" mode="cover"></el-avatar>
        <!-- <div class="mt-5 pl-10 pr-10 fs-c1 text-cut">{{ agentInfo.nickname }}</div> -->
        <div class="mt-10 fs-s4" v-if="isBrand()" @click="$router.push({path: `/money`})">
          快活币: <span class="text-white">{{ money.happyCurrencyNum || 0 }}</span>
          <el-tooltip class="item" effect="dark" content="快活币低于下月续费金额,请及时充值" placement="right" v-if="money.happyCurrencyNum < vipPrice[dform.mthPrice]">
            <i class="el-icon-warning-outline text-danger"></i>
          </el-tooltip>
        </div>
        <div class="mt-5 fs-s4" v-if="isBrand()" @click="setRows(1, {}, 1)">
          <template v-if="vipInfo.expiresDatetime"><span :class="vipInfo.status > 0 ? 'text-danger' : ''">{{ vipInfo.expiresStr ? vipInfo.expiresStr : `到期时间:${ parseTime(vipInfo.expiresDatetime, '{y}-{m}-{d}')}` }}</span></template>
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

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" :modal-append-to-body="false" :close-on-click-modal="false" :close-on-press-escape="false" :class="dialogType == 1 ? 'vip-content' : ''" width="680px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 1 && vipService.priceSettings">
        <div class="vip-header flex align-center p-30 text-white">
          <el-avatar :size="50" :src="agentInfo.avatar"></el-avatar>
          <div class="flex1 pl-15">
            <div class="mb-5 fs-c1">开通账号：{{ agentInfo.nickname }}</div>
            <div class="pl-10 pr-10 label-box fs-s2">
              <span class="label" v-if="vipInfo.expiresDatetime">{{ vipInfo.expiresStr ? vipInfo.expiresStr : `到期时间：${ parseTime(vipInfo.expiresDatetime, '{y}-{m}-{d}')}` }}</span>
              <span class="label" v-else>未开通</span>
            </div>
          </div>
          <div class="mt-10 fs-b3 text-bold">开通VIP</div>
          <div class="mt-10 ml-10 fs-b3">众多功能免费用</div>
          <i class="mb-20 ml-15 el-icon-close fs-b5 cursor" @click="dialogStatus = false" v-if="vipInfo.status != 2 || token1"></i>
        </div>

        <div class="flex align-end tab-box fs-b2 text-white">
          <template v-for="item in vipPriceArr">
            <div class="flexv align-center justify-center tab cursor" :class="{'act align-center': dform.cycle == item.cycle}" @click="dform.mkey = item.mkey;dform.cycle = item.cycle">
              <div :class="{'text-black': dform.cycle == item.cycle}">{{ item.name }}</div>
              <div class="line" v-if="dform.cycle == item.cycle"></div>
            </div>
          </template>
        </div>
        <div class="pl-30 pr-30 rel o-v bg-white" style="border-radius: 0 0 16px 16px;">
          <div class="mt-15 fs-c1 text-black text-bold">付费明细</div>
          <div>
            <template v-for="item in myDevice">
              <div class="flex mt-10" v-if="!item.fatherCode">
                <div class="flex1 text-grey">{{ item.name }}品类VIP</div>
                <div class="text-danger">￥{{ item[dform.mkey] }}/{{ dform.cycle == 'PERMANENT' ? '永久' : dform.cycle == 'quarterPrice' ? '季' : '月' }}</div>
              </div>
            </template>
            <div class="mt-10 l-b-dashed" v-if="vipCoupon[dform.mkey] > 0"></div>
            <div class="flex mt-10" v-if="vipCoupon[dform.mkey] > 0">
              <div class="flex1 text-grey">抵扣券</div>
              <div class="text-black">-￥{{ vipCoupon[dform.mkey] }}</div>
            </div>
          </div>
          <div class="flex mt-15 pt-25 l-t">
            <div class="flex1 flex align-center">
              <i class="el-icon-warning fs-c1"></i>
              <div class="ml-5 text-black">快活币{{ money.happyCurrencyNum < accSub(vipPrice[dform.mkey], (vipCoupon[dform.mkey] || 0)) ? '余额不足，请先充值' : '' }}</div>
              <div class="ml-5 text-gray fs-s2">
                余额：<span class="text-black">{{ money.happyCurrencyNum || 0 }}</span>快活币
              </div>
            </div>
            <div>
              <span class="text-grey">金额合计</span>
              <span class="text-danger">￥<span class="fs-b3">{{ accSub(vipPrice[dform.mkey], (vipCoupon[dform.mkey] || 0)) > 0 ? accSub(vipPrice[dform.mkey], (vipCoupon[dform.mkey] || 0)) : 0 }}</span></span>
            </div>
          </div>
          <div class="pb-30 mt-50 text-center">
            <el-button type="primary" :disabled="clickSubmit" @click="$refs.rechargeCoin.show(accSub(vipPrice[dform.mkey], (vipCoupon[dform.mkey] || 0)))" v-if="money.happyCurrencyNum < accSub(vipPrice[dform.mkey], (vipCoupon[dform.mkey] || 0))">去充值</el-button>
            <el-button type="primary" :disabled="clickSubmit" @click="dialogConfirm()" v-else>立即支付</el-button>
          </div>
          <div class="abs dialog-br"></div>
        </div>
      </template>
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
import { arrayToObj, formatSeconds, currentTime, unixTime, accSub, accMul } from '@/utils/index'
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
    myDevice() {
      return this.$store.state.user.myDevice
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
      accSub: accSub,
      clickSubmit: false,
      money: {},
      token1: getToken('token1') || '',

      // vip服务信息
      vipService: {},
      vipPriceArr: [
        {
          name: '月度VIP',
          info: '按月续费，使用无忧',
          mkey: 'mthPrice',
          cycle: 'MONTH'
        },
        {
          name: '季度VIP',
          mkey: 'quarterPrice',
          cycle: 'QUARTER'
        },
        {
          name: '永久VIP',
          info: '一次买断，终身使用',
          mkey: 'overPrice',
          cycle: 'PERMANENT'
        }
      ],
      vipPrice: {},

      //品牌vip信息
      vipInfo: {},
      vipCoupon: {},

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
            info.status = 2
            this.getVipService(2)
          } else {
            let expiresStr = formatSeconds(unixTime(info.expiresDatetime) - currentTime(), 'd')
            if(!expiresStr || parseInt(expiresStr.substring(0, expiresStr.length - 1)) <= 5){
              info.status = 1
              expiresStr = expiresStr ? expiresStr + '后到期' : '今日到期'
              this.getVipService(2)
              info.expiresStr = expiresStr
            }else{
              this.getVipService()
            }
          }
          this.vipInfo = info
          this.$store.dispatch('rests/changeSetting', {
            key: 'expiresDatetime',
            value: info.expiresDatetime
          })
          this.$get('iot-saas-basic/admin/settings/find', {
            code: 'VIP_COUPON'
          }).then(res => {
            if(res && res.setting){
              let coupon = JSON.parse(res.setting)
              coupon.mthPrice = coupon.amount
              coupon.quarterPrice = accMul(coupon.amount, 3)
              coupon.yearPrice = accMul(coupon.amount, 12)
              this.vipCoupon = coupon
            }
          })
        } else {
          this.dialogTitle[1] = 'VIP开通'
          this.vipInfo = {
            status: 2
          }
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
    /deep/ .el-dialog{
      border-radius: 16px;
      background: linear-gradient(225deg, #0F3A7C 0%, #01183A 100%);
      .el-dialog__header{
        display: none;
      }
      .el-dialog__body{
        padding: 0;
      }
    }
    .vip-header{
      background: url('../../../assets/vip_headbg.png'), -63px -72.85px / 115.108% 205.37% no-repeat;
      border-radius: 16px;
      .label-box{
        display: inline-block;
        padding-top: 2px;
        padding-bottom: 2px;
        background-color: rgba(255, 255, 255, 0.10);
        transform: skewX(-15deg);
        border-radius: 4px;
        .label{
          display: inline-block;
          transform: skewX(15deg);
        }
      }
    }
    .tab-box{
      height: 50px;
      background: linear-gradient(225deg, #6A85B6 0%, #BAC8E0 100%);
      .tab{
        width: 220px;
        height: 50px;
        z-index: 3;
        .line{
          margin-top: 2px;
          width: 69px;
          height: 4px;
          background: #165DFF;
        }
        &.act{
          position: relative;
          margin-top: -10px;
          height: 60px;
          flex: 1;
          &::after{
            content: "";
            position: absolute;
            left: 0;
            top: 1px;
            width: 275px;
            height: 60px;
            background: url('../../../assets/vip_yesbg.svg');
            z-index: -1;
          }
        }
        &:nth-child(2){
          &.act{
            &::after{
              width: 335px;
              left: -48px;
              background: url('../../../assets/vip_yesbgc.svg');
            }
          }
        }
        &:nth-child(3){
          &.act{
            &::after{
              left: inherit;
              right: 0;
              transform: rotateY(180deg);
            }
          }
        }
      }
    }
    .el-icon-warning{
      color: var(--orange);
    }
  }
</style>
