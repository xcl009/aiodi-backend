<template>
  <div>
    <el-row class="pl-30 pr-30 pb-30 pt-10 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="16" :lg="12" :xl="10">
        <el-form ref="form" label-position="left" label-width="130px">
          <el-tabs>
            <el-tab-pane :label="item" v-for="(item, key) in myDeviceId"></el-tab-pane>
          </el-tabs>
          <template v-for="(item, index) in deviceDataArr">
            <template v-for="(name, xcx) in config.xcx_pay.default">
              <h4>{{ name }}计费默认设置</h4>
              <el-form-item :label="`付费模式`">
                <el-radio-group v-model="item[`${xcx}PayMode`].modeType" size="medium">
                  <el-radio-button :label="item" v-for="(item, key) in config.mode_way.default" :disabled="key != 1">{{ key }}</el-radio-button>
                </el-radio-group>
                <el-popover
                  placement="right"
                  title=""
                  width="400"
                  trigger="hover">
                  <div>
                    需了解和设置预存+先充后付？<el-link type="primary" :underline="false">点此去购买</el-link>
                  </div>
                  <el-link type="danger" :underline="false" slot="reference" class="ml-10 el-icon-question fs-c1"></el-link>
                </el-popover>
              </el-form-item>

              <el-form-item :label="`套餐默认`" v-if="item.deviceTypeCode != 'PA'">
                <div class="flex align-center flex-wrap" v-for="(plan, index) in item[`${xcx}PayMode`].payModeDetail">
                  <el-select v-model="plan.time">
                    <el-option :label="`${time}小时`" :value="time" v-for="time in config[`plan_time`]"></el-option>
                  </el-select>
                  <el-input v-model="plan.money" class="flex1 ml-10 mr-10">
                    <template slot="append">元</template>
                  </el-input>
                  <el-button type="text" size="small" :disabled="item[`${xcx}PayMode`].payModeDetail.length == 4" v-if="index == 0"
                    @click="item[`${xcx}PayMode`].payModeDetail.push({time: 1, money: 2, tag: index + 1})">添加</el-button>
                  <el-button type="text" size="small" v-else
                    @click="item[`${xcx}PayMode`].payModeDetail.splice(index, 1)" class="text-danger">删除</el-button>
                </div>
              </el-form-item>

              <el-form-item :label="`预存免押默认`"></el-form-item>
              <el-form-item label="前">
                <div class="flex">
                  <div class="flex1">
                    <el-input v-model="item[`${xcx}PayMode`].payModeDetails.startingTime">
                      <template slot="append">分钟</template>
                    </el-input>
                  </div>
                  <div class="pl-10 flex1">
                    <el-input v-model="item[`${xcx}PayMode`].payModeDetails.startingAmount">
                      <template slot="append">元</template>
                    </el-input>
                  </div>
                </div>
              </el-form-item>
              <el-form-item label="超过后">
                <div class="flex">
                  <div class="flex1">
                    <el-input v-model="item[`${xcx}PayMode`].payModeDetails.overBillingUnit">
                      <template slot="append">分钟</template>
                    </el-input>
                  </div>
                  <div class="pl-10 flex1">
                    <el-input v-model="item[`${xcx}PayMode`].payModeDetails.unitPrice">
                      <template slot="append">元</template>
                    </el-input>
                  </div>
                </div>
              </el-form-item>
              <el-form-item label="封顶">
                <div class="flex">
                  <div>
                    <el-select v-model="item[`${xcx}PayMode`].payModeDetails.maxBillingTimeUnit">
                      <el-option :label="`${item / 60}小时封顶`" :value="item" v-for="item in config.day_unit"></el-option>
                    </el-select>
                  </div>
                  <div class="pl-10 flex1">
                    <el-input v-model="item[`${xcx}PayMode`].payModeDetails.maxBillingTimePrice">
                      <template slot="append">元</template>
                    </el-input>
                  </div>
                </div>
              </el-form-item>
              <el-form-item label="总封顶">
                <el-input v-model="item[`${xcx}PayMode`].payModeDetails.maxAmount">
                  <template slot="append">元</template>
                </el-input>
              </el-form-item>
              <el-form-item label="押金">
                <el-input v-model="item[`${xcx}PayMode`].payModeDetails.depositAmount">
                  <template slot="append">元</template>
                </el-input>
              </el-form-item>
              <el-form-item></el-form-item>
            </template>
          </template>
          <el-form-item>
            <el-button type="primary" @click="onSubmit('form')" :disabled="clickSubmit">立即提交</el-button>
          </el-form-item>
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
        deviceDataArr: [],
        defaultDevice: defaultFee()
      }
    },
    computed: {
      myDeviceId() {
        return this.$store.getters.myDeviceId
      }
    },
    mounted() {
      this.getDefaultConfig()
    },
    methods: {
      /**
       * 获取信息
       */
      getDefaultConfig() {
        this.$get('iot-saas-basic/admin/settings/find').then(res => {
          if(JSON.stringify(res) == '{}'){
            this.defaultDevice.deviceTypeCode = Object.keys(this.myDeviceId)[0]
            this.deviceDataArr.push(this.defaultDevice)
          } else {
            this.deviceDataArr.push(res.paymentSettings)
          }
        })
      },

      /**
       * 提交数据
       */
      onSubmit() {
        let params = JSON.parse(JSON.stringify(this.deviceDataArr)), url = 'iot-saas-basic/admin/settings/save'
        this.clickSubmit = true
        this.$post(url, {
          paymentSettings: params[0]
        }).then(res => {
          this.clickSubmit = false
          this.$message({
            message: '提交成功',
            type: 'success'
          })
          this.$store.dispatch('user/getPlatformConfig')
        }).catch(err=>{
          this.clickSubmit = false
        })
      }
    }
  }
</script>

<style scoped>

</style>
