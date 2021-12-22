<template>
  <div class="p-10">
    <el-row class="pt-30 pl-30 pr-30 bg-white">
      <el-col>
        <el-form ref="form" label-width="130px">
          <template v-for="(item, key) in config.fee_xcx[config.goods_key[device]] || config.fee_xcx.default">
            <template v-if="fee_plan[`${config.goods_key[device]}_fund_fee_plan${key}`] && business_mode[`std_${config.goods_key[device]}${key}`]">
              <el-form-item :label="`${item}付费模式：`">
                <el-radio-group v-model="business_mode[`std_${config.goods_key[device]}${key}`].business_mode_type">
                  <template v-if="config.mode_way[config.goods_key[device]]">
                    <el-radio-button :label="item" v-for="(item, key) in config.mode_way[config.goods_key[device]]" >{{ key }}</el-radio-button>
                  </template>
                  <template v-else>
                    <el-radio-button :label="item" v-for="(item, key) in config.mode_way.default">{{ key }}</el-radio-button>
                  </template>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="付费方式：">
                <el-checkbox-group v-model="business_mode[`std_${config.goods_key[device]}${key}`].pay_type" :min="1">
                  <el-checkbox :label="key" v-for="(item, key) in config.pay_way">{{ item }}</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              <el-form-item class="mr-20" label="押金：">
                <el-input v-model="business_mode[`std_${config.goods_key[device]}${key}`].advance_price">
                  <template slot="append">元</template>
                </el-input>
              </el-form-item>
              <template v-if="business_mode[`std_${config.goods_key[device]}${key}`].business_mode_type >= 2 && device != 3">
                <el-form-item label="前：">
                  <div class="flex">
                    <div>
                      <el-input v-model="fee_plan[`${config.goods_key[device]}_fund_fee_plan${key}`].fund_once_minute" class="mr-10">
                        <template slot="append">{{ SITE_INFO.time_unit }}</template>
                      </el-input>
                    </div>
                    <div>
                      <el-input v-model="fee_plan[`${config.goods_key[device]}_fund_fee_plan${key}`].fund_once_fee" class="ml-10">
                        <template slot="append">元</template>
                      </el-input>
                    </div>
                  </div>
                </el-form-item>
                <el-form-item label="超过后：">
                  <div class="flex">
                    <div>
                      <el-input v-model="fee_plan[`${config.goods_key[device]}_fund_fee_plan${key}`].fund_rent_minute" class="mr-10">
                        <template slot="append">{{ SITE_INFO.time_unit }}</template>
                      </el-input>
                    </div>
                    <div>
                      <el-input v-model="fee_plan[`${config.goods_key[device]}_fund_fee_plan${key}`].fund_rent_fee" class="ml-10">
                        <template slot="append">元</template>
                      </el-input>
                    </div>
                  </div>
                </el-form-item>
                <div class="flex">
                  <el-form-item label="封顶：" v-if="['thread'].indexOf(config.goods_key[device]) > -1">
                    <div class="flex">
                      <el-select v-model="fee_plan[`${config.goods_key[device]}_fund_fee_plan${key}`].fund_day_unit_hour">
                        <el-option :label="`${item}小时封顶`" :value="item" v-for="item in config.day_unit"></el-option>
                      </el-select>
                      <el-input class="ml-10" v-model="fee_plan[`${config.goods_key[device]}_fund_fee_plan${key}`].fund_day_most">
                        <template slot="append">元</template>
                      </el-input>
                    </div>
                  </el-form-item>
                  <el-form-item label="每天最高：" v-else>
                    <el-input v-model="fee_plan[`${config.goods_key[device]}_fund_fee_plan${key}`].fund_day_most">
                      <template slot="append">元</template>
                    </el-input>
                  </el-form-item>
                  <el-form-item label="总封顶：">
                    <el-input v-model="fee_plan[`${config.goods_key[device]}_fund_fee_plan${key}`].fund_deposit_amount">
                      <template slot="append">元</template>
                    </el-input>
                  </el-form-item>
                </div>
              </template>
            </template>
          </template>

          <template v-for="(item, key) in config.fee_xcx[config.goods_key[device]]">
            <h4 class="pt-10">{{ item }}默认套餐设置</h4>
            <el-form-item class="mr-20" :label="`套餐${item.value}:`" v-for="item in fee_plan[`thread_fee_plan${key}`]">
              <div class="flex align-start">
                <el-select v-model="item.rent_unit_hour">
                  <el-option :label="`${time}小时`" :value="time" v-for="time in config.thread_time"></el-option>
                </el-select>
                <el-input v-model="item.rent_unit_fee">
                  <template slot="append">元</template>
                </el-input>
                <el-button type="primary" plain @click="item.rent_unit_show = item.rent_unit_show == 0 ? 1 : 0">{{ item.rent_unit_show == 1 ? '隐藏' : '显示' }}</el-button>
              </div>
            </el-form-item>
          </template>

          <el-form-item label="更新所有商户：">
            <el-checkbox :true-label="1" :false-label="0" v-model="form.store_fee_plan_reset"/>
            <div class="fs-s2 text-gray">注：勾选表示您以及您下级的所有商户都将更新为以上设置的付费方式及计费规则。</div>
          </el-form-item>

          <h4>代理提现设置：</h4>
          <div class="flex flex-wrap">
            <el-form-item label="最小金额:">
              <div class="mb-10 flex align-center">
                <el-input class="flex1" oninput="value=value.replace(/[^\d.]/g,'')" v-model="form.agent_withdraw_min_yuan">
                  <template slot="append">元</template>
                </el-input>
              </div>
            </el-form-item>
            <el-form-item label="最大金额:">
              <div class="flex align-center">
                <el-input class="flex1" oninput="value=value.replace(/[^\d.]/g,'')" v-model="form.agent_withdraw_max_yuan">
                  <template slot="append">元</template>
                </el-input>
              </div>
            </el-form-item>
          </div>

          <withdraw-plan :form="form" name="agent"></withdraw-plan>

          <h4 class="pt-20">商家提现设置：</h4>
          <div class="flex flex-wrap">
            <el-form-item label="最小金额:">
              <div class="mb-10 flex align-center">
                <el-input class="flex1" oninput="value=value.replace(/[^\d.]/g,'')" v-model="form.merchant_withdraw_min_yuan">
                  <template slot="append">元</template>
                </el-input>
              </div>
            </el-form-item>
            <el-form-item label="最大金额:">
              <div class="flex align-center">
                <el-input class="flex1" oninput="value=value.replace(/[^\d.]/g,'')" v-model="form.merchant_withdraw_max_yuan">
                  <template slot="append">元</template>
                </el-input>
              </div>
            </el-form-item>
          </div>

          <withdraw-plan :form="form" name="merchant"></withdraw-plan>

          <el-form-item>
            <el-button type="primary" @click="onSubmit(device)">立即提交</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import withdrawPlan from '../setting/_withdrawPlan'
  export default {
    components: {
      withdrawPlan: withdrawPlan
    },
    data() {
      return {
        device: 1,
        fee_plan: {},
        business_mode: {},
        card: {},
        form: {
          agent_withdraw_type: [],
          agent_withdraw_plan: [],
          merchant_withdraw_plan: [],
        },
        form_key: {
          agent_withdraw_min_yuan: '',
          agent_withdraw_max_yuan: '',
          merchant_withdraw_min_yuan: '',
          merchant_withdraw_max_yuan: '',
        },
        son_id: this.$route.query.son_id
      }
    },
    computed: {
      myDeviceName() {
        const myDeviceName = JSON.parse(JSON.stringify(this.$store.state.user.myDeviceName))
        return myDeviceName
      }
    },
    mounted() {
      this.setInfo()
    },
    methods: {
      /**
       * 获取信息
       */
      setInfo() {
        this.$get('agentapi/sttuf/get_agent_rentting_fee_plan', {
          son_id: this.son_id
        }).then(res => {
          let goods_key = this.config.goods_key, fee_xcx = this.config.fee_xcx, fee_plan = {}
          for (var i in goods_key) {
            if (res[goods_key[i] + '_fee_plan']) {
              fee_plan[goods_key[i] + '_fee_plan'] = res[goods_key[i] + '_fee_plan']
            }
            let goods_key_fee = fee_xcx[goods_key[i]] || fee_xcx.default
            for(var key in goods_key_fee){
              if(res[`${goods_key[i]}_fund_fee_plan${key}`]){
                fee_plan[ `${goods_key[i]}_fund_fee_plan${key}`] = res[`${goods_key[i]}_fund_fee_plan${key}`]
              }
              if(res[`${goods_key[i]}_fee_plan${key}`]){
                fee_plan[`${goods_key[i]}_fee_plan${key}`] = res[`${goods_key[i]}_fee_plan${key}`]
              }
              if(this.SITE_INFO.fund_fee_time_unit == 1 && ['thread', 'condom', 'humidifier'].indexOf(goods_key[i]) > -1 && fee_plan[`${goods_key[i]}_fund_fee_plan${key}`]){
                fee_plan[`${goods_key[i]}_fund_fee_plan${key}`].fund_once_minute = this.division(fee_plan[`${goods_key[i]}_fund_fee_plan${key}`].fund_once_minute, 60)
                fee_plan[`${goods_key[i]}_fund_fee_plan${key}`].fund_rent_minute = this.division(fee_plan[`${goods_key[i]}_fund_fee_plan${key}`].fund_rent_minute, 60)
              }
            }
          }
          console.log(fee_plan)
          this.fee_plan = fee_plan
          this.business_mode = res.business_mode
          let plan = [
              {
                week_day: 0,
                month_day: 1,
                begin: '00:00',
                end: '24:00'
              }
            ],
            params = {
              son_id: this.son_id,
              agent_withdraw_date_type: 0,
              agent_withdraw_plan: plan,
              merchant_withdraw_date_type: 0,
              merchant_withdraw_plan: plan
            }
          for(var i in this.form_key){
            params[i] = res[i]
          }
          if(res.withdraw_plan && res.withdraw_plan.agent){
            if(res.withdraw_plan.agent.plan.length > 0){
              params.agent_withdraw_plan = res.withdraw_plan.agent.plan
            }
            params.agent_withdraw_date_type = res.withdraw_plan.agent.date_type
          }
          if(res.withdraw_plan && res.withdraw_plan.merchant){
            if(res.withdraw_plan.merchant.plan.length > 0){
              params.merchant_withdraw_plan = res.withdraw_plan.merchant.plan
            }
            params.merchant_withdraw_date_type = res.withdraw_plan.merchant.date_type
          }
          this.form = params
        })
      },

      /**
       * 输入最大功率
       */
      setPowerMax(item) {
        let n = parseInt(item.value) + 1
        this.fee_plan.zhuang_fee_plan.plan[n].rent_zhuang_unit_power_min = parseInt(item.rent_zhuang_unit_power_max) + 1
      },

      onSubmit(device) {
        let params = {},
          url = 'agentapi/sttuf/save_agent_rentting_fee_plan',
          fee_plan = JSON.parse(JSON.stringify(this.fee_plan)),
          goods_key = this.config.goods_key,
          fee_xcx = this.config.fee_xcx
        if (this.business_mode[`std_${this.config.goods_key[device]}`]) {
          let stc = this.business_mode[`std_${this.config.goods_key[device]}`]
          params = Object.assign(stc, params)
        }
        let goods_key_fee = fee_xcx[goods_key[device]] || fee_xcx.default
        for(var key in goods_key_fee){
          if(fee_plan[`${goods_key[device]}_fund_fee_plan${key}`]){
            params[ `${goods_key[device]}_fund_fee_plan${key}`] = fee_plan[`${goods_key[device]}_fund_fee_plan${key}`]
          }
          if(fee_plan[`${goods_key[device]}_fee_plan${key}`]){
            params[`${goods_key[device]}_fee_plan${key}`] = fee_plan[`${goods_key[device]}_fee_plan${key}`]
          }
          if(key && this.business_mode[`std_${goods_key[device]}${key}`]){
            params[`${goods_key[device]}_business_mode${key}`] = this.business_mode[`std_${goods_key[device]}${key}`]
            if(this.SITE_INFO.fund_fee_time_unit == 1 && ['thread', 'condom', 'humidifier'].indexOf(goods_key[device]) > -1 && fee_plan[`${goods_key[device]}_fund_fee_plan${key}`]){
              params[`${goods_key[device]}_fund_fee_plan${key}`].fund_once_minute = this.mul(params[`${goods_key[device]}_fund_fee_plan${key}`].fund_once_minute, 60)
              params[`${goods_key[device]}_fund_fee_plan${key}`].fund_rent_minute = this.mul(params[`${goods_key[device]}_fund_fee_plan${key}`].fund_rent_minute, 60)
            }
	  }
        }
        params.son_id = this.son_id
        if(this.form.store_fee_plan_reset) params.store_fee_plan_reset = this.form.store_fee_plan_reset
        this.$post(url, params).then(res => {
          this.$post('agentapi/sttuf/save_agent_business_setting', this.form).then(res => {
            this.$message({
              message: '提交成功',
              type: 'success'
            })
            this.$store.dispatch('user/getPlatformConfig')
          })
        })
      }
    }
  }
</script>

<style scoped>

</style>
