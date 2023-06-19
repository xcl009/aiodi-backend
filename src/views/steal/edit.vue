<template>
  <div>
    <div class="pr-20 pl-20 pb-5 custom-form bg-white">
      <el-tabs class="mb-15 fs-b2" v-model="deviceTypeCode" @tab-click="getInfo">
        <el-tab-pane :label="item.name" :name="item.deviceTypeCode" v-for="(item, name) in deviceType"/>
      </el-tabs>

      <el-form ref="form" label-width="auto">
        <h4 class="mb-20 mt-10">DD状态</h4>
        <div class="flex">
          <el-form-item label="是否开启：">
            <div class="flex align-center">
              <el-switch v-model="form.enable" :active-value="1" :inactive-value="2" />
              <span class="ml-10 fs-s3">开启表示开启DD，以下规则才会生效，DD优先顺序：时间段隐藏漏单>比例漏单>时间扣减>扣款失败</span>
            </div>
          </el-form-item>
        </div>
        
        <template v-if="Ability[`${deviceTypeCode}_DD_END`]">
          <h4 class="flex mb-20 mt-10">
            <div>归还不结束</div>
            <div class="ml-5">
              <el-popover
                placement="top-start"
                title="温馨提示"
                width="450"
                trigger="hover">
                <div>
                  设置不结束规则后用户归还时将会计算不结束概率<br>
                  设置时间段表示时间段内归还的订单才会计算不结束概率，不设置不限时间
                </div>
                <svg-icon icon-class="doubt" slot="reference"></svg-icon>
              </el-popover>
            </div>
          </h4>
          <div class="flex">
            <el-form-item label="每：">
              <el-input type="number" v-model="form.notCloseRule.orderNum">
                <template slot="append">单</template>
              </el-input>
            </el-form-item>
            <el-form-item label="不结束：">
              <el-input type="number" v-model="form.notCloseRule.notCloseNum">
                <template slot="append">单</template>
              </el-input>
            </el-form-item>
            <el-form-item label="租借时长：">
              <el-input type="number" v-model="form.notCloseRule.rentTimes">
                <template slot="append">小时以上</template>
              </el-input>
            </el-form-item>
          </div>
          <div class="mb-5 pl-15 text-black">不结束时间段</div>
          <div class="flex align-start flex-wrap" v-for="(item, index) in form.notCloseRule.timeRules">
            <el-form-item class="mr-20" label="开始时间：">
              <el-time-select v-model="item.startTime" :picker-options="{
                    start: '00:00',
                    step: '00:01',
                    end: '23:59'
                  }" placeholder="开始时间">
              </el-time-select>
            </el-form-item>
            <el-form-item class="mr-20" label="结束时间：">
              <el-time-select v-model="item.endTime" :picker-options="{
                    start: '00:00',
                    step: '00:01',
                    end: '23:59',
                    minTime: item.startTime
                  }" placeholder="结束时间">
              </el-time-select>
            </el-form-item>
            <el-button class="mt-5" type="primary" size="mini" icon="el-icon-plus" v-if="form.notCloseRule.timeRules.length < 4 && index == 0"
              @click="form.notCloseRule.timeRules.push({startTime: '', endTime: ''})"></el-button>
            <el-button class="mt-5" type="danger" size="mini" icon="el-icon-minus" v-if="form.notCloseRule.timeRules.length > 1 && index > 0"
              @click="form.notCloseRule.timeRules.splice(index, 1)"></el-button>
          </div>
        </template>
        
        <template v-if="Ability[`${deviceTypeCode}_DD_HIDE`]">
          <h4 class="flex mb-20 mt-10">
            <div>时间段隐藏漏单</div>
            <div class="ml-5">
              <el-popover
                placement="top-start"
                title="温馨提示"
                width="450"
                trigger="hover">
                <div>
                  设置了时间段表示该时间段完结的订单会执行漏单，漏掉的订单将会隐藏且不给下级代理及商户分成。<br>
                </div>
                <svg-icon icon-class="doubt" slot="reference"></svg-icon>
              </el-popover>
            </div>
          </h4>
          <div class="flex align-start flex-wrap" v-for="(item, index) in form.notDisplayRule.timeRules">
            <el-form-item class="mr-20" label="开始时间：">
              <el-time-select v-model="item.startTime" :picker-options="{
                    start: '00:00',
                    step: '00:01',
                    end: '23:59'
                  }" placeholder="开始时间">
              </el-time-select>
            </el-form-item>
            <el-form-item class="mr-20" label="结束时间：">
              <el-time-select v-model="item.endTime" :picker-options="{
                    start: '00:00',
                    step: '00:01',
                    end: '23:59',
                    minTime: item.startTime
                  }" placeholder="结束时间">
              </el-time-select>
            </el-form-item>
            <el-button class="mt-5" type="primary" size="mini" icon="el-icon-plus" v-if="form.notDisplayRule.timeRules.length < 4 && index == 0"
              @click="form.notDisplayRule.timeRules.push({startTime: '', endTime: ''})"></el-button>
            <el-button class="mt-5" type="danger" size="mini" icon="el-icon-minus" v-if="form.notDisplayRule.timeRules.length > 1 && index > 0"
              @click="form.notDisplayRule.timeRules.splice(index, 1)"></el-button>
          </div>
        </template>
        
        <template v-if="Ability[`${deviceTypeCode}_DD_RATIO`]">
          <h4 class="flex mb-20 mt-10">
            <div>比例漏单</div>
            <div class="ml-5">
              <el-popover
                placement="top-start"
                title="温馨提示"
                width="450"
                trigger="hover">
                <div>
                  起漏金额：订单金额须大于等于起漏金额。<br>
                  离线后漏单：开启则表示在代理及商户停止访问系统自动离线后才开始执行漏单（代理及商户停止访问系统之前创建的订单不会参与漏单）。<br>
                  订单金额大于0且未被DD的订单才会执行漏单，漏掉的订单将会隐藏且不给下级代理及商户分成<br>
                </div>
                <svg-icon icon-class="doubt" slot="reference"></svg-icon>
              </el-popover>
            </div>
          </h4>
          <div class="flex">
            <el-form-item label="每：">
              <el-input type="number" v-model="form.complateRule.orderBaseNum">
                <template slot="append">单</template>
              </el-input>
            </el-form-item>
            <el-form-item label="漏：">
              <el-input type="number" v-model="form.complateRule.loseNum">
                <template slot="append">单</template>
              </el-input>
            </el-form-item>
            <el-form-item label="起漏金额：">
              <el-input type="number" v-model="form.complateRule.startAmount">
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
            <el-form-item label="离线后漏单：" class="ml-10">
              <el-switch v-model="form.complateRule.minute" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </div>
        </template>

        <template v-if="Ability[`${deviceTypeCode}_DD_TIME`]">
        <h4 class="flex mb-20 mt-10">
          <div>时间扣减</div>
          <div class="ml-5">
            <el-popover
              placement="top-start"
              title="温馨提示"
              width="450"
              trigger="hover">
              <div>
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
            <el-input type="number" v-model="form.minuteRule">
              <template slot="append">分钟</template>
            </el-input>
          </el-form-item>
        </div>
        </template>

        <template v-if="Ability[`${deviceTypeCode}_DD_FAIL`]">
          <h4 class="flex mb-20 mt-10">
            <div>扣款失败</div>
            <div class="ml-5">
              <el-popover
                placement="top-start"
                title="温馨提示"
                width="450"
                trigger="hover">
                <div>
                  起漏金额：订单金额须大于等于起漏金额。<br>
                  订单金额大于0且未被DD的订单才会执行漏单，漏掉的订单将会展示为扣款失败且不给下级代理及商户分成。<br>
                </div>
                <svg-icon icon-class="doubt" slot="reference"></svg-icon>
              </el-popover>
            </div>
          </h4>
          <div class="flex">
            <el-form-item label="每：">
              <el-input type="number" v-model="form.failRule.orderBaseNum">
                <template slot="append">单</template>
              </el-input>
            </el-form-item>
            <el-form-item label="失败：">
              <el-input type="number" v-model="form.failRule.loseNum">
                <template slot="append">单</template>
              </el-input>
            </el-form-item>
            <el-form-item label="起漏金额：">
              <el-input type="number" v-model="form.failRule.startAmount">
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
          </div>
        </template>

        

        <el-form-item class="mt-10">
          <el-button type="primary" @click="onSubmit">立即提交</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  import { pickKeys } from "@/utils/index"
  export default {
    name: 'steal',
    data() {
      return {
        form: {
          enable: 2,
          minuteRule: 0,
          complateRule: {},
          proportionRule: {},
          failRule: {},
          notCloseRule: {
            timeRules: [{}]
          },
          notDisplayRule: {
            timeRules: [{}],
          }
        },
        id: this.$route.query.id || '',
        userKey: this.$route.query.userKey || '',
        deviceTypeCode: '',
        deviceType: '',
      }
    },
    computed: {
      myDeviceId() {
        return this.$store.getters.myDeviceId
      },
      Ability() {
        return this.$store.getters.Ability
      }
    },
    mounted() {
      this.getDevice()
    },
    methods: {
      /**
       * 获取设备
       */
      getDevice() {
        let params = {}
        if(this.userKey && this.id) params[this.userKey] = this.id
        this.$get(`iot-saas-basic/admin/queryDeviceType`, params).then(res => {
          let deviceType = [], deviceTypeCode = ''
          res.map(item => {
            if(!item.fatherCode && (this.Ability[`${item.deviceTypeCode}_DD_RATIO`] || this.Ability[`${item.deviceTypeCode}_DD_TIME`] || this.Ability[`${item.deviceTypeCode}_DD_FAIL`])){
              deviceType.push(item)
              deviceTypeCode = deviceTypeCode || item.deviceTypeCode
            }
          })
          this.deviceType = deviceType
          this.deviceTypeCode = deviceTypeCode
          this.getInfo()
        })
      },

      /**
       * 获取详情
       */
      getInfo() {
        let params = {
          deviceTypeCode: this.deviceTypeCode
        }
        if(this.userKey && this.id) params[this.userKey] = this.id
        this.$get(`iot-saas-basic/admin/loseorderconfig/v1/findById`, params).then((res = {}) => {
          if (res.enable == undefined) {
            res = {}
          }
          if(res.notCloseRule && !res.notCloseRule.timeRules){
            res.notCloseRule.timeRules = [{}]
          }
          if(res.notDisplayRule && !res.notDisplayRule.timeRules){
            res.notDisplayRule.timeRules = [{}]
          }
          this.form = Object.assign(this.form, res)
        })
      },

      /**
       * 提交保存
       */
      onSubmit() {
        let params = JSON.parse(JSON.stringify(this.form))
        if(this.userKey && this.id) params[this.userKey] = this.id
        params.deviceTypeCode = this.deviceTypeCode
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
</style>
