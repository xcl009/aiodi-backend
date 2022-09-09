<template>
  <div>
    <el-row class="pl-30 pr-30 pb-30 pt-10 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="16" :lg="12" :xl="10">
        <el-form ref="form" label-position="left" label-width="130px">
          <el-tabs v-model="deviceTypeCode" @tab-click="getConfig">
            <el-tab-pane :label="item" :name="key" v-for="(item, key) in myDeviceId"></el-tab-pane>
          </el-tabs>
          <template v-if="billing.deviceTypeCode == deviceTypeCode">
            <template v-for="(name, xcx) in config.xcx_pay.default">
              <h4>{{ name }}计费默认设置</h4>
              <el-form-item :label="`付费模式`">
                <el-radio-group v-model="billing[`${xcx}PayMode`].modeType" size="medium">
                  <el-radio-button :label="item" v-for="(item, key) in (config.mode_way[billing.deviceTypeCode] ? config.mode_way[billing.deviceTypeCode] : config.mode_way.default)">{{ key }}</el-radio-button>
                </el-radio-group>
                <el-popover
                  placement="right"
                  title=""
                  width="400"
                  trigger="hover">
                  <div>
                    需了解和设置预存+免押？<el-link type="primary" :underline="false">点此去购买</el-link>
                  </div>
                  <el-link type="danger" :underline="false" slot="reference" class="ml-10 el-icon-question fs-c1"></el-link>
                </el-popover>
              </el-form-item>

              <el-form-item :label="`套餐默认`" v-if="billing.deviceTypeCode != 'PA'">
                <div class="flex align-center flex-wrap mb-10" v-for="(plan, index) in billing[`${xcx}PayMode`].payModeDetail">
                  <el-select v-model="plan.time">
                    <el-option :label="`${time / 60}小时`" :value="time" v-for="time in config[`plan_time`]"></el-option>
                  </el-select>
                  <el-input v-model="plan.money" class="flex1 ml-10 mr-10">
                    <template slot="append">元</template>
                  </el-input>
                  <el-button type="text" size="small" :disabled="billing[`${xcx}PayMode`].payModeDetail.length == 4" v-if="index == 0"
                    @click="billing[`${xcx}PayMode`].payModeDetail.push({time: 1, money: 2, tag: index + 1})">添加</el-button>
                  <el-button type="text" size="small" v-else
                    @click="billing[`${xcx}PayMode`].payModeDetail.splice(index, 1)" class="text-danger">删除</el-button>
                </div>
              </el-form-item>

              <el-form-item :label="`预存免押默认`"></el-form-item>
              <el-form-item label="前">
                <div class="flex">
                  <div class="flex1">
                    <el-input v-model="billing[`${xcx}PayMode`].payModeDetails.startingTime">
                      <template slot="append">分钟</template>
                    </el-input>
                  </div>
                  <div class="pl-10 flex1">
                    <el-input v-model="billing[`${xcx}PayMode`].payModeDetails.startingAmount">
                      <template slot="append">元</template>
                    </el-input>
                  </div>
                </div>
              </el-form-item>
              <el-form-item label="超过后">
                <div class="flex">
                  <div class="flex1">
                    <el-input v-model="billing[`${xcx}PayMode`].payModeDetails.overBillingUnit">
                      <template slot="append">分钟</template>
                    </el-input>
                  </div>
                  <div class="pl-10 flex1">
                    <el-input v-model="billing[`${xcx}PayMode`].payModeDetails.unitPrice">
                      <template slot="append">元</template>
                    </el-input>
                  </div>
                </div>
              </el-form-item>
              <el-form-item label="封顶">
                <div class="flex">
                  <div>
                    <el-select v-model="billing[`${xcx}PayMode`].payModeDetails.maxBillingTimeUnit">
                      <el-option :label="`${item / 60}小时封顶`" :value="item" v-for="item in config.day_unit"></el-option>
                    </el-select>
                  </div>
                  <div class="pl-10 flex1">
                    <el-input v-model="billing[`${xcx}PayMode`].payModeDetails.maxBillingTimePrice">
                      <template slot="append">元</template>
                    </el-input>
                  </div>
                </div>
              </el-form-item>
              <el-form-item label="总封顶">
                <el-input v-model="billing[`${xcx}PayMode`].payModeDetails.maxAmount">
                  <template slot="append">元</template>
                </el-input>
              </el-form-item>
              <el-form-item label="押金">
                <el-input v-model="billing[`${xcx}PayMode`].payModeDetails.depositAmount">
                  <template slot="append">元</template>
                </el-input>
              </el-form-item>
              <el-form-item></el-form-item>
            </template>
            <el-form-item>
              <el-button type="primary" @click="onSubmit('form')" :disabled="clickSubmit">立即提交</el-button>
            </el-form-item>
          </template>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import { defaultFee } from '@/utils/index'
  export default {
    components: {

    },
    data() {
      return {
        clickSubmit: false,
        deviceTypeCode: '',
        billing: {},
        defaultDevice: defaultFee()
      }
    },
    computed: {
      myDeviceId() {
        return this.$store.getters.myDeviceId
      }
    },
    mounted() {
      this.deviceTypeCode = Object.keys(this.myDeviceId)[0]
      this.getConfig()
    },
    methods: {
      /**
       * 获取信息
       */
      getConfig(e){
        let defaultDevice = JSON.parse(JSON.stringify(this.defaultDevice))
        this.$get(`iot-saas-basic/admin/billing/${this.deviceTypeCode}/-1/configs`).then(res => {
          if(res.length > 0){
            let info = res[0]
            info.weixinPayMode = JSON.parse(info.wechatJson)
            info.alipayPayMode = JSON.parse(info.wechatJson)
            this.billing = info
          } else {

          }
        })
      },

      /**
       * 提交数据
       */
      onSubmit() {
        let billing = JSON.parse(JSON.stringify(this.billing)), url = `iot-saas-basic/admin/billing/save/configs`
        let params = {
          deviceTypeCode: billing.deviceTypeCode,
          wechatJson: JSON.stringify(billing.weixinPayMode),
          alipayJson: JSON.stringify(billing.alipayPayMode)
        }
        console.log(params)
        this.clickSubmit = true
        this.$post(url, params).then(res => {
          this.clickSubmit = false
          this.$message({
            message: '提交成功',
            type: 'success'
          })
          //this.$store.dispatch('user/getPlatformConfig')
        }).catch(err=>{
          this.clickSubmit = false
        })
      }
    }
  }
</script>

<style scoped>

</style>
