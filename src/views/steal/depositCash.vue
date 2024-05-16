<template>
  <el-row class="pl-20 pr-20 custom-form bg-white">
    <el-col :sm="24" :md="16" :lg="14" :xl="10">
      <el-tabs class="mb-10 fs-b2" v-model="deviceTypeCode" @tab-click="getInfo">
        <el-tab-pane :label="item" :name="name" v-for="(item, name) in myDeviceId" />
      </el-tabs>
      <template v-if="checkAbility([`${deviceTypeCode}_DEPOSIT_PRPR`], 3)">
        <el-form ref="form" label-position="left" label-width="auto">
          <h4 class="flex mb-20 mt-10">
            <div>{{ $t('public.probabilityDeposit') }}</div>
            <div class="ml-5">
              <el-popover placement="top-start" :title="$t('public.tips')" width="450" trigger="hover">
                <div>
                  {{ $t('steal.text19') }}
                </div>
                <svg-icon icon-class="doubt" slot="reference"></svg-icon>
              </el-popover>
            </div>
          </h4>

          <el-form-item :label="$t('steal.isItEnabled')">
            <div class="flex align-center">
              <el-switch v-model="form.enable" :active-value="1" :inactive-value="2" />
              <span class="ml-10 fs-s3"> {{ $t('system.text3') }}</span>
            </div>
          </el-form-item>

          <div class="flex">
            <el-form-item :label="$t('public.every')">
              <el-input type="number" v-model="form.orderNumber">
                <template slot="append">{{ $t('public.people') }}</template>
              </el-input>
            </el-form-item>
            <el-form-item :label="$t('public.every')">
              <el-input type="number" v-model="form.freeNumber">
                <template slot="append">{{ $t('public.people') }}</template>
              </el-input>
            </el-form-item>
          </div>

          <el-form-item :label="$t('public.time')">
            <el-input type="number" v-model="form.durationTime">
              <template slot="append">{{ $t('public.day') }}</template>
            </el-input>
            <div v-if="form.isNewUser != 1">
              {{ $t('system.orderForLeasing') }}{{ form.durationTime || 0 }}{{ $t('system.calculateProbability') }}
            </div>
          </el-form-item>

          <el-form-item :label="$t('public.targetingNewUsers')">
            <div class="flex align-center">
              <el-switch v-model="form.isNewUser" :active-value="1" :inactive-value="0" />
              <span class="ml-10 fs-s3">{{ $t('system.openRepresentation') }}{{ form.durationTime }}{{ $t('system.noOrderPlaced') }}</span>
            </div>
          </el-form-item>

          <el-form-item :label="$t('public.walletBalance')">
            <el-input type="number" v-model="form.walletBalance">
              <template slot="append">{{ siteInfo.currencySymbol }}</template>
            </el-input>
            <div>
              {{ $t('system.userMoeny') }}{{ form.walletBalance > 0 ? form.walletBalance : 0.1 }}{{ $t('system.freeOfChargeLease') }}
            </div>
          </el-form-item>

          <el-form-item class="mt-10">
            <el-button type="primary" @click="onSubmit">{{ $t('public.submitNow') }}</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template v-else>
        <div class="pb-20 cursor" @click="$router.push({path: `/market/appList`})">{{ $t('public.zwPurchase') }}，<span class="text-primary">{{ $t('public.goBuy') }}</span></div>
      </template>
    </el-col>
  </el-row>
</template>

<script>
  import {
    pickKeys
  } from "@/utils/index"
  export default {
    name: 'steal',
    data() {
      return {
        form: {},
        deviceTypeCode: '',
        id: this.$route.query.id || '',
        userKey: this.$route.query.userKey || '',
      }
    },
    computed: {
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
        if(!this.checkAbility([`${this.deviceTypeCode}_DEPOSIT_PRPR`], 3)) return
        this.$get(`iot-saas-basic/admin/probabilityDeposit/v1/find`, params).then((res = {} )=> {
          if (res.enable == undefined) {
            this.form = {
              enable: 2,
              durationTime: 7,
              walletBalance: 0,
              orderNumber: 0,
              freeNumber: 0,
              isNewUser: 0
            }
          } else {
            res.durationTime = parseInt(res.durationTime) / 1440
            this.form = res
          }
        })
      },

      /**
       * 提交保存
       */
      onSubmit() {
        let that = this;
        let params = JSON.parse(JSON.stringify(this.form))
        params.deviceTypeCode = this.deviceTypeCode
        params.durationTime = parseInt(params.durationTime) * 1440
        if(this.userKey && this.id) params[this.userKey] = this.id
        this.$post(`iot-saas-basic/admin/probabilityDeposit/v1/update`, params).then(res => {
          this.$message({
            message: that.$t('public.operationSuccessful'),
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
