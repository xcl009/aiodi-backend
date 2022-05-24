<template>
  <div>
    <div class="pr-20 pb-5 custom-form bg-white">
      <el-tabs class="mb-15 fs-b2" v-model="curDevice" @tab-click="getInfo">
        <el-tab-pane :label="item" :name="code" v-for="(item, code) in deviceType" />
      </el-tabs>

      <el-form ref="form" label-width="auto">
        <h4 class="mb-20 mt-10">DD状态</h4>
        <div class="flex">
          <el-form-item label="是否开启：">
            <div class="flex align-center">
              <el-switch v-model="form.enable" :active-value="1" :inactive-value="2" />
              <span class="ml-10 fs-s3">开启表示开启DD，以下规则才会生效，DD优先顺序：比例漏单>时间扣减>扣款失败</span>
            </div>
          </el-form-item>
        </div>

        <h4 class="flex mb-20 mt-10">
          <div>比例漏单</div>
          <div class="ml-5">
            <el-popover
              placement="top-start"
              title="温馨提示"
              width="450"
              trigger="hover">
              <div>
                有效订单：订单金额大于0且未被DD的订单。<br>
                起漏金额：有效订单的订单金额须大于等于起漏金额才会漏单。<br>
                有效订单才会漏单，漏掉的订单将会隐藏且不给下级代理及商户分成。
              </div>
              <svg-icon icon-class="doubt" slot="reference"></svg-icon>
            </el-popover>
          </div>
        </h4>
        <div class="flex">
          <el-form-item label="每：">
            <el-input v-model="form.proportionRule.orderBaseNum">
              <template slot="append">单</template>
            </el-input>
          </el-form-item>
          <el-form-item label="漏：">
            <el-input v-model="form.proportionRule.loseNum">
              <template slot="append">单</template>
            </el-input>
          </el-form-item>
          <el-form-item label="起漏金额：">
            <el-input v-model="form.proportionRule.startAmount">
              <template slot="append">元</template>
            </el-input>
          </el-form-item>
        </div>

        <h4 class="flex mb-20 mt-10">
          <div>时间扣减</div>
          <div class="ml-5">
            <el-popover
              placement="top-start"
              title="温馨提示"
              width="450"
              trigger="hover">
              <div>
                有效订单：订单金额大于0且未被DD的订单。<br>
                订单真实使用时长减去扣减时间，订单金额未发生变化，则该订单不扣减时间。<br>
                订单扣减时间后，下级看到的订单完结时间=真实完结时间-扣减时间。<br>
                例：扣减时间10分钟，真实使用时长65分钟，订单计费为2元60分钟，该订单真实扣款4元。扣减10分钟后使用时长55分钟，订单金额2元，下级代理及商户按2元分成，剩余2元则按比例分给您及您的上级。
              </div>
              <svg-icon icon-class="doubt" slot="reference"></svg-icon>
            </el-popover>
          </div>
        </h4>
        <div class="flex">
          <el-form-item label="扣减时间：">
            <el-input v-model="form.minuteRule">
              <template slot="append">分钟</template>
            </el-input>
          </el-form-item>
        </div>

        <h4 class="flex mb-20 mt-10">
          <div>扣款失败</div>
          <div class="ml-5">
            <el-popover
              placement="top-start"
              title="温馨提示"
              width="450"
              trigger="hover">
              <div>
                有效订单：订单金额大于0且未被DD的订单。<br>
                起漏金额：有效订单的订单金额须大于等于起漏金额才会失败。<br>
                有效订单才会漏单，失败订单会展示为扣款失败，不给下级代理及商户分成。
              </div>
              <svg-icon icon-class="doubt" slot="reference"></svg-icon>
            </el-popover>
          </div>
        </h4>
        <div class="flex">
          <el-form-item label="每：">
            <el-input v-model="form.failRule.orderBaseNum">
              <template slot="append">单</template>
            </el-input>
          </el-form-item>
          <el-form-item label="失败：">
            <el-input v-model="form.failRule.loseNum">
              <template slot="append">单</template>
            </el-input>
          </el-form-item>
          <el-form-item label="起漏金额：">
            <el-input v-model="form.failRule.startAmount">
              <template slot="append">元</template>
            </el-input>
          </el-form-item>
        </div>

        <h4 class="flex mb-20 mt-10">
          <div>已完成订单漏单</div>
          <div class="ml-5">
            <el-popover
              placement="top-start"
              title="温馨提示"
              width="450"
              trigger="hover">
              <div>
                有效订单：订单金额大于0且未被DD的订单。<br>
                起漏金额：有效订单的订单金额须大于等于起漏金额才会漏单。<br>
                有效订单才会漏单，漏掉的订单将会隐藏且扣除下级代理及商户分成。<br>
                例：每10单漏4单、未登录时长60分钟，若60分钟内商户未登录，该时段内商户有效订单每10单漏4单，每60分钟轮回。
              </div>
              <svg-icon icon-class="doubt" slot="reference"></svg-icon>
            </el-popover>
          </div>
        </h4>
        <div class="flex">
          <el-form-item label="每：">
            <el-input v-model="form.complateRule.orderBaseNum">
              <template slot="append">单</template>
            </el-input>
          </el-form-item>
          <el-form-item label="漏：">
            <el-input v-model="form.complateRule.loseNum">
              <template slot="append">单</template>
            </el-input>
          </el-form-item>
          <el-form-item label="起漏金额：">
            <el-input v-model="form.complateRule.startAmount">
              <template slot="append">元</template>
            </el-input>
          </el-form-item>
          <el-form-item label="未登录时长：" class="ml-10">
            <el-input v-model="form.minute">
              <template slot="append">分钟</template>
            </el-input>
          </el-form-item>
        </div>

        <el-form-item class="mt-10">
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
        form: {
          proportionRule: {},
          failRule: {},
          complateRule: {}
        },
        id: this.$route.params.id || '',
        userKey: this.$route.query.userKey || '',
        curDevice: '',
        deviceType: '',
      }
    },
    computed: {
      myDeviceId() {
        return this.$store.getters.myDeviceId
      }
    },
    mounted() {
      let deviceType = this.$route.query.deviceType || ''
      if(deviceType){
        this.deviceType = JSON.parse(deviceType)
      } else {
        this.deviceType = this.myDeviceId
      }
      this.curDevice = Object.keys(this.deviceType)[0]
      this.getInfo()
    },
    methods: {
      /**
       * 获取详情
       */
      getInfo() {
        let params = {
          deviceTypeCode: this.curDevice
        }
        if(this.userKey && this.id) params[this.userKey] = this.id
        this.$get(`iot-saas-basic/admin/loseorderconfig/v1/findById`, params).then(res => {
          if (res.enable == undefined) {
            res = {
              enable: 2,
              proportionRule: {},
              failRule: {},
              complateRule: {},
              minuteRule: 0
            }
          }
          this.form = res
        })
      },

      /**
       * 提交保存
       */
      postCard() {
        let params = JSON.parse(JSON.stringify(this.form))
        if(this.userKey && this.id) params[this.userKey] = this.id
        params.deviceTypeCode = this.curDevice
        this.$post(`iot-saas-basic/admin/loseorderconfig/v1/update`, params).then(res => {
          this.$message({
            message: '设置成功',
            type: 'success'
          })
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
  .custom-form {
    padding-right: 24px;
    .el-tabs{
      padding-left: 24px;
    }
    h4{
      padding-left: 24px;
      font-size: 16px;
    }
  }
</style>
