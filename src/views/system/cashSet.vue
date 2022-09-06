<template>
  <div>
    <condition ref="condition" :filterForm="false">
      <template v-slot:tabs>
        <el-tabs class="mb-15 bg-white" v-model="currencyType">
          <el-tab-pane label="代理提现设置" name="1" />
          <el-tab-pane label="商户提现设置" name="2" />
          <el-tab-pane label="用户提现设置" name="3" />
        </el-tabs>
      </template>
    </condition>

    <el-row class="p-30 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="12" :lg="10">
        <el-form ref="form" :model="form" label-position="left" label-width="120px">
          <el-form-item label="提现方式">
            <el-checkbox-group v-model="sellType" @change="change">
              <el-checkbox :label="key" v-for="(item, key) in withdrawType">{{ item }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <h4>可提现时间</h4>
          <el-form-item label="周期">
            <el-radio-group v-model="form.dayType">
              <el-radio :label="1">每天</el-radio>
              <el-radio :label="2">每周</el-radio>
              <el-radio :label="3">每月</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="">
            <div class="flex align-center flex-wrap" v-for="(item, index) in form.times">
              <template v-if="form.dayType == 1">
                <el-time-select
                  v-model="item.begin"
                  :picker-options="{
                    start: '00:00',
                    step: '00:30',
                    end: '23:59'
                  }"
                  placeholder="开始时间">
                </el-time-select>
                <div class="ml-20 mr-20">-</div>
                <el-time-select
                  v-model="item.end"
                  :picker-options="{
                    start: '00:00',
                    step: '00:30',
                    end: '23:59',
                    minTime: item.begin
                  }"
                  placeholder="结束时间">
                </el-time-select>
              </template>
              <template v-if="form.dayType == 2">
                <el-select v-model="item.week_day" placeholder="请选择">
                  <el-option
                    v-for="(iitem, iindex) in week"
                    :label="iitem"
                    :value="iindex">
                  </el-option>
                </el-select>
              </template>
              <template v-if="form.dayType == 3">
                <el-select v-model="item.month_day" placeholder="请选择">
                   <el-option
                     v-for="iitem in 28"
                     :label="iitem + '号'"
                     :value="iitem">
                   </el-option>
                </el-select>
              </template>
              <el-button type="text" size="small" :disabled="form.times.length == 4" v-if="index == 0"
                @click="form.times.push({})" class="ml-10">添加</el-button>
              <el-button type="text" size="small" v-else
                @click="form.times.splice(index, 1)" class="ml-10 text-danger">删除</el-button>
            </div>
          </el-form-item>

          <template v-for="item in form.wdType">
            <template v-if="item.status == 1">
              <h4>{{ withdrawType[item.type] }}手续费</h4>
              <el-form-item label="税点">
                <div class="flex align-center flex-wrap">
                  <el-input v-model="item.amount" class="flex1 mr-10">
                    <template slot="append">%</template>
                  </el-input>
                  <div class="ml-30">&nbsp;&nbsp;&nbsp;&nbsp;手续费</div>
                  <el-input v-model="item.giftAmount" class="flex1 ml-10 mr-10">
                    <template slot="append">元</template>
                  </el-input>
                </div>
              </el-form-item>
              <el-form-item label="最小金额">
                <div class="flex align-center flex-wrap">
                  <el-input v-model="item.amount" class="flex1 mr-10">
                    <template slot="append">元</template>
                  </el-input>
                  <div class="ml-30">最大金额</div>
                  <el-input v-model="item.giftAmount" class="flex1 ml-10 mr-10">
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
  export default {
    components: {
      condition
    },
    data() {
      return {
        clickSubmit: false,
        withdrawType: {
          1: "微信提现",
          2: "微信收款码",
          3: "支付宝提现",
          4: "支付宝收款码",
          5: "银行卡"
        },
        week: ['日', '一', '二', '三', '四', '五', '六'],
        sellType: [],
        currencyType: '1',
        form: {
          wdType: {},
          dayType: 1,
          times: [
            {}
          ]
        }
      }
    },
    mounted() {

    },
    methods: {
      /**
       * 选择提现方式
       * @param {Object} val
       */
      change(val){
        let wdType = JSON.parse(JSON.stringify(this.form.wdType))
        for(var i in wdType){
          if(val.indexOf(i) > -1){
            wdType[i].status = 1
          } else {
            wdType[i].status = 0
          }
        }
        val.map(item => {
          if(!wdType[item]){
            this.$set(wdType, item, {
              status: 1,
              type: item,
              feelType: 1
            })
          }
        })
        this.form.wdType = wdType
      },

      /**
       * 获取信息
       */
      getInfo() {
        this.$get('iot-saas-pay/api/recharge/list', {
          currencyType: this.form.currencyType
        }).then(res => {
          res = res.length > 0 ? res : [{
            amount: 100,
            giftAmount: 0
          }]
          this.form.configList = res
        })
      },

      onSubmit() {
        let url = 'iot-saas-pay/admin/recharge/update',
          params = JSON.parse(JSON.stringify(this.form))
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
