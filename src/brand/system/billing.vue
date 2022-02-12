<template>
  <div class="p-10">
    <el-form ref="form" label-width="130px">
      <el-tabs class="bg-white" type="border-card">
        <template v-for="(item, index) in defaultDevice">
          <el-tab-pane :label="'计费'" class="pl-30 pr-30" v-if="(cutDevice > 0 && cutDevice == item.id) || (cutDevice == -1)">
            <template v-if="item.id == 1">
              <h3 class="pt-10">金额限制</h3>
              <div class="flex">
                <el-form-item class="mr-20" label="押金最低：">
                  <el-input v-model="form.limit_deposit_min">
                    <template slot="append">元</template>
                  </el-input>
                </el-form-item>
                <el-form-item class="mr-20" label="押金最高：">
                  <el-input v-model="form.limit_deposit_max">
                    <template slot="append">元</template>
                  </el-input>
                </el-form-item>
              </div>
              <div class="flex">
                <el-form-item class="mr-20" label="每日最低：">
                  <el-input v-model="form.limit_day_most_min">
                    <template slot="append">元</template>
                  </el-input>
                </el-form-item>
                <el-form-item class="mr-20" label="每日最高：">
                  <el-input v-model="form.limit_day_most_max">
                    <template slot="append">元</template>
                  </el-input>
                </el-form-item>
              </div>
              <div class="flex">
                <el-form-item class="mr-20" label="最高封顶最低：">
                  <el-input v-model="form.limit_amount_min">
                    <template slot="append">元</template>
                  </el-input>
                </el-form-item>
                <el-form-item class="mr-20" label="最高封顶最高：">
                  <el-input v-model="form.limit_amount_max">
                    <template slot="append">元</template>
                  </el-input>
                </el-form-item>
              </div>

              <h3 class="pt-10">其他设置</h3>
              <el-form-item class="mr-20" label="超时订单成本：">
                <el-input v-model="form.expired_thread_cost_price">
                  <template slot="append">元</template>
                </el-input>
              </el-form-item>

              <el-form-item label="计费时间单位：">
                <el-radio v-model="form.fund_fee_time_unit" :label="0">分钟</el-radio>
                <el-radio v-model="form.fund_fee_time_unit" :label="1">小时</el-radio>
              </el-form-item>

              <el-form-item class="mr-20" label="限支付宝使用：">
                <el-switch v-model="form.thread_wx_fund_switch" :active-value="0" :inactive-value="1"/>
                <div class="fs-s2 text-gray line-1">注：开启表示设备是预存+先充后付模式时，用户微信扫码不可使用，提示用户用支付宝扫码使用。</div>
              </el-form-item>
            </template>

            <template v-if="fee_plan[`${config.goods_key[device]}_buy_goods_fee`]">
              <h4 class="pt-10">成本价、售价</h4>
              <div class="flex" v-for="item in fee_plan[`${config.goods_key[device]}_buy_goods_fee`]">
                <el-form-item class="mr-20" :label="`${item.type_name}成本价：`">
                  <el-input v-model="item.cost_price">
                    <template slot="append">元</template>
                  </el-input>
                </el-form-item>
                <el-form-item class="mr-20" label="售价：">
                  <el-input v-model="item.market_price">
                    <template slot="append">元</template>
                  </el-input>
                </el-form-item>
              </div>
            </template>

            <template v-for="(name, xcx) in config.xcx_pay.default">
              <h3 class="pt-20">{{ name }}计费设置</h3>

              <el-form-item :label="`付费方式：`">
                <el-checkbox-group v-model="item[`pay_type${xcx}`]">
                  <el-checkbox :label="wk" v-for="(wp, wk) in config.pay_way">{{ wp }}</el-checkbox>
                </el-checkbox-group>
              </el-form-item>

              <el-form-item :label="`付费模式：`">
                <el-radio-group v-model="item[`mode_type${xcx}`]" size="medium">
                  <el-radio-button :label="item" v-for="(item, key) in config.mode_way.default">{{ key }}</el-radio-button>
                </el-radio-group>
              </el-form-item>

              <el-form-item :label="`套餐：`">
                <div class="mb-10 flex align-center flex-wrap" v-for="(plan, index) in item[`packages${xcx}`]">
                  <el-select v-model="plan.rent_unit_hour">
                    <el-option :label="`${time}小时`" :value="time" v-for="time in config[`plan_time`]"></el-option>
                  </el-select>
                  <el-input v-model="plan.rent_unit_fee" class="flex1 ml-10 mr-10">
                    <template slot="append">元</template>
                  </el-input>
                  <el-button type="primary" plain @click="plan.rent_unit_show = (plan.rent_unit_show == 1 ? 0 : 1)">{{ plan.rent_unit_show == 1 ? '隐藏' : '显示' }}</el-button>
                </div>
              </el-form-item>

              <template>
                <el-form-item :label="`预存+先充后付：`"></el-form-item>
                <el-form-item class="mr-20" label="押金：">
                  <el-input v-model="item[`advance_price${xcx}`]" :placeholder="`${ siteInfo['default_' + config.goods_key[item.id] +'_limit_setting'] ? '最低' + siteInfo['default_' + config.goods_key[item.id] +'_limit_setting'].limit_deposit_min + '元，最高' + siteInfo['default_' + config.goods_key[item.id] +'_limit_setting'].limit_deposit_max + '元' : ''}`">
                  <template slot="append">元</template>
                  </el-input>
                </el-form-item>
                <el-form-item label="前：">
                  <div class="flex">
                    <div>
                    <el-input v-model="item[`fund${xcx}`].fund_once_minute" class="mr-10">
                      <template slot="append">{{ SITE_INFO.time_unit }}</template>
                    </el-input>
                    </div>
                    <div>
                    <el-input v-model="item[`fund${xcx}`].fund_once_fee" class="ml-10">
                      <template slot="append">元</template>
                    </el-input>
                    </div>
                  </div>
                </el-form-item>
                <el-form-item label="超过后：">
                  <div class="flex">
                    <div>
                      <el-input v-model="item[`fund${xcx}`].fund_rent_minute" class="mr-10">
                        <template slot="append">{{ SITE_INFO.time_unit }}</template>
                      </el-input>
                    </div>
                    <div>
                      <el-input v-model="item[`fund${xcx}`].fund_rent_fee" class="ml-10">
                        <template slot="append">元</template>
                      </el-input>
                    </div>
                  </div>
                </el-form-item>
                <div class="flex">
                  <el-form-item label="封顶：">
                    <div class="flex">
                      <el-select v-model="item[`fund${xcx}`].fund_day_unit_hour">
                        <el-option :label="`${item}小时封顶`" :value="item" v-for="item in config.day_unit"></el-option>
                      </el-select>
                      <el-input class="ml-10" v-model="item[`fund${xcx}`].fund_day_most" placeholder="">
                        <template slot="append">元</template>
                      </el-input>
                    </div>
                  </el-form-item>
                  <el-form-item label="总封顶：">
                    <el-input v-model="item[`fund${xcx}`].fund_deposit_amount" placeholder="">
                    <template slot="append">元</template>
                    </el-input>
                  </el-form-item>
                </div>
              </template>
            </template>

            <template v-if="item.id == 1">
              <el-form-item label="更新所有商户：">
                <el-checkbox :true-label="1" :false-label="0" v-model="form.store_fee_plan_reset"/>
                <div class="fs-s2 text-danger line-1">注：勾选表示您以及您下级的所有商户都将更新为以上设置的付费方式及计费规则。</div>
              </el-form-item>
            </template>

            <el-form-item>
              <el-button type="primary" @click="onSubmit(item.id)" :disabled="clickSubmit">立即提交</el-button>
            </el-form-item>
          </el-tab-pane>
        </template>
      </el-tabs>
    </el-form>
  </div>
</template>

<script>
  export default {
    components: {

    },
    props: {
      cutDevice: {
        type: Number,
        default: -1
      }
    },
    data() {
      return {
        clickSubmit: false,
        fee_plan: {},
        form: {

        },
        form_key: {
          fund_fee_time_unit: 1,
          thread_wx_fund_switch: 0,
          expired_thread_cost_price: 0
        },
        defaultDevice: {}
      }
    },
    computed: {
      deviceNameObj(){
        return this.$store.state.user.deviceNameObj
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
        this.$get('agentapi/system/get_partner_config').then(res => {
          let fee_plan = {}, goods_key = this.config.goods_key, defaultDevice = {}, params = {}
          for(var i in this.form_key){
            params[i] = res[i]
          }
          params.store_fee_plan_reset = 0

          for(var i in goods_key){
            let key = goods_key[i]
            if(res[`default_${goods_key[i]}_limit_setting`]){
              params = Object.assign(params, res[`default_${goods_key[i]}_limit_setting`])
            }
            defaultDevice[i] = {
              status: 1,
              id: i,
              mode_type_wx: 0,
              mode_type_zfb: 0,
              pay_type_wx: [2],
              pay_type_zfb: [2],
              packages_wx: res[`${key}_fee_plan_wx`] || [{
                rent_unit_hour: 1,
                rent_unit_fee: 2
              }],
              packages_zfb: res[`${key}_fee_plan_zfb`] || [{
                rent_unit_hour: 1,
                rent_unit_fee: 2
              }],
              fund_wx: res[`${key}_fund_fee_plan_wx`] || {},
              fund_zfb: res[`${key}_fund_fee_plan_zfb`] || {}
            }
            if(res.business_mode[`std_${key}_wx`]){
              defaultDevice[i].pay_type_wx = res.business_mode[`std_${key}_wx`].pay_type
              defaultDevice[i].mode_type_wx = res.business_mode[`std_${key}_wx`].business_mode_type
              defaultDevice[i].advance_price_wx = res.business_mode[`std_${key}_wx`].advance_price
            }
            if(res.business_mode[`std_${key}_zfb`]){
              defaultDevice[i].pay_type_zfb = res.business_mode[`std_${key}_zfb`].pay_type
              defaultDevice[i].mode_type_zfb = res.business_mode[`std_${key}_zfb`].business_mode_type
              defaultDevice[i].advance_price_zfb = res.business_mode[`std_${key}_zfb`].advance_price
            }
          }
          this.form = params
          this.fee_plan = fee_plan
          this.defaultDevice = defaultDevice
        })
      },

      /**
       * 提交数据
       * @param {Object} device
       */
      onSubmit(device) {
        let params = JSON.parse(JSON.stringify(this.form)), url = ''
        this.clickSubmit = true
        if(device == 1){
          url = 'agentapi/system/save_partner_threading_setting'
        }
        params.device = []
        params.device.push(this.defaultDevice[device])
        this.$post(url, params).then(res => {
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
