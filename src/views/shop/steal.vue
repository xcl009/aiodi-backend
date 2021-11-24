<template>
  <div class="p-10">
    <div class="p-20 bg-white">
      <el-form ref="form" label-width="100px">
        <h4 class="mb-10 mt-0">DD状态</h4>
        <div class="flex">
          <el-form-item label="是否开启：">
            <el-switch v-model="form.new_steal_switch" :active-value="1" :inactive-value="0" />
            <span class="ml-5 fs-s3">开启表示开启DD，以下规则才会生效，DD优先顺序：比例漏单>时间扣减>扣款失败</span>
          </el-form-item>
        </div>

        <h4 class="mb-10 mt-0">比例漏单及扣款失败</h4>
        <div class="flex">
          <el-form-item label="订单基数：">
            <el-input v-model="form.missed_cycle_orders">
              <template slot="append">单</template>
            </el-input>
          </el-form-item>
        </div>

        <h4 class="mb-10 mt-0">比例漏单</h4>
        <div class="flex">
          <el-form-item label="漏单概率：">
            <el-input v-model="form.missed_rate">
              <template slot="append">%</template>
            </el-input>
          </el-form-item>
          <el-form-item label="起漏金额：">
            <el-input v-model="form.missed_min_money">
              <template slot="append">元</template>
            </el-input>
          </el-form-item>
          <el-popover
            placement="top-start"
            title="温馨提示"
            width="450"
            trigger="hover">
            <div>
              有效订单：订单金额大于0且未被DD的订单。<br>
              起漏金额：有效订单的订单金额须大于等于起漏金额才会漏单。<br>
              漏掉的订单将会隐藏且不给下级代理及商户分成。<br>
              例：订单基数10单，概率40%，商户有效订单每10单漏4单。
            </div>
            <i class="mt-10 ml-20 el-icon-question text-blue" slot="reference"></i>
          </el-popover>
        </div>

        <h4 class="mb-10 mt-0">时间扣减</h4>
        <div class="flex">
          <el-form-item label="扣减时间：">
            <el-input v-model="form.short_minute">
              <template slot="append">分钟</template>
            </el-input>
          </el-form-item>
          <el-popover
            placement="top-start"
            title="温馨提示"
            width="480"
            trigger="hover">
            <div>
              有效订单：订单金额大于0且未被DD的订单。<br>
              订单真实使用时长减去扣减时间，订单金额未发生变化，则该订单不扣减时间。<br>
              订单扣减时间后，下级看到的订单完结时间=真实完结时间-扣减时间。<br>
              例：扣减时间10分钟，真实使用时长65分钟，订单计费为2元60分钟，该订单真实扣款4元。扣减10分钟后使用时长55分钟，订单金额2元，下级代理及商户按2元分成，剩余2元则按比例分给您及您的上级。
            </div>
            <i class="mt-10 ml-20 el-icon-question text-blue" slot="reference"></i>
          </el-popover>
        </div>

        <h4 class="mb-10 mt-0">扣款失败</h4>
        <div class="flex">
          <el-form-item label="失败概率：">
            <el-input v-model="form.show_fail_rate">
              <template slot="append">%</template>
            </el-input>
          </el-form-item>
          <el-form-item label="起漏金额：">
            <el-input v-model="form.show_fail_min_money">
              <template slot="append">元</template>
            </el-input>
          </el-form-item>
          <el-popover
            placement="top-start"
            title="温馨提示"
            width="450"
            trigger="hover">
            <div>
              有效订单：订单金额大于0且未被DD的订单。<br>
              起漏金额：有效订单的订单金额须大于等于起漏金额才会失败。<br>
              失败订单会展示为扣款失败，不给下级代理及商户分成。<br>
              例：订单基数10单，概率40%，商户有效订单每10单失败4单。
            </div>
            <i class="mt-10 ml-20 el-icon-question text-blue" slot="reference"></i>
          </el-popover>
        </div>

        <h4 class="mb-10 mt-0">已完成订单漏单</h4>
        <div class="flex">
          <el-form-item label="漏单基数：">
            <el-input v-model="form.missed_nologin_cycle_orders">
              <template slot="append">单</template>
            </el-input>
          </el-form-item>
          <el-form-item label="漏单概率：">
            <el-input v-model="form.missed_nologin_rate">
              <template slot="append">%</template>
            </el-input>
          </el-form-item>
          <el-form-item label="起漏金额：">
            <el-input v-model="form.missed_nologin_min_money">
              <template slot="append">元</template>
            </el-input>
          </el-form-item>
          <el-form-item label="未登录时长：" class="ml-10">
            <el-input v-model="form.missed_nologin_hours">
              <template slot="append">小时</template>
            </el-input>
          </el-form-item>
          <el-popover
            placement="top-start"
            title="温馨提示"
            width="450"
            trigger="hover">
            <div>
              有效订单：订单金额大于0且未被DD的订单。<br>
              起漏金额：有效订单的订单金额须大于等于起漏金额才会漏单。<br>
              漏掉的订单将会隐藏且扣除下级代理及商户分成。<br>
              例：基数10单，概率40%，未登录时间6小时，若6小时内商户未登录，该时段内商户有效订单每10单漏4单，每6小时轮回。
            </div>
            <i class="mt-10 ml-20 el-icon-question text-blue" slot="reference"></i>
          </el-popover>
        </div>


        <template v-if="type == 1 && checkRoles(['partner'])">
          <h4 class="mb-10 mt-0">隐藏订单</h4>
          <el-form-item label="是否开启：">
            <el-switch v-model="form.steal_switch" :active-value="1" :inactive-value="0" />
            <span class="ml-5 fs-s3">开启表示以下设置时间段内的订单不显示</span>
          </el-form-item>
          <el-form-item label="禁止结束：">
            <el-switch v-model="form.user_forbidden_finish" :active-value="1" :inactive-value="0" />
            <span class="ml-5 fs-s3">开启表示以下设置时间段内的充电宝订单归还不会自动结束</span>
          </el-form-item>
          <div class="flex align-start flex-wrap" v-for="(item, index) in form.plan">
            <el-form-item class="mr-20" label="开始时间：">
              <el-time-select v-model="item.begin" :picker-options="{
                    start: '00:00',
                    step: '00:01',
                    end: '23:59'
                  }" placeholder="开始时间">
              </el-time-select>
            </el-form-item>
            <el-form-item class="mr-20" label="结束时间：">
              <el-time-select v-model="item.end" :picker-options="{
                    start: '00:00',
                    step: '00:01',
                    end: '23:59',
                    minTime: item.begin
                  }" placeholder="结束时间">
              </el-time-select>
            </el-form-item>
            <el-button type="primary" icon="el-icon-plus" v-if="form.plan.length < config.steal_time_length && index == 0"
              @click="form.plan.push({start: '', end: ''})"></el-button>
            <el-button type="danger" icon="el-icon-minus" v-if="form.plan.length > 1 && index > 0"
              @click="form.plan.splice(index, 1)"></el-button>
          </div>
        </template>


        <el-form-item>
          <el-button type="primary" @click="postCard()">立即提交</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'pricing',
    data() {
      return {
        form: {},
        id: this.$route.params.id || '',
        type: this.$route.query.type || 1,
      }
    },
    mounted() {
      this.getInfo()
    },
    methods: {
      /**
       * 获取info
       */
      getInfo() {
        let url = 'agentapi/business/store_order_hidding', params = {}
        if(this.type == 2){
          url = 'agentapi/business/agent_order_hidding'
          params.son_id = this.id
        } else {
          params.store_id = this.id
        }
        this.$get(url, params).then(res => {
          if (res.new_steal_switch == undefined) {
            res = {
              user_forbidden_finish: 0,
              steal_switch: 0,
              plan: [{
                begin: '00:00',
                end: '00:01'
              }],
              short_minute: 0,
              missed_rate: 0,
              missed_min_money: 0,
              show_fail_rate: 0,
              show_fail_min_money: 0,
              missed_cycle_orders: 0,
              missed_nologin_rate: 0,
              missed_nologin_min_money: 0,
              missed_nologin_hours: 0,
              missed_nologin_cycle_orders: 0,
              new_steal_switch: 0			  
            }
          }
          this.form = res
        })
      },

      /**
       * 提交会员卡信息
       */
      postCard() {
        let url = 'agentapi/business/store_order_hidding', params = JSON.parse(JSON.stringify(this.form))
        if(this.type == 2){
          url = 'agentapi/business/agent_order_hidding'
          params.son_id = this.id
        } else {
          params.store_id = this.id
        }
        this.$post(url, params).then(res => {
          this.$message({
            message: '提交成功',
            type: 'success'
          })
        })
      }
    }
  }
</script>

<style scoped>
  /deep/ .el-input__inner, .el-date-editor.el-input{
    width: 120px;
  }
</style>
