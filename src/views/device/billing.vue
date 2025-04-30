<template>
  <div>
    <el-row class="pl-30 pr-30 pb-30 pt-10 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="16" :lg="12" :xl="10">
        <el-form ref="form" label-position="left" label-width="130px">
          <el-tabs v-model="deviceTypeCode" @tab-click="getConfig">
            <el-tab-pane :label="item" :name="key" v-for="(item, key) in myDeviceId"></el-tab-pane>
          </el-tabs>
          <template v-if="billing.deviceTypeCode == deviceTypeCode && checkAbility([`${deviceTypeCode}_BILLING`], 3)">
            <template v-for="(name, xcx) in config.xcx_pay.default" v-if="billing[`${xcx}PayMode`]">
              <h4>{{ name }}{{ $t('device.defaultBilling') }}<span class="ml-10 text-primary cursor" v-if="xcx != 'weixin'" @click="setAlipayMode(xcx)">{{
        $t('store.synchronous') }}</span></h4>
              <el-form-item :label="`${$t('store.paymentMode')}`">
                <el-radio-group v-model="billing[`${xcx}PayMode`].modeType" size="medium">
                  <el-radio-button :label="item"
                    v-for="(item, key) in (config.mode_way[billing.deviceTypeCode] ? config.mode_way[billing.deviceTypeCode] : config.mode_way.default)"
                    :disabled="!Ability[`${billing.deviceTypeCode}_${item}`] && item != Object.values((config.mode_way[billing.deviceTypeCode] ? config.mode_way[billing.deviceTypeCode] : config.mode_way.default))[0]">{{
                      $t('public.' + item) }}</el-radio-button>
                </el-radio-group>
                <el-popover placement="right" title="" width="400" trigger="hover">
                  <div>
                    {{ $t('device.setText') }}<el-link type="primary" :underline="false">{{ $t('device.toPurchase')
                    }}</el-link>
                  </div>
                  <el-link type="danger" :underline="false" slot="reference"
                    class="ml-10 el-icon-question fs-c1"></el-link>
                </el-popover>
              </el-form-item>

              <el-form-item :label="`${$t('device.packageDefault')}`" v-if="billing.deviceTypeCode != 'PA'">
                <div class="flex align-center flex-wrap mb-5"
                  v-for="(plan, index) in billing[`${xcx}PayMode`].payModeDetail">
                  <el-select v-model="plan.time">
                    <el-option :label="`${time / 60}${$t('public.huor')}`" :value="time"
                      v-for="time in config[`plan_time`]"></el-option>
                  </el-select>
                  <el-input type="number" v-model="plan.money" class="flex1 ml-10 mr-10">
                    <template :slot="currencySymbolpositionType ? 'prepend':'append'">{{ siteInfo.currencySymbol }}</template>
                  </el-input>
                  <el-button type="text" size="small" :disabled="billing[`${xcx}PayMode`].payModeDetail.length == 4"
                    v-if="index == 0"
                    @click="billing[`${xcx}PayMode`].payModeDetail.push({ time: 1, money: 2, tag: index + 1 })">{{
                      $t('public.add') }}</el-button>
                  <el-button type="text" size="small" v-else
                    @click="billing[`${xcx}PayMode`].payModeDetail.splice(index, 1)" class="text-danger">{{
                      $t('public.delete') }}</el-button>
                </div>
              </el-form-item>

              <el-form-item :label="`${$t('device.defaultBalance')}`"></el-form-item>

              <el-form-item :label="$t('public.freeTime')" v-if="billing.deviceTypeCode == 'PA'">
                <el-input type="number" v-model="billing[`${xcx}PayMode`].payModeDetails.freeTime" :placeholder="$t('store.defaultTime')">
                  <template slot="append">{{ $t('public.minute') }}</template>
                </el-input>
              </el-form-item>
              <el-form-item :label="$t('public.amount')">
                <div class="flex">
                  <div class="flex1">
                    <el-input type="number" v-model="billing[`${xcx}PayMode`].payModeDetails.startingAmount">
                      <template :slot="currencySymbolpositionType ? 'prepend':'append'">{{ [''].indexOf(xcx) > -1 ? '￥' : siteInfo.currencySymbol }}</template>
                    </el-input>
                  </div>
                  <div class="pl-10 flex1 flex">
                    <el-select v-model="billing[`${xcx}PayMode`].payModeDetails.startingTime" class="flex1">
                      <el-option :label="`${wp.title}`" :value="wp.value" v-for="(wp, index) in timeList" :key="index"></el-option>
                    </el-select>
                  </div>
                </div>
              </el-form-item>
              <!-- <el-form-item :label="$t('public.front')">
                <div class="flex">
                  <div class="flex1">
                    <el-input type="number" v-model="billing[`${xcx}PayMode`].payModeDetails.startingTime">
                      <template slot="append">{{ $t('public.minute') }}</template>
                    </el-input>
                  </div>
                  <div class="pl-10 flex1">
                    <el-input type="number" v-model="billing[`${xcx}PayMode`].payModeDetails.startingAmount">
                      <template slot="append">{{ siteInfo.currencySymbol }}</template>
                    </el-input>
                  </div>
                </div>
              </el-form-item>
              <el-form-item :label="$t('public.afterExceeding')">
                <div class="flex">
                  <div class="flex1">
                    <el-input type="number" v-model="billing[`${xcx}PayMode`].payModeDetails.overBillingUnit">
                      <template slot="append">{{ $t('public.minute') }}</template>
                    </el-input>
                  </div>
                  <div class="pl-10 flex1">
                    <el-input type="number" v-model="billing[`${xcx}PayMode`].payModeDetails.unitPrice">
                      <template slot="append">{{ siteInfo.currencySymbol }}</template>
                    </el-input>
                  </div>
                </div>
              </el-form-item> -->
              <el-form-item :label="$t('public.capping')">
                <div class="flex">
                  <div>
                    <el-select type="number" v-model="billing[`${xcx}PayMode`].payModeDetails.maxBillingTimeUnit">
                      <el-option :label="`${item / 60}${$t('public.hourlyCap')}`" :value="item"
                        v-for="item in config.day_unit"></el-option>
                    </el-select>
                  </div>
                  <div class="pl-10 flex1">
                    <el-input type="number" v-model="billing[`${xcx}PayMode`].payModeDetails.maxBillingTimePrice">
                      <template :slot="currencySymbolpositionType ? 'prepend':'append'">{{ siteInfo.currencySymbol }}</template>
                    </el-input>
                  </div>
                </div>
              </el-form-item>
              <el-form-item :label="$t('public.totalCapping')">
                <el-input type="number" v-model="billing[`${xcx}PayMode`].payModeDetails.maxAmount">
                  <template :slot="currencySymbolpositionType ? 'prepend':'append'">{{ siteInfo.currencySymbol }}</template>
                </el-input>
              </el-form-item>
              <el-form-item :label="$t('public.deposit')">
                <el-input type="number" v-model="billing[`${xcx}PayMode`].payModeDetails.depositAmount">
                  <template :slot="currencySymbolpositionType ? 'prepend':'append'">{{ siteInfo.currencySymbol }}</template>
                </el-input>
              </el-form-item>
            </template>
            <el-form-item :label="$t('public.updateAllMerchants')"
              v-if="checkAbility([`${deviceTypeCode}_BILLING_COVER`], 3)">
              <el-switch v-model="refresh" :active-value="1" :inactive-value="2" />
              <div class="text-danger" v-if="agentId">{{ $t('public.updateAllMerchantsText') }}</div>
              <div class="text-danger" v-else>{{ $t('public.updateAllMerchantsText1') }}</div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSubmit('form')" :disabled="clickSubmit">{{ $t('public.submitNow')
              }}</el-button>
            </el-form-item>
          </template>
          <template v-else>
            <div>{{ $t('public.zwPurchase') }}</div>
          </template>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { defaultFee,currencySymbolposition } from '@/utils/index'
export default {
  components: {

  },
  data() {
    return {
      clickSubmit: false,
      deviceTypeCode: '',
      billing: {},
      refresh: false,
      agentId: this.$route.query.agentId || 0,
      defaultDevice: defaultFee(),
      currencySymbolpositionType:false
    }
  },
  computed: {
    myDeviceId() {
      return this.$store.getters.myDeviceId
    },
    Ability() {
      return this.$store.getters.Ability
    },
    siteInfo() {
      return this.$store.getters.siteInfo
    },
    timeList() {
      return [
        {
          title: this.$t('public.oneHour'),
          value: '60'
        },
        {
          title: this.$t('public.halfHour'),
          value: '30'
        }
      ]
    },
  },
  mounted() {
    this.currencySymbolpositionType =  currencySymbolposition();
    this.deviceTypeCode = Object.keys(this.myDeviceId)[0]
    this.getConfig()
  },
  methods: {
    /**
     * 获取信息
     */
    getConfig(e) {
      let defaultDevice = JSON.parse(JSON.stringify(this.defaultDevice)), mode_way = Object.values(this.config.mode_way[this.deviceTypeCode] || this.config.mode_way.default)
      defaultDevice.weixinPayMode.modeType = mode_way[0]
      defaultDevice.alipayPayMode.modeType = mode_way[0]
      this.$get(`iot-saas-basic/admin/billing/configs/find`, {
        deviceTypeCode: this.deviceTypeCode,
        agentId: this.agentId
      }).then((res = {}) => {
        res.weixinPayMode = res.wechatJson ? JSON.parse(res.wechatJson) : JSON.parse(JSON.stringify(defaultDevice.weixinPayMode))
        res.alipayPayMode = res.alipayJson ? JSON.parse(res.alipayJson) : JSON.parse(JSON.stringify(defaultDevice.alipayPayMode))
        res.threePayMode = res.threeJson ? JSON.parse(res.threeJson) : JSON.parse(JSON.stringify(defaultDevice.weixinPayMode))
        res.fourPayMode = res.fourJson ? JSON.parse(res.fourJson) : JSON.parse(JSON.stringify(defaultDevice.weixinPayMode))
        res.deviceTypeCode = this.deviceTypeCode
        this.billing = res
      })
    },

    /**
     * 一键同步微信计费
     */
    setAlipayMode(key) {
      this.billing[`${key}PayMode`] = JSON.parse(JSON.stringify(this.billing.weixinPayMode))
    },

    /**
     * 提交数据
     */
    onSubmit() {
      let that = this
      let billing = JSON.parse(JSON.stringify(this.billing)), url = `iot-saas-basic/admin/billing/configs/save`
      Object.keys(this.config.xcx_pay.default).map(key => {
        billing[`${key}PayMode`].payModeDetails.unitPrice = billing[`${key}PayMode`].payModeDetails.startingAmount
        billing[`${key}PayMode`].payModeDetails.overBillingUnit = billing[`${key}PayMode`].payModeDetails.startingTime
      })
      let params = {
        deviceTypeCode: billing.deviceTypeCode,
        agentId: this.agentId,
        wechatJson: JSON.stringify(billing.weixinPayMode),
        alipayJson: JSON.stringify(billing.alipayPayMode),
        threeJson: JSON.stringify(billing.threePayMode),
        fourJson: JSON.stringify(billing.fourPayMode)
      }
      this.clickSubmit = true
      this.$post(url, params).then(res => {
        if (this.refresh == 1) {
          let params1 = {
            deviceTypeCode: billing.deviceTypeCode,
            agentId: this.agentId,
            weixinPayMode: {
              modeType: billing.weixinPayMode.modeType
            },
            alipayPayMode: {
              modeType: billing.alipayPayMode.modeType
            },
            threePayMode: {
              modeType: billing.threePayMode.modeType
            },
            fourPayMode: {
              modeType: billing.fourPayMode.modeType
            }
          }
          if (params1.agentId == 0) delete params1.agentId
          if (billing.weixinPayMode.modeType == 'PACKAGE') {
            billing.weixinPayMode.payModeDetail.map((packItem, packI) => {
              return packItem.tag = packI + 1
            })
            params1.weixinPayMode.payModeDetail = JSON.stringify(billing.weixinPayMode.payModeDetail)
          } else {
            params1.weixinPayMode.payModeDetail = JSON.stringify(billing.weixinPayMode.payModeDetails)
          }
          if (billing.alipayPayMode.modeType == 'PACKAGE') {
            billing.alipayPayMode.payModeDetail.map((packItem, packI) => {
              return packItem.tag = packI + 1
            })
            params1.alipayPayMode.payModeDetail = JSON.stringify(billing.alipayPayMode.payModeDetail)
          } else {
            params1.alipayPayMode.payModeDetail = JSON.stringify(billing.alipayPayMode.payModeDetails)
          }
          if (billing.threePayMode.modeType == 'PACKAGE') {
            billing.threePayMode.payModeDetail.map((packItem, packI) => {
              return packItem.tag = packI + 1
            })
            params1.threePayMode.payModeDetail = JSON.stringify(billing.threePayMode.payModeDetail)
          } else {
            params1.threePayMode.payModeDetail = JSON.stringify(billing.threePayMode.payModeDetails)
          }
          if (billing.fourPayMode.modeType == 'PACKAGE') {
            billing.fourPayMode.payModeDetail.map((packItem, packI) => {
              return packItem.tag = packI + 1
            })
            params1.fourPayMode.payModeDetail = JSON.stringify(billing.fourPayMode.payModeDetail)
          } else {
            params1.fourPayMode.payModeDetail = JSON.stringify(billing.fourPayMode.payModeDetails)
          }
          this.$post(`iot-saas-basic/admin/billing/configs/refreshStore`, params1).then(res => {
            this.clickSubmit = false
            this.$message({
              message: that.$t('public.submittedSuccess'),
              type: 'success'
            })
          }).catch(err => {
            this.clickSubmit = false
          })
        } else {
          this.clickSubmit = false
          this.$message({
            message: that.$t('public.submittedSuccess'),
            type: 'success'
          })
        }
      }).catch(err => {
        this.clickSubmit = false
      })
    }
  }
}
</script>

<style scoped></style>
