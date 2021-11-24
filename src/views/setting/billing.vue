<template>
  <div class="p-10">
    <el-form ref="form" label-width="140px">
      <el-tabs class="bg-white" type="border-card">
        <template v-for="(device, index) in deviceNameObj">
          <el-tab-pane :label="index + '计费'" class="pl-30 pr-30" v-if="(cutDevice > 0 && cutDevice == device) || (cutDevice == -1)">
            <template v-if="device == 1">
              <h4 class="pt-10">金额限制</h4>
              <template v-if="fee_plan.default_thread_limit_setting">
                <div class="flex">
                  <el-form-item class="mr-20" label="押金最低：">
                    <el-input v-model="fee_plan.default_thread_limit_setting.limit_deposit_min">
                      <template slot="append">元</template>
                    </el-input>
                  </el-form-item>
                  <el-form-item class="mr-20" label="押金最高：">
                    <el-input v-model="fee_plan.default_thread_limit_setting.limit_deposit_max">
                      <template slot="append">元</template>
                    </el-input>
                  </el-form-item>
                </div>
                <div class="flex">
                  <el-form-item class="mr-20" label="每日最低：">
                    <el-input v-model="fee_plan.default_thread_limit_setting.limit_day_most_min">
                      <template slot="append">元</template>
                    </el-input>
                  </el-form-item>
                  <el-form-item class="mr-20" label="每日最高：">
                    <el-input v-model="fee_plan.default_thread_limit_setting.limit_day_most_max">
                      <template slot="append">元</template>
                    </el-input>
                  </el-form-item>
                </div>
                <div class="flex">
                  <el-form-item class="mr-20" label="最高封顶最低：">
                    <el-input v-model="fee_plan.default_thread_limit_setting.limit_amount_min">
                      <template slot="append">元</template>
                    </el-input>
                  </el-form-item>
                  <el-form-item class="mr-20" label="最高封顶最高：">
                    <el-input v-model="fee_plan.default_thread_limit_setting.limit_amount_max">
                      <template slot="append">元</template>
                    </el-input>
                  </el-form-item>
                </div>
              </template>
              <el-form-item class="mr-20" label="超时订单成本：">
                <el-input v-model="form.expired_thread_cost_price">
                  <template slot="append">元</template>
                </el-input>
              </el-form-item>

              <el-form-item label="计费时间单位:">
                <el-radio v-model="form.fund_fee_time_unit" :label="0">分钟</el-radio>
                <el-radio v-model="form.fund_fee_time_unit" :label="1">小时</el-radio>
              </el-form-item>
            </template>

            <template v-if="fee_plan[`${config.goods_key[device]}_buy_goods_fee`]">
              <h4 class="pt-10">成本价售价</h4>
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

            <template v-if="business_mode[`std_${config.goods_key[device]}`]">
              <h4>付费设置</h4>
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
                      <el-form-item label="每天封顶：" v-else>
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

              <template v-if="device == 3">
                <div class="flex flex-wrap">
                  <el-form-item class="mr-20" label="最高封顶：">
                    <el-input v-model="fee_plan.zhuang_fee_plan.rent_zhuang_daymost">
                      <template slot="append">元</template>
                    </el-input>
                  </el-form-item>
                  <el-form-item class="mr-20" label="充电电费：">
                    <el-input v-model="fee_plan.zhuang_fee_plan.rent_zhuang_electrcity_fee">
                      <template slot="append">元/度</template>
                    </el-input>
                  </el-form-item>
                  <el-form-item class="mr-20" label="服务费：">
                    <el-input v-model="fee_plan.zhuang_fee_plan.rent_zhuang_service_fee">
                      <template slot="append">元/{{fee_plan.zhuang_fee_plan.rent_zhuang_unit_hour}}小时</template>
                    </el-input>
                  </el-form-item>
                  <el-form-item class="mr-20" label="计费单位：">
                    <el-select v-model="fee_plan.zhuang_fee_plan.rent_zhuang_unit_hour" placeholder="请选择">
                      <el-option value="0.5" label="0.5小时"></el-option>
                      <el-option value="1" label="1小时"></el-option>
                    </el-select>
                  </el-form-item>
                </div>
              </template>
              <el-form-item label="更新所有商户：">
                <el-checkbox :true-label="1" :false-label="0" v-model="form.store_fee_plan_reset"/>
                <div class="fs-s2 text-gray">注：勾选表示您以及您下级的所有商户都将更新为以上设置的付费方式及计费规则。</div>
              </el-form-item>
            </template>

            <template v-if="device == 0">
              <h4 class="pt-20">免费时长设置：</h4>
              <div class="flex flex-wrap">
                <el-form-item label="时长:">
                  <el-input oninput="value=value.replace(/[^\d.]/g,'')" v-model="form.free_rent_minutes">
                    <template slot="append">分钟</template>
                  </el-input>
                </el-form-item>
              </div>

              <h4 class="pt-20">超时订单成本：</h4>
              <div class="flex flex-wrap">
                <el-form-item label="充电宝:">
                  <el-input class="flex1" oninput="value=value.replace(/[^\d.]/g,'')" v-model="form.expired_bao_cost_price">
                    <template slot="append">元</template>
                  </el-input>
                </el-form-item>
              </div>

              <h4 class="pt-20">押金范围：</h4>
              <div class="flex flex-wrap">
                <el-form-item class="mr-20" label="最低：">
                  <el-input v-model="form.limit_deposit_amount_min">
                    <template slot="append">元</template>
                  </el-input>
                </el-form-item>
                <el-form-item class="mr-20" label="最高：">
                  <el-input v-model="form.limit_deposit_amount_max">
                    <template slot="append">元</template>
                  </el-input>
                </el-form-item>
              </div>

              <h4 class="pt-20">概率押金(微信)：</h4>
              <div class="flex flex-wrap">
                <el-form-item class="mr-20" label="状态：">
                  <el-switch v-model="form.low_wxcredit_switch" :active-value="1" :inactive-value="0"/>
                </el-form-item>
                <el-form-item class="mr-20" label="概率：">
                  <el-input v-model="form.low_wxcredit_percent_bao">
                    <template slot="append">%</template>
                  </el-input>
                </el-form-item>
              </div>

              <h4 class="pt-20">概率押金(支付宝)：</h4>
              <div class="flex flex-wrap">
                <el-form-item class="mr-20" label="状态：">
                  <el-switch v-model="form.low_zfbcredit_switch" :active-value="1" :inactive-value="0"/>
                </el-form-item>
                <el-form-item class="mr-20" label="概率：">
                  <el-input v-model="form.low_zfbcredit_percent_bao">
                    <template slot="append">%</template>
                  </el-input>
                </el-form-item>
              </div>
            </template>

            <template v-if="device == 4">
              <h4 class="pt-10">默认套餐设置</h4>
              <div class="flex" v-for="item in fee_plan.wash_fee_plan">
                <el-form-item class="mr-20" label="套餐名称：">
                  <el-input v-model="item.name"></el-input>
                </el-form-item>
                <el-form-item label="套餐价：">
                  <el-input v-model="item.money">
                    <template slot="append">元</template>
                  </el-input>
                </el-form-item>
                <el-form-item label="时长：">
                  <el-input v-model="item.unit_value" :disabled="!config.custom_wash_time">
                    <template slot="append">分钟</template>
                  </el-input>
                </el-form-item>
              </div>

              <el-form-item label="洗衣液设置：" v-if="form.wash_laundry_fee_plan.length > 0">
                <div class="flex">
                  <template v-for="(item, index) in form.wash_laundry_fee_plan">
                    <el-input v-model="item.money" class="mr-5">
                      <template slot="append">元 {{ item.name }}</template>
                    </el-input>
                    <el-button :class="index + 1 == form.wash_laundry_fee_plan.length ? '' : 'mr-20'" type="primary" plain @click="item.is_show = item.is_show == 0 ? 1 : 0">{{ item.is_show == 1 ? '隐藏' : '显示' }}</el-button>
                  </template>
                </div>
              </el-form-item>
            </template>

            <template v-if="device == 1 || device == 8">
              <h4 class="pt-10">微信扫码使用时提示用支付宝扫码</h4>
              <el-form-item class="mr-20" label="状态：">
                <el-switch v-model="form.thread_wx_fund_switch" :active-value="0" :inactive-value="1"/>
                <div class="fs-s2 text-gray">注：开启表示设备是预存+先充后付模式时，用户微信扫码不可使用，提示用户用支付宝扫码使用。</div>
              </el-form-item>

              <template v-for="(item, key) in config.fee_xcx[config.goods_key[device]]">
                <h4 class="pt-10">{{ item }}默认套餐设置</h4>
                <el-form-item class="mr-20" :label="`套餐${item.value}:`" v-for="item in fee_plan[`${config.goods_key[device]}_fee_plan${key}`]">
                  <div class="flex align-start">
                    <el-select v-model="item.rent_unit_hour">
                      <el-option :label="`${time}小时`" :value="time" v-for="time in config[`${config.goods_key[device]}_time`]"></el-option>
                    </el-select>
                    <el-input v-model="item.rent_unit_fee">
                      <template slot="append">元</template>
                    </el-input>
                  </div>
                </el-form-item>
              </template>
            </template>

            <template v-if="device == 2">
              <h4 class="pt-10">默认套餐设置</h4>
              <div class="flex" v-for="item in fee_plan.zhen_fee_plan">
                <el-form-item class="mr-20" label="套餐名称：">
                  <el-input v-model="item.rent_major_title"></el-input>
                </el-form-item>
                <el-form-item class="mr-20" label="套餐价：">
                  <el-input v-model="item.rent_major_fee">
                    <template slot="append">元</template>
                  </el-input>
                </el-form-item>
                <el-form-item class="mr-20" label="按摩时长：">
                  <el-input v-model="item.rent_major_unit">
                    <template slot="append">分钟</template>
                  </el-input>
                </el-form-item>
                <el-form-item label="充电时长：">
                  <el-input v-model="item.rent_attach_unit">
                    <template slot="append">分钟</template>
                  </el-input>
                </el-form-item>
              </div>
            </template>

            <template v-if="device == 3">
              <h4 class="pt-10">默认套餐设置</h4>
              <div class="flex" v-for="(item, index) in fee_plan.zhuang_fee_plan.plan">
                <el-form-item class="mr-20" :label="`功率：`">
                  <div class="flex align-center">
                    <el-input :value="item.rent_zhuang_unit_power_min" disabled>
                      <template slot="append">W</template>
                    </el-input>
                    <span class="pl-10 pr-10">—</span>
                    <el-input v-model="item.rent_zhuang_unit_power_max" :disabled="index == 4" @input="setPowerMax(item)">
                      <template slot="append">W</template>
                    </el-input>
                  </div>
                </el-form-item>
                <el-form-item class="mr-20" label="金额：">
                  <el-input v-model="item.rent_zhuang_unit_fee">
                    <template slot="append">元/{{fee_plan.zhuang_fee_plan.rent_zhuang_unit_hour}}小时</template>
                  </el-input>
                </el-form-item>
              </div>
            </template>

            <template v-if="device == 6">
              <h4 class="pt-10">默认套餐设置</h4>
              <el-form-item class="mr-20" :label="`套餐${item.value}:`" v-for="item in fee_plan.blower_fee_plan">
                <div class="flex align-start">
                  <el-select v-model="item.rent_blower_unit_minute">
                    <el-option :label="`${time}分钟`" :value="time" v-for="time in config.blower_time"></el-option>
                  </el-select>
                  <el-input v-model="item.rent_blower_unit_fee">
                    <template slot="append">元</template>
                  </el-input>
                </div>
              </el-form-item>
            </template>

            <template v-if="device == 7">
              <el-form-item class="mr-20" label="购买免费充电：" v-if="business_mode[`std_${config.goods_key[device]}`]">
                <el-switch :active-value="1" :inactive-value="0" v-model="business_mode[`std_${config.goods_key[device]}`].order_type"/>
              </el-form-item>

              <h4 class="pt-10">默认套餐设置</h4>
              <el-form-item class="mr-20" :label="`套餐${item.value}:`" v-for="item in fee_plan.condom_fee_plan">
                <div class="flex align-start">
                  <el-select v-model="item.rent_unit_hour">
                    <el-option :label="`${time}小时`" :value="time" v-for="time in config.condom_time"></el-option>
                  </el-select>
                  <el-input v-model="item.rent_unit_fee">
                    <template slot="append">元</template>
                  </el-input>
                </div>
              </el-form-item>
            </template>

            <el-form-item>
              <el-button type="primary" @click="onSubmit(device)" :disabled="clickSubmit">立即提交</el-button>
            </el-form-item>
          </el-tab-pane>
        </template>

        <el-tab-pane label="充电桩包月会员" class="pl-30 pr-30" v-if="deviceNameObj['充电桩'] && cutDevice == -1">
          <el-form-item label="是否开启：">
            <el-switch :active-value="1" :inactive-value="0" v-model="card.member_card_switch"/>
          </el-form-item>
          <div class="flex" v-for="item in config.cardObj">
            <el-form-item :label="`${item.name}：`">
              <el-input class="mr-10" v-model="card[`${item.key}_card_fee`]">
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
            <el-form-item label="时长：">
              <el-input class="mr-10" v-model="card[`${item.key}_card_hours`]">
                <template slot="append">小时</template>
              </el-input>
            </el-form-item>
          </div>
          <el-form-item>
            <el-button type="primary" @click="postCard()" :disabled="clickSubmit">立即提交</el-button>
          </el-form-item>
        </el-tab-pane>
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
        package: [6, 22, 38, 46],
        fee_plan: {
          zhuang_fee_plan: {}
        },
        business_mode: {},
        card: {},
        form: {
          wash_laundry_fee_plan: []
        },
        form_key: {
          wash_laundry_fee_plan: '',
          free_rent_minutes: '',
          expired_bao_cost_price: '',
          limit_deposit_amount_min: '',
          limit_deposit_amount_max: '',
          expired_thread_cost_price: '',
          fund_fee_time_unit: 1,
          low_wxcredit_switch: 0,
          low_wxcredit_percent_bao: 0,
          low_zfbcredit_switch: 0,
          low_zfbcredit_percent_bao: 0,
          thread_wx_fund_switch: 0
        }
      }
    },
    computed: {
      deviceNameObj(){
        let deviceNameObj = this.$store.state.user.deviceNameObj
        return deviceNameObj
      }
    },
    mounted() {
      this.setInfo()
      this.getMemberCard()
    },
    methods: {
      /**
       * 获取信息
       */
      setInfo() {
        this.$get('agentapi/get_partner_config', {}).then(res => {
          let params = {}
          for(var i in this.form_key){
            params[i] = res[i]
          }
          params.store_fee_plan_reset = 0
          this.form = params
          let goods_key = this.config.goods_key, fee_xcx = this.config.fee_xcx, fee_plan = {}
          for(var i in goods_key){
            if(res[`default_${goods_key[i]}_limit_setting`]){
              fee_plan[ `default_${goods_key[i]}_limit_setting` ] = res[`default_${goods_key[i]}_limit_setting`]
            }
            if(res[`${goods_key[i]}_buy_goods_fee`]){
              fee_plan[ `${goods_key[i]}_buy_goods_fee` ] = res[`${goods_key[i]}_buy_goods_fee`]
            }
            let goods_key_fee = fee_xcx[goods_key[i]] || fee_xcx.default
            for(var key in goods_key_fee){
              if(res[`${goods_key[i]}_fund_fee_plan${key}`]){
                fee_plan[ `${goods_key[i]}_fund_fee_plan${key}`] = res[`${goods_key[i]}_fund_fee_plan${key}`]
              }
              if(res[`${goods_key[i]}_fee_plan${key}`]){
                fee_plan[`${goods_key[i]}_fee_plan${key}`] = res[`${goods_key[i]}_fee_plan${key}`]
              }
              if(this.SITE_INFO.fund_fee_time_unit == 1 && goods_key[i] == 'thread' && fee_plan[`${goods_key[i]}_fund_fee_plan${key}`]){
                fee_plan[`${goods_key[i]}_fund_fee_plan${key}`].fund_once_minute = parseFloat(fee_plan[`${goods_key[i]}_fund_fee_plan${key}`].fund_once_minute) / 60
                fee_plan[`${goods_key[i]}_fund_fee_plan${key}`].fund_rent_minute = parseFloat(fee_plan[`${goods_key[i]}_fund_fee_plan${key}`].fund_rent_minute) / 60
              }
            }
          }
          console.log(fee_plan)
          this.fee_plan = fee_plan
          this.business_mode = res.business_mode
        })
      },

      /**
       * 会员卡信息
       */
      getMemberCard(){
        let card = {}
        this.$get('agentapi/system/member_card_setting', {}).then(res => {
          card = res.default_memebr_card_setting.std_zhuang
          card.member_card_switch = res.member_card_switch
          this.card = card
        })
      },

      /**
       * 提交会员卡信息
       */
      postCard(){
        let params = this.card
        params.type = params.depend_type
        this.clickSubmit = true
        this.$post('agentapi/system/member_card_setting', params).then(res => {
          this.clickSubmit = false
          this.$message({
            message: '提交成功',
            type: 'success'
          })
          this.$store.dispatch('user/getPlatformConfig')
        }).catch(err=>{
          this.clickSubmit = false
        })
      },

      /**
       * 输入最大功率
       */
      setPowerMax(item){
        let n = parseInt(item.value) + 1
        this.fee_plan.zhuang_fee_plan.plan[n].rent_zhuang_unit_power_min = parseInt(item.rent_zhuang_unit_power_max) + 1
      },

      onSubmit(device) {
        let params = {}, url = '', fee_plan = this.fee_plan, goods_key = this.config.goods_key, fee_xcx = this.config.fee_xcx
        this.clickSubmit = true
          if(device == 0){
            url = 'agentapi/system/save_partner_baoing_setting'
            params = this.form
          } else if(device == 1){
            url = 'agentapi/system/save_partner_threading_setting'
            params.expired_thread_cost_price = this.form.expired_thread_cost_price
            params.store_fee_plan_reset = this.form.store_fee_plan_reset
            params.fund_fee_time_unit = this.form.fund_fee_time_unit
            params.thread_wx_fund_switch = this.form.thread_wx_fund_switch
          } else if(device == 2){
            url = 'agentapi/system/save_partner_massaging_setting'
            for(var i in fee_plan.zhen_fee_plan){
              let plan = fee_plan.zhen_fee_plan[i]
              params[`rent_major_title_${plan.value}`] = plan.rent_major_title
              params[`rent_is_show_${plan.value}`] = plan.rent_is_show
              params[`rent_major_fee_${plan.value}`] = plan.rent_major_fee
              params[`rent_major_unit_${plan.value}`] = plan.rent_major_unit
              params[`rent_attach_unit_${plan.value}`] = plan.rent_attach_unit
            }
          } else if(device == 4){
            url = 'agentapi/system/save_partner_washing_setting'
            for(var i in fee_plan.wash_fee_plan){
              let plan = fee_plan.wash_fee_plan[i]
              params[`rent_wash_unit_show_${plan.value}`] = plan.is_show
              params[`rent_wash_unit_fee_${plan.value}`] = plan.money
              params[`rent_wash_unit_minute_${plan.value}`] = plan.time
              params[`rent_wash_unit_name_${plan.value}`] = plan.name
            }
            for (var i in this.form.wash_laundry_fee_plan) {
              let laundy = this.form.wash_laundry_fee_plan[i]
              params[`rent_laundry_unit_show_${laundy.value}`] = laundy.is_show
              params[`rent_laundry_unit_fee_${laundy.value}`] = laundy.money
            }
          } else if(device == 3){
            url = 'agentapi/system/save_partner_zhuanging_setting'
            params = fee_plan.zhuang_fee_plan
            for(var i in params.plan){
              let plan = params.plan[i]
              params[`rent_zhuang_unit_fee_${plan.value}`] = plan.rent_zhuang_unit_fee
              params[`rent_zhuang_unit_power_min_${plan.value}`] = plan.rent_zhuang_unit_power_min
            }
            delete params.plan
          } else if(device == 6){
            url = 'agentapi/system/save_partner_blowing_setting'
            for(var i in fee_plan.blower_fee_plan){
              let plan = fee_plan.blower_fee_plan[i]
              params[`rent_blower_unit_minute_${plan.value}`] = plan.rent_blower_unit_minute
              params[`rent_blower_unit_fee_${plan.value}`] = plan.rent_blower_unit_fee
            }
          }else if(device == 7){
            url = 'agentapi/system/save_partner_condoming_setting'
            params.store_fee_plan_reset = this.form.store_fee_plan_reset
            for(var i in fee_plan.condom_fee_plan){
              let plan = fee_plan.condom_fee_plan[i]
              params[`condom_rent_unit_hour_${plan.value}`] = plan.rent_unit_hour
              params[`condom_rent_unit_fee_${plan.value}`] = plan.rent_unit_fee
            }
            params.expired_condom_cost_price = this.form.expired_condom_cost_price
          }else if(device == 8){
            url = 'agentapi/system/save_partner_humidifiering_setting'
          }
          let goods_key_fee = fee_xcx[goods_key[device]] || fee_xcx.default
          for(var key in goods_key_fee){
            if(fee_plan[`${goods_key[device]}_fund_fee_plan${key}`]){
              params[ `${goods_key[device]}_fund_fee_plan${key}`] = fee_plan[`${goods_key[device]}_fund_fee_plan${key}`]
            }
            if(fee_plan[`${goods_key[device]}_fee_plan${key}`]){
              params[`${goods_key[device]}_fee_plan${key}`] = fee_plan[`${goods_key[device]}_fee_plan${key}`]
            }
            if(fee_plan[`${goods_key[device]}_buy_goods_fee`]){
              params[`${goods_key[device]}_buy_goods_fee`] = fee_plan[`${goods_key[device]}_buy_goods_fee`]
            }
            if(key && this.business_mode[`std_${goods_key[device]}${key}`]){
              params[`${goods_key[device]}_business_mode${key}`] = this.business_mode[`std_${goods_key[device]}${key}`]
            }
            if(this.SITE_INFO.fund_fee_time_unit == 1 && goods_key[device] == 'thread' && fee_plan[`${goods_key[device]}_fund_fee_plan${key}`]){
              params[`${goods_key[device]}_fund_fee_plan${key}`].fund_once_minute = parseFloat(params[`${goods_key[device]}_fund_fee_plan${key}`].fund_once_minute) * 60
              params[`${goods_key[device]}_fund_fee_plan${key}`].fund_rent_minute = parseFloat(params[`${goods_key[device]}_fund_fee_plan${key}`].fund_rent_minute) * 60
            }
          }
          if(fee_plan[`default_${goods_key[device]}_limit_setting`]){
            params = Object.assign(params, fee_plan[`default_${goods_key[device]}_limit_setting`])
          }
          if(this.business_mode[`std_${this.config.goods_key[device]}`]){
            let stc = this.business_mode[`std_${this.config.goods_key[device]}`]
            params = Object.assign(stc, params)
          }
          console.log(params)
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
