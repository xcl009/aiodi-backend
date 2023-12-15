<template>
  <div>
    <el-row class="pt-20 pb-10 pl-20 pr-20 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="16" :lg="12" :xl="8">
        <el-form ref="form" :model="form" label-position="left" label-width="120px">
          <el-form-item :label="$t('brand.withdrawableAmount')">
            <div class="text-primary fs-b1">{{ money.balance || 0.00 }}</div>
          </el-form-item>
          <el-form-item :label="$t('public.freezeAmount')">
            <div class="text-primary fs-b1">
              {{ money.frozenBalance || 0.00 }}
              <el-tooltip placement="bottom" effect="light">
                <div slot="content">
                  <div class="mb-20">
                    <span class="text-primary">{{ $t('moeny.whyFrozenAmount') }}</span><br><br>
                    {{ $t('moeny.whyFrozenAmountText') }}
                  </div>
                  <div class="mb-20">
                    <span class="text-primary">{{ $t('moeny.frozenAmountHowIs') }}</span><br><br>
                    {{ $t('moeny.frozenAmountHowIsText') }}
                  </div>
                  <div class="mb-20">
                    <span class="text-primary">{{ $t('moeny.frozenAmountHowToThaw') }}</span><br><br>
                    {{ $t('moeny.frozenAmountHowToThawText') }}
                  </div>
                  <div class="mb-20">
                    <span class="text-primary">{{ $t('moeny.frozenAmountFundSecurity') }}</span><br><br>
                    {{ $t('moeny.frozenAmountFundSecurityText') }}
                  </div>
                </div>
                <i class="el-icon-question text-danger"></i>
              </el-tooltip>
            </div>
          </el-form-item>
          <el-form-item :label="$t('public.withdrawalAmount')">
            <el-input type="number" v-model="form.amount" :placeholder="$t('moeny.pleaseAmount')" />
          </el-form-item>
          <el-form-item :label="$t('moeny.withdrawalMethod')">
            <el-radio-group v-model="form.withdrawType">
              <el-radio-button :label="item.val" v-for="(item, index) in withdrawType">{{ item.name }}</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="$t('moeny.toAccount')" v-show="form.withdrawType == 3">
            <div class="flex align-center" v-if="bindAlipayInfo.alipayOpenid">
              <el-avatar size="medium" :src="bindAlipayInfo.avatar"></el-avatar>
              <div class="ml-10">{{ bindAlipayInfo.nickname }}</div>
            </div>
            <div class="flex align-center" v-else>{{ $t('moeny.nozfb') }}</div>
          </el-form-item>
          <el-form-item :label="$t('moeny.toAccount')" v-show="form.withdrawType == 1">
            <div class="flex align-center" v-if="bindWechatInfo.wechatOpenid">
              <el-avatar size="medium" :src="bindWechatInfo.avatar"></el-avatar>
              <div class="ml-10">{{ bindWechatInfo.nickname }}</div>
            </div>
            <div class="flex align-center" v-else>{{ $t('moeny.nowx') }}</div>
          </el-form-item>
          <div v-show="form.withdrawType == 5">
            <el-form-item :label="$t('public.fullName')">
              <el-input v-model="bindCardInfo.cardName" :placeholder="$t('moeny.youName')" />
            </el-form-item>
            <el-form-item :label="$t('public.cardNo')">
              <el-input v-model="bindCardInfo.cardNo" :placeholder="$t('public.cardNo')" />
            </el-form-item>
            <el-form-item :label="$t('public.bankName')">
              <el-input v-model="bindCardInfo.bankName" :placeholder="$t('public.bankName')" />
            </el-form-item>
            <el-form-item :label="$t('public.branchName')">
              <el-input v-model="bindCardInfo.branchName" :placeholder="$t('public.branchName')" />
            </el-form-item>
          </div>
          <div v-show="form.withdrawType == 2">
            <el-form-item :label="$t('public.fullName')">
              <el-input v-model="wxQrcodeInfo.userName" :placeholder="$t('moeny.youName')" />
            </el-form-item>
            <el-form-item :label="$t('public.qrcode')">
              <upload v-model="wxQrcodeInfo.qrcode" :upObj="{ fileType: 'paymentCode' }"></upload>
            </el-form-item>
          </div>
          <div v-show="form.withdrawType == 4">
            <el-form-item :label="$t('public.fullName')">
              <el-input v-model="aliQrcodeInfo.userName" :placeholder="$t('moeny.youName')" />
            </el-form-item>
            <el-form-item :label="$t('public.qrcode')">
              <upload v-model="aliQrcodeInfo.qrcode" :upObj="{ fileType: 'paymentCode' }"></upload>
            </el-form-item>
          </div>
          <el-form-item :label="$t('moeny.withdrawableTime')" v-if="timeLimit.type">
            <div class="flex" v-if="timeLimit.type == 'DAY'">
              <div v-for="(item, idx) in timeLimit.timeLimit">{{ $t('public.everyDay') }}{{ item.startTime }}-{{
                item.endTime }}<span class="ml-10 mr-10" v-if="idx < timeLimit.timeLimit.length - 1">|</span></div>
            </div>
            <div class="flex" v-else>
              <div v-for="(item, idx) in timeLimit.days">
                <span v-if="timeLimit.type == 'MONTH'">{{ $t('public.monthly') }}{{ item }}{{ $t('public.no') }}<span class="ml-10 mr-10"
                    v-if="idx < timeLimit.days.length - 1">|</span></span>
                <span v-else>{{ $t('public.weekly') }}{{ week[item] }}<span class="ml-10 mr-10"
                    v-if="idx < timeLimit.days.length - 1">|</span></span>
              </div>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit" :disabled="clickSubmit || timeLimit.type">{{ $t('public.submit') }}</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import upload from '@/components/upload/'
import { unixTime, accSub } from '@/utils/index'
export default {
  components: {
    upload
  },
  data() {
    return {
      clickSubmit: false,
      form: {
        sourceType: 3,
        withdrawType: 1
      },
      withdrawType: [],
      timeLimit: {},
      money: {},
      bindWechatInfo: {},
      bindAlipayInfo: {},
      bindCardInfo: {},
      aliQrcodeInfo: {},
      wxQrcodeInfo: {},

      week: ['', this.$t('public.one'), this.$t('public.two'), this.$t('public.three'), this.$t('public.four'), this.$t('public.five'), this.$t('public.six'), this.$t('public.sunday')],
      cutStoreId: ''
    }
  },
  computed: {
    siteInfo() {
      let siteInfo = this.$store.getters.siteInfo
      return siteInfo
    },
    agentInfo() {
      return this.$store.getters.agentInfo
    }
  },
  mounted() {
    if (this.isStore()) {
      this.cutStoreId = this.agentInfo.storeIds[0]
    }
    this.getCashType()
    this.getBalance()
  },
  methods: {
    /**
     * 获取提现配置
     */
    getCashType() {
      let that = this;
      this.$get('iot-saas-basic/api/withdraw/config/v1/find', {
        userType: this.agentInfo.userType
      }).then((res = {}) => {
        let withdrawType = []
        if (res.enable) {
          res.supportType.map(item => {
            withdrawType.push({
              name: this.siteInfo.withdrawType[item.type],
              val: item.type
            })
          })
          let isCash = false, days = res.timeLimit && res.timeLimit.days ? res.timeLimit.days : [], cutDay = ''
          switch (res.timeLimit.type) {
            case 'DAY':
              let timeLimit = res.timeLimit.timeLimit
              cutDay = this.parseTime(this.currentTime(), '{y}-{m}-{d}')
              for (var i in timeLimit) {
                if (unixTime(`${cutDay} ${timeLimit[i].startTime}`) < this.currentTime() && unixTime(`${cutDay} ${timeLimit[i].endTime}`) > this.currentTime()) {
                  isCash = true
                  break
                }
              }
              break
            case 'WEEK':
              cutDay = new Date().getDay()
              cutDay = cutDay == 0 ? 7 : cutDay
              for (var i in days) {
                if (days[i] == cutDay) {
                  isCash = true
                  break
                }
              }
              break
            case 'MONTH':
              cutDay = new Date().getDate()
              for (var i in days) {
                if (days[i] == cutDay) {
                  isCash = true
                  break
                }
              }
              break
          }
          if (!isCash) {
            this.timeLimit = res.timeLimit
          }
        } else {
          withdrawType = [
            {
              name: that.$t('payType.wxCode'),
              val: '2'
            },
            {
              name: that.$t('payType.zfbCode'),
              val: '4'
            }
          ]
        }
        this.form.withdrawType = withdrawType[0].val
        this.withdrawType = withdrawType
        let types = this.arrayKeys(withdrawType, 'val')
        if (types.indexOf('2') > -1 || types.indexOf('4') > -1) {
          this.qrcodeInfo()
        }
        if (types.indexOf('5') > -1) {
          this.cardInfo()
        }
        if (types.indexOf('1') > -1) {
          this.wechatInfo()
        }
        if (types.indexOf('3') > -1) {
          this.alipayInfo()
        }
      })
    },

    /**
     * 获取可提现金额
     */
    getBalance() {
      let params = {}
      if (this.cutStoreId) params.storeId = this.cutStoreId
      this.$get('iot-saas-pay/api/pay/withdraw/balance', params).then(res => {
        this.money = res || {}
        if (this.money.balance) {
          this.money.balance = accSub(this.money.balance, this.money.frozenBalance)
        }
      })
    },

    /**
     * 绑定的微信信息
     */
    wechatInfo() {
      this.$get('iot-saas-pay/api/pay/withdraw/wechatAppInfo').then(res => {
        this.bindWechatInfo = res || {}
      })
    },

    /**
     * 绑定的支付宝信息
     */
    alipayInfo() {
      this.$get('iot-saas-pay/api/pay/withdraw/alipayAppInfo').then(res => {
        this.bindAlipayInfo = res || {}
      })
    },

    /**
     * 绑定的银行卡
     */
    cardInfo() {
      this.$get('iot-saas-pay/api/pay/withdraw/bankcard').then(res => {
        if (res) res.cardName = res.userName
        this.bindCardInfo = res || {}
      })
    },

    /**
     * 绑定的收款码
     */
    qrcodeInfo() {
      this.$get('iot-saas-pay/api/pay/withdraw/qrcode', {
        qrcodeType: 2
      }).then(res => {
        this.aliQrcodeInfo = res || {}
      })

      this.$get('iot-saas-pay/api/pay/withdraw/qrcode', {
        qrcodeType: 1
      }).then(res => {
        this.wxQrcodeInfo = res || {}
      })
    },

    /**
     * 获取我的商户
     */
    getMyStore() {
      let url = 'iot-saas-basic/admin/store/findMyStore'
      this.$get(url).then(res => {
        this.cutStoreId = Object.values(res)[0].id
        this.getBalance()
      })
    },

    /**
     * 提交数据
     */
    onSubmit() {
      let that = this;
      let params = JSON.parse(JSON.stringify(this.form))
      if (!params.amount) {
        this.$message.error(this.$t('moeny.pleaseAmount'))
        return
      }
      else if (parseFloat(params.amount) > parseFloat(this.money.balance)) {
        this.$message.error(this.$t('public.balanceNo'))
        return
      }
      if (params.withdrawType == 2) {
        params = Object.assign(params, this.wxQrcodeInfo)
      } else if (params.withdrawType == 4) {
        params = Object.assign(params, this.aliQrcodeInfo)
      }
      if (this.cutStoreId) params.storeId = this.cutStoreId
      this.clickSubmit = true
      this.$post('iot-saas-pay/api/pay/withdraw/apply', params).then(res => {
        this.$message({
          message: this.$t('public.operationSuccessful'),
          type: 'success'
        })
        this.$router.push({ path: '/money/cashRecord' });
        this.clickSubmit = false
      }).catch(err => {
        this.clickSubmit = false
      })
    }
  }
}
</script>

<style scoped>
.line {
  text-align: center;
}</style>
