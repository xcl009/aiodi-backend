<template>
  <div>
    <div class="pr-20 pl-20 pb-5 custom-form bg-white">
      <el-tabs class="mb-15 fs-b2" v-model="deviceTypeCode" @tab-click="getInfo">
        <el-tab-pane :label="item.name" :name="item.deviceTypeCode" v-for="(item, name) in deviceType" />
      </el-tabs>

      <el-form ref="form" label-width="auto">
        <template v-if="Ability[`${deviceTypeCode}_DD_END`]">
          <h4 class="flex mb-20 mt-10">
            <div>{{ $t('steal.delayedReturn') }}</div>
            <div class="ml-5">
              <el-popover placement="top-start" :title="$t('public.tips')" width="450" trigger="hover">
                <div>
                  {{ $t('steal.text') }}<br>
                  {{ $t('steal.text1') }}<br>
                </div>
                <svg-icon icon-class="doubt" slot="reference"></svg-icon>
              </el-popover>
            </div>
          </h4>
          <div class="flex">
            <el-form-item :label="`${$t('public.every')}：`">
              <el-input type="number" v-model="form.notCloseRule.orderNum">
                <template slot="append">{{ $t('public.one') }}</template>
              </el-input>
            </el-form-item>
            <el-form-item :label="`${$t('steal.delayed')}：`">
              <el-input type="number" v-model="form.notCloseRule.notCloseNum">
                <template slot="append">{{ $t('public.one') }}</template>
              </el-input>
            </el-form-item>
            <el-form-item :label="`${$t('steal.delayed')}：`">
              <el-input type="number" v-model="form.notCloseRule.rentTimes">
                <template slot="append">{{ $t('steal.returnInMinutes') }}</template>
              </el-input>
            </el-form-item>
          </div>
          <div class="mb-5 pl-15 text-black">{{ $t('steal.delayTimePeriod') }}</div>
          <div class="flex align-start flex-wrap" v-for="(item, index) in form.notCloseRule.timeRules">
            <el-form-item class="mr-20" :label="`${$t('public.statrtTime')}：`">
              <el-time-select v-model="item.startTime" :picker-options="{
                start: '00:00',
                step: '00:01',
                end: '23:59'
              }" :placeholder="$t('public.statrtTime')">
              </el-time-select>
            </el-form-item>
            <el-form-item class="mr-20" :label="`${$t('public.endTime')}：`">
              <el-time-select v-model="item.endTime" :picker-options="{
                start: '00:00',
                step: '00:01',
                end: '23:59',
                minTime: item.startTime
              }" :placeholder="$t('public.endTime')">
              </el-time-select>
            </el-form-item>
            <el-button class="mt-5" type="primary" size="mini" icon="el-icon-plus"
              v-if="form.notCloseRule.timeRules.length < 4 && index == 0"
              @click="form.notCloseRule.timeRules.push({ startTime: '', endTime: '' })"></el-button>
            <el-button class="mt-5" type="danger" size="mini" icon="el-icon-minus"
              v-if="form.notCloseRule.timeRules.length > 1 && index > 0"
              @click="form.notCloseRule.timeRules.splice(index, 1)"></el-button>
          </div>
          <div class="flex">
            <el-form-item :label="`${$t('steal.deductionDelay')}：`">
              <el-input type="number" v-model="form.notCloseRule.delayTimes">
                <template slot="append">{{ $t('public.minute') }}</template>
              </el-input>
              <div>{{ $t('steal.text2') }}{{ form.notCloseRule.delayTimes || 0 }}{{ $t('steal.text3') }}<br>{{
                $t('steal.text4') }}<br></div>
            </el-form-item>
          </div>
        </template>

        <h4 class="mb-20 mt-10">{{ $t('steal.ddStatus') }}</h4>
        <div class="flex">
          <el-form-item :label="`${$t('steal.isItEnabled')}：`">
            <div class="flex align-center">
              <el-switch v-model="form.enable" :active-value="1" :inactive-value="2" />
              <span class="ml-10 fs-s3">{{ $t('steal.isItEnabledText') }}<span
                  v-if="Ability[`${deviceTypeCode}_DD_HIDE`]">{{ $t('steal.hideMissingOrders') }}></span><span
                  v-if="Ability[`${deviceTypeCode}_DD_RATIO`]">{{ $t('steal.proportionalOmission') }}></span><span
                  v-if="Ability[`${deviceTypeCode}_DD_TIMELIMIT`]">{{ $t('steal.splitTimeLimit') }}></span><span
                  v-if="Ability[`${deviceTypeCode}_DD_TIME`]">{{ $t('steal.timeDeduction') }}></span><span
                  v-if="Ability[`${deviceTypeCode}_DD_FAIL`]">{{ $t('steal.noDepositToBePaid') }}</span></span>
            </div>
          </el-form-item>
        </div>

        <template v-if="Ability[`${deviceTypeCode}_DD_HIDE`]">
          <h4 class="flex mb-20 mt-10">
            <div>{{ $t('steal.hideMissingOrders') }}</div>
            <div class="ml-5">
              <el-popover placement="top-start" :title="$t('public.tips')" width="450" trigger="hover">
                <div>
                  {{ $t('steal.text5') }}<br>
                </div>
                <svg-icon icon-class="doubt" slot="reference"></svg-icon>
              </el-popover>
            </div>
          </h4>
          <div class="flex align-start flex-wrap" v-for="(item, index) in form.notDisplayRule.timeRules">
            <el-form-item class="mr-20" :label="`${$t('public.statrtTime')}：`">
              <el-time-select v-model="item.startTime" :picker-options="{
                start: '00:00',
                step: '00:01',
                end: '23:59'
              }" :placeholder="$t('public.statrtTime')">
              </el-time-select>
            </el-form-item>
            <el-form-item class="mr-20" :label="`${$t('public.endTime')}：`">
              <el-time-select v-model="item.endTime" :picker-options="{
                start: '00:00',
                step: '00:01',
                end: '23:59',
                minTime: item.startTime
              }" :placeholder="$t('public.endTime')">
              </el-time-select>
            </el-form-item>
            <el-button class="mt-5" type="primary" size="mini" icon="el-icon-plus"
              v-if="form.notDisplayRule.timeRules.length < 4 && index == 0"
              @click="form.notDisplayRule.timeRules.push({ startTime: '', endTime: '' })"></el-button>
            <el-button class="mt-5" type="danger" size="mini" icon="el-icon-minus"
              v-if="form.notDisplayRule.timeRules.length > 1 && index > 0"
              @click="form.notDisplayRule.timeRules.splice(index, 1)"></el-button>
          </div>
        </template>

        <template v-if="Ability[`${deviceTypeCode}_DD_RATIO`]">
          <h4 class="flex mb-20 mt-10">
            <div>{{ $t('steal.proportionalOmission') }}</div>
            <div class="ml-5">
              <el-popover placement="top-start" :title="$t('public.tips')" width="450" trigger="hover">
                <div>
                  {{ $t('steal.text6') }}<br>
                  {{ $t('steal.text7') }}<br>
                  {{ $t('steal.text8') }}<br>
                </div>
                <svg-icon icon-class="doubt" slot="reference"></svg-icon>
              </el-popover>
            </div>
          </h4>
          <div class="flex">
            <el-form-item :label="`${$t('public.every')}：`">
              <el-input type="number" v-model="form.complateRule.orderBaseNum">
                <template slot="append">{{ $t('public.one') }}</template>
              </el-input>
            </el-form-item>
            <el-form-item :label="`${$t('steal.leak')}：`">
              <el-input type="number" v-model="form.complateRule.loseNum">
                <template slot="append">{{ $t('public.one') }}</template>
              </el-input>
            </el-form-item>
            <el-form-item :label="`${$t('steal.leakageAmount')}：`">
              <el-input type="number" v-model="form.complateRule.startAmount">
                <template slot="append">{{ $t('public.element') }}</template>
              </el-input>
            </el-form-item>
            <el-form-item :label="`${$t('steal.afterOffline')}：`" class="ml-10">
              <el-switch v-model="form.complateRule.minute" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </div>
        </template>

        <template v-if="Ability[`${deviceTypeCode}_DD_TIMELIMIT`]">
          <h4 class="flex mb-20 mt-10">
            <div>{{ $t('steal.splitTimeLimit') }}</div>
            <div class="ml-5">
              <el-popover placement="top-start" :title="$t('public.tips')" width="450" trigger="hover">
                <div>
                  {{ $t('steal.text9') }}<br>
                  {{ $t('steal.text10') }}
                </div>
                <svg-icon icon-class="doubt" slot="reference"></svg-icon>
              </el-popover>
            </div>
          </h4>
          <div class="flex">
            <el-form-item :label="`${$t('steal.times')}：`">
              <el-input type="number" v-model="form.minuteLimitRule">
                <template slot="append">{{ $t('public.minute') }}</template>
              </el-input>
            </el-form-item>
          </div>
        </template>

        <template v-if="Ability[`${deviceTypeCode}_DD_TIME`]">
          <h4 class="flex mb-20 mt-10">
            <div>{{ $t('steal.timeDeduction') }}</div>
            <div class="ml-5">
              <el-popover placement="top-start" :title="$t('public.tips')" width="450" trigger="hover">
                <div>
                  {{ $t('steal.text11') }}<br>
                  {{ $t('steal.text12') }}<br>
                  {{ $t('steal.text13') }}<br>
                  {{ $t('steal.text14') }}
                </div>
                <svg-icon icon-class="doubt" slot="reference"></svg-icon>
              </el-popover>
            </div>
          </h4>
          <div class="flex">
            <el-form-item :label="`${$t('steal.deductionTime')}：`">
              <el-input type="number" v-model="form.minuteRule">
                <template slot="append">{{ $t('public.minute') }}</template>
              </el-input>
            </el-form-item>
            <el-form-item :label="`${$t('steal.leakageTime')}：`">
              <el-input type="number" v-model="form.loseMinute">
                <template slot="append">{{ $t('public.minute') }}</template>
              </el-input>
            </el-form-item>
          </div>
        </template>

        <template v-if="Ability[`${deviceTypeCode}_DD_FAIL`]">
          <h4 class="flex mb-20 mt-10">
            <div>{{ $t('steal.noDepositToBePaid') }}</div>
            <div class="ml-5">
              <el-popover placement="top-start" :title="$t('public.tips')" width="450" trigger="hover">
                <div>
                  {{ $t('steal.text15') }}<br>
                  {{ $t('steal.text16') }}<br>
                </div>
                <svg-icon icon-class="doubt" slot="reference"></svg-icon>
              </el-popover>
            </div>
          </h4>
          <div class="flex">
            <el-form-item :label="`${$t('public.every')}：`">
              <el-input type="number" v-model="form.failRule.orderBaseNum">
                <template slot="append">{{ $t('public.one') }}</template>
              </el-input>
            </el-form-item>
            <el-form-item :label="`${$t('public.fail')}：`">
              <el-input type="number" v-model="form.failRule.loseNum">
                <template slot="append">{{ $t('public.one') }}</template>
              </el-input>
            </el-form-item>
            <el-form-item :label="`${$t('steal.leakageAmount')}：`">
              <el-input type="number" v-model="form.failRule.startAmount">
                <template slot="append">{{ $t('public.element') }}</template>
              </el-input>
            </el-form-item>
          </div>
        </template>

        <el-form-item class="mt-10">
          <el-button type="primary" @click="onSubmit">{{ $t('public.submitNow') }}</el-button>
          <el-button type="info" @click="delRule" v-if="form.storeId > 0 || form.agentId > 0">删除</el-button>
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
        loseMinute: 0,
        minuteLimitRule: 0,
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
      if (this.userKey && this.id) params[this.userKey] = this.id
      this.$get(`iot-saas-basic/admin/queryDeviceType`, params).then(res => {
        let deviceType = [], deviceTypeCode = ''
        res.map(item => {
          if (!item.fatherCode && (this.checkAbility([`${item.deviceTypeCode}_DD_END`, `${item.deviceTypeCode}_DD_HIDE`, `${item.deviceTypeCode}_DD_RATIO`, `${item.deviceTypeCode}_DD_TIME`, `${item.deviceTypeCode}_DD_FAIL`], 3))) {
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
      if (this.userKey && this.id) params[this.userKey] = this.id
      this.$get(`iot-saas-basic/admin/loseorderconfig/v1/findById`, params).then((res = {}) => {
        if (res.enable == undefined) {
          res = {}
        }
        if (res.notCloseRule && !res.notCloseRule.timeRules) {
          res.notCloseRule.timeRules = [{}]
        }
        if (res.notDisplayRule && !res.notDisplayRule.timeRules) {
          res.notDisplayRule.timeRules = [{}]
        }
        this.form = Object.assign(this.form, res)
      })
    },

    /**
     * 提交保存
     */
    onSubmit() {
      let that = this;
      let params = JSON.parse(JSON.stringify(this.form))
      if (params.notCloseRule.delayTimes > 0 && params.notCloseRule.delayTimes < 6) {
        this.$message({
          message: that.$t('steal.message'),
          type: 'error'
        })
        return
      }
      if (this.userKey && this.id) params[this.userKey] = this.id
      params.deviceTypeCode = this.deviceTypeCode
      this.$post(`iot-saas-basic/admin/loseorderconfig/v1/update`, params).then(res => {
        this.$message({
          message: that.$t('public.setSuccess'),
          type: 'success'
        })
      })
    },

    /**
     * 删除DD规则
     */
    delRule() {
      this.$alert(this.$t('steal.delText'), this.$t('steal.delTitle'), {
        confirmButtonText: this.$t('public.confirm'),
        center: true,
        callback: action => {
          if (action == 'confirm') {
            this.$post('iot-saas-basic/admin/loseorderconfig/v1/delete', {
              deviceTypeCode: this.deviceTypeCode,
              agentId: this.form.agentId,
              storeId: this.form.storeId
            }).then(res => {
              this.$message({
                message: this.$t('public.setSuccess'),
                type: 'success'
              })
              this.$router.back()
            })
          }
        }
      })
    },
  }
}
</script>

<style scoped lang="scss">
/deep/ .el-tabs__item {
  height: 50px;
  line-height: 50px;
  font-size: 16px;
}
</style>
