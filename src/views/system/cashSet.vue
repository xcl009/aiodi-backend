<template>
  <div>
    <el-row class="pl-20 pr-20 pb-20 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="12" :lg="10">
        <el-tabs class="mb-10" v-model="userType" @tab-click="getInfo">
          <el-tab-pane label="代理提现规则" name="agent" />
          <el-tab-pane label="商户提现规则" name="store" />
          <el-tab-pane label="用户提现规则" name="user" />
        </el-tabs>

        <template v-if="checkAbility([`WD_${userType.toUpperCase()}`], 3)">
          <el-form ref="form" :model="form" label-position="left" label-width="120px">
            <el-form-item label="是否开启">
              <div class="flex align-center">
                <el-switch v-model="form.enable" :active-value="1" :inactive-value="2" />
                <span class="ml-10 fs-s3">开启表示设置有效，设置后5分钟内生效</span>
                <el-popover
                  placement="right"
                  title=""
                  width="400"
                  trigger="hover">
                  <div>
                    <div class="mb-15 text-bold text-black">提现方式</div>
                    1、微信提现需要<span v-if="false">开启采用订单退款模式或</span>您的微信支付商户账号已开通商家转账到零钱功能，需审核金额表示低于该金额的提现会自动到账<br><br>
                    2、支付宝提现需要<span v-if="false">开启采用订单退款模式或</span>您的支付宝企业账户已开通转账到支付宝个人账户功能，需审核金额表示低于该金额的提现会自动到账<br><br>
                    3、其他方式均需要您手动转账后在系统通过即可<br>
                  </div>
                  <el-link type="danger" slot="reference" :underline="false" class="ml-10 el-icon-question fs-c1"></el-link>
                </el-popover>
              </div>
            </el-form-item>

            <el-form-item label="提现方式">
              <el-checkbox-group v-model="sellType" @change="change">
                <el-checkbox :label="item.type" v-for="(item, key) in withdrawTypes">{{ item.name }}</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <h4>可提现时间</h4>
            <el-form-item label="周期">
              <el-radio-group v-model="form.timeLimit.type">
                <el-radio label="DAY">每天</el-radio>
                <el-radio label="WEEK">每周</el-radio>
                <el-radio label="MONTH">每月</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item v-if="form.timeLimit.type == 'DAY'">
              <div class="flex align-center flex-wrap" v-for="(item, index) in form.timeLimit.timeLimit">
                <el-time-select
                  v-model="item.startTime"
                  :picker-options="{
                    start: '00:00',
                    step: '00:30',
                    end: '23:59'
                  }"
                  placeholder="开始时间">
                </el-time-select>
                <div class="ml-20 mr-20">-</div>
                <el-time-select
                  v-model="item.endTime"
                  :picker-options="{
                    start: '00:00',
                    step: '00:30',
                    end: '23:59',
                    minTime: item.startTime
                  }"
                  placeholder="结束时间">
                </el-time-select>
                <el-button type="text" size="small" :disabled="form.timeLimit.timeLimit.length == 4" v-if="index == 0"
                  @click="form.timeLimit.timeLimit.push({})" class="ml-10">添加</el-button>
                <el-button type="text" size="small" v-else
                  @click="form.timeLimit.timeLimit.splice(index, 1)" class="ml-10 text-danger">删除</el-button>
              </div>
            </el-form-item>

            <el-form-item v-else-if="form.timeLimit.type == 'WEEK'">
              <div class="flex align-center flex-wrap" v-for="(item, index) in form.timeLimit.weeks">
                <el-select v-model="item.val" placeholder="请选择">
                  <el-option
                    v-for="(iitem, iindex) in week"
                    :label="iitem"
                    :value="iindex + 1">
                  </el-option>
                </el-select>
                <el-button type="text" size="small" :disabled="form.timeLimit.weeks.length == 4" v-if="index == 0"
                  @click="form.timeLimit.weeks.push({})" class="ml-10">添加</el-button>
                <el-button type="text" size="small" v-else
                  @click="form.timeLimit.weeks.splice(index, 1)" class="ml-10 text-danger">删除</el-button>
              </div>
            </el-form-item>

            <el-form-item v-else>
              <div class="flex align-center flex-wrap" v-for="(item, index) in form.timeLimit.days">
                <el-select v-model="item.val" placeholder="请选择">
                   <el-option
                     v-for="iitem in 28"
                     :label="iitem + '号'"
                     :value="iitem">
                   </el-option>
                </el-select>
                <el-button type="text" size="small" :disabled="form.timeLimit.days.length == 4" v-if="index == 0"
                  @click="form.timeLimit.days.push({})" class="ml-10">添加</el-button>
                <el-button type="text" size="small" v-else
                  @click="form.timeLimit.days.splice(index, 1)" class="ml-10 text-danger">删除</el-button>
              </div>
            </el-form-item>

            <template v-for="(item, idx) in form.supportType">
              <template v-if="item.status != 0">
                <h4 class="flex align-center">
                  <span>{{ withdrawType[item.type].name }}手续费</span>
                  <i class="ml-5 el-icon-top fs-b3 cursor text-primary" v-if="idx > 0" @click="swapItems(form.supportType, idx, idx - 1)"></i>
                </h4>
                <el-form-item label="税点">
                  <div class="flex align-center flex-wrap">
                    <el-input type="number" v-model="item.taxRate" class="flex1 mr-10">
                      <template slot="append">%</template>
                    </el-input>
                    <div class="ml-30">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;单笔</div>
                    <el-input type="number" v-model="item.handlingFee" class="flex1 ml-10 mr-10">
                      <template slot="append">元</template>
                    </el-input>
                  </div>
                </el-form-item>
                <el-form-item label="最小金额">
                  <div class="flex align-center flex-wrap">
                    <el-input type="number" v-model="item.minAmount" class="flex1 mr-10">
                      <template slot="append">元</template>
                    </el-input>
                    <div class="ml-30">最大金额</div>
                    <el-input type="number" v-model="item.maxAmount" class="flex1 ml-10 mr-10">
                      <template slot="append">元</template>
                    </el-input>
                  </div>
                </el-form-item>
                <template v-if="[1,3].indexOf(parseInt(item.type)) > -1">
                <el-form-item label="需审核金额" >
                  <div class="flex align-center flex-wrap">
                    <el-input type="number" v-model="item.needApprovalAmount" class="flex1 mr-10">
                      <template slot="append">元</template>
                    </el-input>
                  </div>
                </el-form-item>
                <el-form-item label="采用订单退款" v-if="userType == 'user' && [1,3].indexOf(parseInt(item.type)) > -1">
                  <div class="flex align-center">
                    <el-switch v-model="item.orderRefundInd" :active-value="true" :inactive-value="false" />
                    <span class="ml-10 fs-s3">开启表示用户从钱包提现，以订单退款的方式给用户返还提现金额</span>
                  </div>
                </el-form-item>
                </template>
              </template>
            </template>

            <el-form-item class="mb-0">
              <el-button type="primary" @click="onSubmit('form')" :disabled="clickSubmit">提交</el-button>
            </el-form-item>
          </el-form>
        </template>
        <template v-else>
          <div class="cursor" @click="$router.push({path: `/market/appList`})">暂未购买此功能服务，<span class="text-primary">去购买</span></div>
        </template>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import { arrayToObj, swapItems } from '@/utils/index'
  export default {
    components: {

    },
    data() {
      return {
        swapItems: swapItems,
        clickSubmit: false,
        withdrawTypes: [
          {
            type: '1',
            name: '微信提现'
          },
          {
            type: '2',
            name: '微信收款码'
          },
          {
            type: '3',
            name: '支付宝提现'
          },
          {
            type: '4',
            name: '支付宝收款码'
          },
          {
            type: '5',
            name: '银行卡'
          }
        ],
        withdrawType: {},
        week: ['一', '二', '三', '四', '五', '六', '日'],
        sellType: [],
        userType: 'agent',
        form: {
          supportType: [],
          timeLimit: {}
        }
      }
    },
    mounted() {
      this.withdrawType = arrayToObj(this.withdrawTypes, 'type')
      this.getInfo()
    },
    methods: {
      /**
       * 选择提现方式
       * @param {Object} val
       */
      change(val){
        let supportType = JSON.parse(JSON.stringify(this.form.supportType))
        supportType.map(item => {
          if(val.indexOf(item.type) > -1){
            return item.status = 1
          } else {
            return item.status = 0
          }
        })
        let sType = this.arrayKeys(supportType, 'type')
        val.map(item => {
          if(sType.indexOf(item) == -1){
            supportType.push({
              status: 1,
              type: item,
              taxRate: 0,
              handlingFee: 0,
              minAmount: 0,
              maxAmount: 999999,
              needApprovalAmount: 0,
              orderRefundInd: false
            })
          }
        })
        this.form.supportType = supportType
      },

      /**
       * 获取信息
       */
      getInfo() {
        this.$get('iot-saas-basic/api/withdraw/config/v1/find', {
          userType: this.userType
        }).then((res = {}) => {
          if(res.enable){
            let days = [{val: 1}], weeks = [{val: 1}]
            if(res.timeLimit.days && res.timeLimit.days.length > 0){
              let dayas = []
              res.timeLimit.days.map(item => {
                dayas.push({
                  val: item
                })
              })
              if(res.timeLimit.type == 'MONTH'){
                days = dayas
              } else if(res.timeLimit.type == 'WEEK'){
                weeks = dayas
              }
            }
            res.timeLimit.days = days
            res.timeLimit.weeks = weeks
            this.form = res
            this.sellType = this.arrayKeys(res.supportType, 'type')
          } else {
            this.sellType = ['2', '4']
            this.form = {
              enable: 2,
              timeLimit: {
                type: 'DAY',
                timeLimit: [
                  {
                    startTime: '00:00',
                    endTime: '23:59'
                  }
                ],
                days: [{val: 1}]
              },
              supportType: [
                {
                  status: 1,
                  type: 2,
                  taxRate: 0,
                  handlingFee: 0,
                  minAmount: 0,
                  maxAmount: 999999,
                  needApprovalAmount: 0,
                  orderRefundInd: false
                },
                {
                  status: 1,
                  type: 4,
                  taxRate: 0,
                  handlingFee: 0,
                  minAmount: 0,
                  maxAmount: 999999,
                  needApprovalAmount: 0,
                  orderRefundInd: false
                }
              ]
            }
          }
        })
      },

      onSubmit() {
        let url = 'iot-saas-basic/admin/withdraw/config/v1/update',
          params = JSON.parse(JSON.stringify(this.form)),
          supportType = []
        params.supportType.map((item, idx) => {
          if(item.status != 0){
            supportType.push(item)
          }
        })
        params.supportType = supportType
        params.userType = this.userType
        if(params.timeLimit.type == 'WEEK'){
          params.timeLimit.days = this.arrayKeys(params.timeLimit.weeks, 'val')
        }else{
          params.timeLimit.days = this.arrayKeys(params.timeLimit.days, 'val')
        }
        this.clickSubmit = true
        this.$post(url, params).then(res => {
          this.clickSubmit = false
          this.$message({
            message: '提交成功',
            type: 'success'
          })
        }).catch(err=>{
          this.clickSubmit = false
        })
      }
    }
  }
</script>

<style scoped lang="scss">
  /deep/ .el-tabs__item{
    height: 50px;
    line-height: 50px;
    font-size: 16px;
  }
</style>
