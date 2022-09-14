<template>
  <div>
    <condition ref="condition" :filterForm="false">
      <template v-slot:tabs>
        <el-tabs class="mb-15 bg-white" v-model="userType">
          <el-tab-pane label="代理提现设置" name="agent" />
          <el-tab-pane label="商户提现设置" name="store" />
          <el-tab-pane label="用户提现设置" name="user" />
        </el-tabs>
      </template>
    </condition>

    <el-row class="p-30 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="12" :lg="10">
        <el-form ref="form" :model="form" label-position="left" label-width="120px">
          <el-form-item label="是否开启">
            <div class="flex align-center">
              <el-switch v-model="form.enable" :active-value="1" :inactive-value="2" />
              <span class="ml-10 fs-s3">开启表示设置有效，设置后5分钟内生效</span>
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

          <el-form-item>
            <div class="flex align-center flex-wrap" v-for="(item, index) in form.timeLimit.timeLimit">
              <template v-if="form.timeLimit.type == 'DAY'">
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
              </template>
              <template v-if="form.timeLimit.type == 'WEEK'">
                <el-select v-model="item.week_day" placeholder="请选择">
                  <el-option
                    v-for="(iitem, iindex) in week"
                    :label="iitem"
                    :value="iindex">
                  </el-option>
                </el-select>
              </template>
              <template v-if="form.timeLimit.type == 'MONTH'">
                <el-select v-model="item.month_day" placeholder="请选择">
                   <el-option
                     v-for="iitem in 28"
                     :label="iitem + '号'"
                     :value="iitem">
                   </el-option>
                </el-select>
              </template>
              <el-button type="text" size="small" :disabled="form.timeLimit.timeLimit.length == 4" v-if="index == 0"
                @click="form.timeLimit.timeLimit.push({})" class="ml-10">添加</el-button>
              <el-button type="text" size="small" v-else
                @click="form.timeLimit.timeLimit.splice(index, 1)" class="ml-10 text-danger">删除</el-button>
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
                  <el-input v-model="item.taxRate" class="flex1 mr-10">
                    <template slot="append">%</template>
                  </el-input>
                  <div class="ml-30">&nbsp;&nbsp;&nbsp;&nbsp;手续费</div>
                  <el-input v-model="item.handlingFee" class="flex1 ml-10 mr-10">
                    <template slot="append">元</template>
                  </el-input>
                </div>
              </el-form-item>
              <el-form-item label="最小金额">
                <div class="flex align-center flex-wrap">
                  <el-input v-model="item.minAmount" class="flex1 mr-10">
                    <template slot="append">元</template>
                  </el-input>
                  <div class="ml-30">最大金额</div>
                  <el-input v-model="item.maxAmount" class="flex1 ml-10 mr-10">
                    <template slot="append">元</template>
                  </el-input>
                </div>
              </el-form-item>
            </template>
          </template>

          <el-form-item class="mb-0">
            <el-button type="primary" @click="onSubmit('form')" :disabled="clickSubmit">提交</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import condition from '@/components/condition/'
  import draggable from "vuedraggable"
  import { arrayToObj, swapItems } from '@/utils/index'
  export default {
    components: {
      condition,
      draggable
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
        week: ['日', '一', '二', '三', '四', '五', '六'],
        sellType: [],
        userType: 'agent',
        form: {
          supportType: [],
          timeLimit: {
            timeLimit: []
          }
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
              maxAmount: 999999
            })
          }
        })
        console.log(supportType)
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
            this.form = res
            this.sellType = this.arrayKeys(res.supportType, 'type')
            console.log(this.sellType)
          } else {
            this.sellType = [2, 4]
            this.form = {
              enable: 2,
              timeLimit: {
                type: 'DAY',
                timeLimit: [
                  {
                    startTime: '00:00',
                    endTime: '23:59'
                  }
                ]
              },
              supportType: [
                {
                  status: 1,
                  type: 2,
                  taxRate: 0,
                  handlingFee: 0,
                  minAmount: 0,
                  maxAmount: 999999
                },
                {
                  status: 1,
                  type: 4,
                  taxRate: 0,
                  handlingFee: 0,
                  minAmount: 0,
                  maxAmount: 999999
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

<style scoped>

</style>
