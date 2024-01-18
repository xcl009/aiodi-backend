<template>
  <el-row class="pl-20 pr-20 custom-form bg-white">
    <el-col :sm="24" :md="16" :lg="14" :xl="10">
      <el-tabs class="mb-10" v-model="deviceTypeCode" @tab-click="getInfo">
        <el-tab-pane :label="item" :name="name" v-for="(item, name) in myDeviceId" />
      </el-tabs>

      <template v-if="checkAbility([`${deviceTypeCode}_DEPOSIT_DELAY`, `${deviceTypeCode}_DEPOSIT_MP`], 3)">
        <el-form ref="form" label-position="left" label-width="130px">
          <el-form-item :label="$t('public.status')" v-if="id">
            <div class="flex align-center">
              <el-switch v-model="form.enable" :active-value="1" :inactive-value="2" />
              <span class="ml-10 fs-s3">{{ $t('system.text3') }}</span>
            </div>
          </el-form-item>

          <template v-if="checkAbility([`${deviceTypeCode}_DEPOSIT_MP`], 3)">
            <el-form-item :label="$t('device.returnWallet')">
              <el-switch v-model="form.returnWallet" :active-value="1" :inactive-value="2" />
            </el-form-item>
            <template v-if="form.returnWallet == 1">
              <h4 class="flex mb-20 mt-10">{{ $t('public.payType') }}</h4>
              <template v-for="(item, key) in Constant.PayType">
                <el-form-item :label="item" v-if="[1,2,8,9].indexOf(parseInt(key)) > -1">
                  <div class="flex align-center">
                    <el-switch v-model="form.paymentRefundConfig[key]" active-value="1" inactive-value="0"/>
                    <span class="ml-10 fs-s3">{{ $t('device.text5') }}</span>
                  </div>
                </el-form-item>
              </template>
            </template>
          </template>

          <template v-if="checkAbility([`${deviceTypeCode}_DEPOSIT_DELAY`], 3)">
            <h4 class="flex mb-20 mt-10">{{ $t('public.other') }}</h4>
            <el-form-item :label="$t('device.delayedWithdrawal')">
              <div class="flex align-center">
                <el-switch v-model="form.refundTimeStatus" :active-value="1" :inactive-value="2" />
                <span class="ml-10 fs-s3">{{ $t('device.text6') }}</span>
              </div>
            </el-form-item>

            <el-form-item :label="$t('device.extendTime')" v-if="form.refundTimeStatus == 1">
              <el-input v-model="form.delayedRefundTime" type="number">
                <template slot="append">{{ $t('public.minute') }}</template>
              </el-input>
            </el-form-item>
          </template>

          <el-form-item class="mt-10">
            <el-button type="primary" @click="onSubmit">{{ $t('public.submitNow') }}</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template v-else>
        <div class="pb-20 cursor" @click="$router.push({ path: `/market/appList` })">{{ $t('public.zwPurchase') }}，<span
            class="text-primary">{{ $t('public.goBuy') }}</span></div>
      </template>
    </el-col>
  </el-row>
</template>

<script>
import { pickKeys } from "@/utils/index"
export default {
  name: 'steal',
  data() {
    return {
      form: {},
      id: this.$route.query.id || '',
      userKey: this.$route.query.userKey || '',
      deviceTypeCode: ''
    }
  },
  computed: {
    Constant() {
      return this.$store.getters.Constant
    },
    myDeviceId() {
      return this.$store.getters.myDeviceId
    },
    Ability() {
      return this.$store.getters.Ability
    }
  },
  mounted() {
    this.deviceTypeCode = Object.keys(this.myDeviceId)[0]
    this.getInfo()
  },
  methods: {
    /**
     * 获取详情
     */
    getInfo() {
      let params = {
        deviceTypeCode: this.deviceTypeCode
      }
      if(this.userKey && this.id) params[this.userKey] = this.id
      this.$get(`iot-saas-basic/admin/depositRefundConfig/v1/find`, params).then((res = {}) => {
        if (res.enable != undefined) {
          res.refundTimeStatus = res.delayedRefundTime > 0 ? 1 : 0
          if(!res.paymentRefundConfig){
            res.paymentRefundConfig = {1: '0', 2: '0', 8: '0', 9: '0'}
          }
          this.form = res
        } else {
          this.form = {
            returnWallet: 2,
            refundTimeStatus: 2,
            paymentRefundConfig: {1: '0', 2: '0', 8: '0', 9: '0'}
          }
        }
      })
    },

    /**
     * 提交保存
     */
    onSubmit() {
      let that = this;
      let params = JSON.parse(JSON.stringify(this.form))
      if (this.userKey && this.id) {
        params[this.userKey] = this.id
      } else {
        params.enable = 1
      }
      params.deviceTypeCode = this.deviceTypeCode
      params.delayedRefundTime = params.refundTimeStatus == 1 ? params.delayedRefundTime : 0
      params.paymentRefundConfig = JSON.stringify(params.paymentRefundConfig)
      this.$post(`iot-saas-basic/admin/depositRefundConfig/v1/update`, params).then(res => {
        this.$message({
          message: that.$t('public.setSuccess'),
          type: 'success'
        })
      })
    }
  }
}
</script>

<style scoped lang="scss">
/deep/ .el-tabs__item {
  height: 50px;
  line-height: 50px;
  font-size: 16px;
}
</style>
