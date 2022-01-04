<template>
  <div class="p-10">
    <el-row class="pl-30 pr-30 bg-white">
      <el-col>
        <el-form ref="form" :model="form" label-width="auto">
          <h4>押金退款模式：</h4>
          <el-form-item label="原路退回:">
            <el-radio v-model="form.drawbacke_2_balance" :label="0">&nbsp;</el-radio>
          </el-form-item>

          <el-form-item>
            <el-radio-group v-model="form.drawbacke_now">
              <el-radio-button label="1">立即退</el-radio-button>
              <el-radio-button label="0">延时退</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="延长时间:" v-if="form.drawbacke_now == 0">
            <el-input oninput="value=value.replace(/[^\d.]/g,'')" v-model="form.drawbacke_hours">
              <template slot="append">小时</template>
            </el-input>
          </el-form-item>

          <el-form-item label="退回钱包作为押金:">
            <el-radio v-model="form.drawbacke_2_balance" :label="1">&nbsp;</el-radio>
          </el-form-item>

          <h4>提现方式设置：</h4>
          <el-form-item label="提现方式:">
            <el-checkbox-group v-model="form.agent_withdraw_type" :min="1">
              <el-checkbox label="0">银行卡</el-checkbox>
              <el-checkbox label="1">微信</el-checkbox>
              <el-checkbox label="2">支付宝</el-checkbox>
              <el-checkbox label="3">微信收款码</el-checkbox>
              <el-checkbox label="4">支付宝收款码</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <h4>代理提现设置：</h4>
          <el-form-item label="需审核金额:">
            <el-input oninput="value=value.replace(/[^\d.]/g,'')" v-model="form.agent_audit_min_yuan">
              <template slot="append">元</template>
            </el-input>
          </el-form-item>

          <el-form-item label="其他手续费模式:">
            <el-radio v-model="form.agent_withdraw_fee_type" :label="0">税点</el-radio>
            <el-radio v-model="form.agent_withdraw_fee_type" :label="1">手续费</el-radio>
            <el-radio v-model="form.agent_withdraw_fee_type" :label="2">税点+手续费</el-radio>
            <el-popover
              placement="right"
              title="手续费模式"
              width="400"
              trigger="hover">
              <div>
                微信、银行卡、微信收款码、支付宝收款码等提现方式使用此手续费模式
              </div>
              <el-link type="danger" slot="reference" class="ml-10 el-icon-question"></el-link>
            </el-popover>
          </el-form-item>

          <el-form-item label="支付宝手续费模式:">
            <el-radio v-model="form.agent_withdraw_fee_zfb_type" :label="0">税点</el-radio>
            <el-radio v-model="form.agent_withdraw_fee_zfb_type" :label="1">手续费</el-radio>
            <el-radio v-model="form.agent_withdraw_fee_zfb_type" :label="2">税点+手续费</el-radio>
            <el-popover
              placement="right"
              title="手续费模式"
              width="400"
              trigger="hover">
              <div>
                代理提现到支付宝时使用此手续费模式
              </div>
              <el-link type="danger" slot="reference" class="ml-10 el-icon-question"></el-link>
            </el-popover>
          </el-form-item>

          <div class="flex flex-wrap">
            <el-form-item label="税点:">
              <div class="mb-10 flex align-center">
                <el-input class="flex1" oninput="value=value.replace(/[^\d.]/g,'')" v-model="form.agent_withdraw_percent">
                  <template slot="append">%</template>
                </el-input>
              </div>
            </el-form-item>
            <el-form-item label="手续费:">
              <div class="flex align-center">
                <el-input class="flex1" oninput="value=value.replace(/[^\d.]/g,'')" v-model="form.agent_withdraw_fee">
                  <template slot="append">元</template>
                </el-input>
              </div>
            </el-form-item>
          </div>

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

          <h4>商家提现设置：</h4>
          <el-form-item label="需审核金额:">
            <el-input oninput="value=value.replace(/[^\d.]/g,'')" v-model="form.merchant_audit_min_yuan">
              <template slot="append">元</template>
            </el-input>
          </el-form-item>

          <el-form-item label="其他手续费模式:">
            <el-radio v-model="form.merchant_withdraw_fee_type" :label="0">税点</el-radio>
            <el-radio v-model="form.merchant_withdraw_fee_type" :label="1">手续费</el-radio>
            <el-radio v-model="form.merchant_withdraw_fee_type" :label="2">税点+手续费</el-radio>
            <el-popover
              placement="right"
              title="手续费模式"
              width="400"
              trigger="hover">
              <div>
                微信、银行卡、微信收款码、支付宝收款码等提现方式使用此手续费模式
              </div>
              <el-link type="danger" slot="reference" class="ml-10 el-icon-question"></el-link>
            </el-popover>
          </el-form-item>

          <el-form-item label="支付宝手续费模式:">
            <el-radio v-model="form.merchant_withdraw_fee_zfb_type" :label="0">税点</el-radio>
            <el-radio v-model="form.merchant_withdraw_fee_zfb_type" :label="1">手续费</el-radio>
            <el-radio v-model="form.merchant_withdraw_fee_zfb_type" :label="2">税点+手续费</el-radio>
            <el-popover
              placement="right"
              title="手续费模式"
              width="400"
              trigger="hover">
              <div>
                商户提现到支付宝时使用此手续费模式
              </div>
              <el-link type="danger" slot="reference" class="ml-10 el-icon-question"></el-link>
            </el-popover>
          </el-form-item>

          <div class="flex flex-wrap">
            <el-form-item label="税点:">
              <div class="mb-10 flex align-center">
                <el-input class="flex1" oninput="value=value.replace(/[^\d.]/g,'')" v-model="form.merchant_withdraw_percent">
                  <template slot="append">%</template>
                </el-input>
              </div>
            </el-form-item>
            <el-form-item label="手续费:">
              <div class="flex align-center">
                <el-input class="flex1" oninput="value=value.replace(/[^\d.]/g,'')" v-model="form.merchant_withdraw_fee">
                  <template slot="append">元</template>
                </el-input>
              </div>
            </el-form-item>
          </div>

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

          <h4>用户提现设置：</h4>
          <div class="flex flex-wrap">
            <el-form-item label="需审核金额:">
              <el-input oninput="value=value.replace(/[^\d.]/g,'')" v-model="form.user_audit_min_yuan">
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
            <el-form-item label="手续费:">
              <el-input oninput="value=value.replace(/[^\d.]/g,'')" v-model="form.user_withdraw_percent">
                <template slot="append">%</template>
              </el-input>
            </el-form-item>
          </div>
          <div class="flex flex-wrap">
            <el-form-item label="最小金额:">
              <div class="mb-10 flex align-center">
                <el-input class="flex1" oninput="value=value.replace(/[^\d.]/g,'')" v-model="form.user_withdraw_min_yuan">
                  <template slot="append">元</template>
                </el-input>
              </div>
            </el-form-item>
            <el-form-item label="最大金额:">
              <div class="flex align-center">
                <el-input class="flex1" oninput="value=value.replace(/[^\d.]/g,'')" v-model="form.user_withdraw_max_yuan">
                  <template slot="append">元</template>
                </el-input>
              </div>
            </el-form-item>
          </div>
          <el-form-item label="押金提现退款模式:">
            <el-switch v-model="form.user_withdraw_by_refund" :active-value="1" :inactive-value="0"/>
            <div class="fs-s2 text-gray">注：开启表示用户从钱包提现，以订单退款的方式给用户返还。</div>
          </el-form-item>

          <h4>用户相关设置：</h4>
          <el-form-item class="mb-0" label="微信手机号权限:">
            <el-switch v-model="form.register_user_moblie_wx" :active-value="1" :inactive-value="0"/>
            <div class="fs-s2 text-gray">注：开启表示微信用户注册须授权手机号。</div>
          </el-form-item>
          <el-form-item class="mb-0" label="支付宝手机号权限:">
            <el-switch v-model="form.register_user_moblie" :active-value="1" :inactive-value="0"/>
            <div class="fs-s2 text-gray">注：开启表示支付宝小程序已获得获取用户手机号权限，用户注册须授权手机号。</div>
          </el-form-item>

          <!-- <h4>首单免费：</h4>
          <el-form-item label="是否开启:">
            <el-switch v-model="form.first_free_right" :active-value="1" :inactive-value="0" />
          </el-form-item> -->

          <h4>先连蓝牙：</h4>
          <el-form-item class="mb-0" label="是否开启:">
            <el-switch v-model="form.advance_buletooth" :active-value="1" :inactive-value="0" />
            <div class="fs-s2 text-gray">注：开启表示所有蓝牙启动设备需链接蓝牙成功才可下单。</div>
          </el-form-item>

          <!-- <h4>结束订单：</h4>
          <el-form-item label="禁止用户结束:">
            <el-switch v-model="form.forrbiden_user_finish" :active-value="1" :inactive-value="0" />
          </el-form-item> -->

          <h4>订单分成明细：</h4>
          <el-form-item label="是否显示:">
            <el-switch v-model="form.order_profits_detail_show" :active-value="1" :inactive-value="0" />
          </el-form-item>

          <h4>代理商家公众号登录模式：</h4>
          <el-form-item label="是否开启:">
            <el-switch v-model="form.wxgzh_login_switch" :active-value="1" :inactive-value="0" />
          </el-form-item>

          <h4>新商户DD规则：</h4>
          <div class="flex flex-wrap">
            <el-form-item label="前:">
              <div class="flex align-center">
                <el-input class="flex1" oninput="value=value.replace(/[^\d.]/g,'')" v-model="form.ignore_steal_begin_orders">
                  <template slot="append">单不参与DD</template>
                </el-input>
              </div>
            </el-form-item>
          </div>

          <template v-if="powerInfo.buy_goods_right">
            <h4>设备出售：</h4>
            <div class="flex flex-wrap">
              <el-form-item label="售卖状态:">
                <el-switch v-model="form.sell_goods_switch" :active-value="1" :inactive-value="0" />
              </el-form-item>
              <el-form-item label="默认商户ID:">
                <el-input oninput="value=value.replace(/[^\d.]/g,'')" v-model="form.selled_goods_bind_sid"></el-input>
                <div class="fs-s2 text-gray">注：用户购买设备后，设备将会绑定到此商户，商户ID可在商户列表查到。</div>
              </el-form-item>
            </div>
          </template>

          <el-form-item>
            <el-button type="primary" @click="onSubmit" :disabled="clickSubmit">提交</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import withdrawPlan from './_withdrawPlan'
  export default {
    components: {
      withdrawPlan: withdrawPlan
    },
    data() {
      return {
        clickSubmit: false,
        form: {
          drawbacke_now: 1,
          agent_withdraw_type: [],
          agent_withdraw_plan: [],
          merchant_withdraw_plan: []
        },
        form_key: {
          drawbacke_now: 1,
          drawbacke_2_balance:'',
          drawbacke_hours:'',
          agent_withdraw_type:[],
          agent_audit_min_yuan:'',
          agent_withdraw_fee_type:'',
          agent_withdraw_fee_zfb_type: 0,
          agent_withdraw_percent:'',
          agent_withdraw_fee:'',
          merchant_audit_min_yuan:'',
          merchant_withdraw_fee_type:'',
          merchant_withdraw_fee_zfb_type:'',
          merchant_withdraw_percent:'',
          merchant_withdraw_fee:'',
          user_audit_min_yuan:'',
          user_withdraw_percent:'',
          free_rent_minutes: '',
          register_user_moblie: 0,
          register_user_moblie_wx: 1,
          first_free_right: 0,
          advance_buletooth: 1,
          agent_withdraw_min_yuan: '',
          agent_withdraw_max_yuan: '',
          merchant_withdraw_min_yuan: '',
          merchant_withdraw_max_yuan: '',
          user_withdraw_min_yuan: '',
          user_withdraw_max_yuan: '',
          expired_bao_cost_price: '',
          expired_thread_cost_price: '',
          user_withdraw_by_refund: 0,
          order_profits_detail_show: 1,
          sell_goods_switch: 0,
          selled_goods_bind_sid: '',
          wxgzh_login_switch: 0,
          ignore_steal_begin_orders: 0
        },
        powerInfo: {}
      }
    },
    mounted() {
      this.setInfo()
      this.$get('agentapi/add_agent').then(res => {
        this.powerInfo = res
      })
    },
    methods: {
      /**
       * 获取信息
       */
      setInfo() {
        this.$get('agentapi/get_partner_config', {}).then(res => {
          let plan = [
              {
                week_day: 0,
                month_day: 1,
                begin: '00:00',
                end: '24:00'
              }
            ],
            params = {
              agent_withdraw_date_type: 0,
              agent_withdraw_plan: plan,
              merchant_withdraw_date_type: 0,
              merchant_withdraw_plan: plan
            }
          for(var i in this.form_key){
            params[i] = res[i]
          }
          if (params.drawbacke_time) params.drawbacke_hours = params.drawbacke_time / 60 / 60
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

      onSubmit() {
        let params = JSON.parse(JSON.stringify(this.form)), url = 'agentapi/save_partner_setting'
        this.clickSubmit = true
        this.$post(url, params).then(res => {
          this.$post('agentapi/system/save_key_value', {
            sell_goods_switch: params.sell_goods_switch,
            selled_goods_bind_sid: params.selled_goods_bind_sid,
            wxgzh_login_switch: params.wxgzh_login_switch,
            register_user_moblie: params.register_user_moblie,
            register_user_moblie_wx: params.register_user_moblie_wx
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
        }).catch(err=>{
          this.clickSubmit = false
        })
      }
    }
  }
</script>

<style scoped>

</style>
