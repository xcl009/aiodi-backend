<template>
  <div>
    <el-row class="pl-20 pr-20 pb-20 custom-form bg-white">
      <el-col :xs="24" :sm="22" :md="20" :lg="18">
        <el-tabs class="mb-10" v-model="userType" @tab-click="getInfo">
          <el-tab-pane :label="$t('system.agentRule')" name="agent" v-if="!userKey || userKey != 'storeId'"/>
          <el-tab-pane :label="$t('system.storeRule')" name="store" />
          <el-tab-pane :label="$t('system.userRule')" name="user" v-if="!id && !userKey"/>
        </el-tabs>

        <template v-if="checkAbility([`WD_${userType.toUpperCase()}`], 3)">
          <el-form ref="form" :model="form" label-position="left" label-width="120px">
            <el-form-item :label="$t('system.ruleAgent')" v-if="ruleAgent.id">
              <div class="flex align-center">
                {{ ruleAgent.name }}({{ ruleAgent.mobile }})
              </div>
            </el-form-item>

            <el-form-item :label="$t('steal.isItEnabled')">
              <div class="flex align-center">
                <el-switch v-model="form.enable" :active-value="1" :inactive-value="2" />
                <span class="ml-10 fs-s3">{{ $t('system.text3') }}</span>
                <el-popover placement="right" title="" width="400" trigger="hover">
                  <div>
                    <div class="mb-15 text-bold text-black">{{ $t('moeny.withdrawalMethod') }}</div>
                    {{ $t('system.text4') }}<span v-if="false">{{ $t('system.text5') }}</span>{{ $t('system.text6')
                    }}<br><br>
                    {{ $t('system.text7') }}<span v-if="false">{{ $t('system.text5') }}</span>{{ $t('system.text8')
                    }}<br><br>
                    {{ $t('system.text9') }}<br>
                  </div>
                  <el-link type="danger" slot="reference" :underline="false"
                    class="ml-10 el-icon-question fs-c1"></el-link>
                </el-popover>
              </div>
            </el-form-item>

            <el-form-item :label="$t('moeny.withdrawalMethod')">
              <el-checkbox-group v-model="sellType" @change="change">
                <el-checkbox :label="item.type" v-for="(item, key) in withdrawTypes" v-if="!item.userType || (item.userType && item.userType == userType)">{{ item.name }}</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <h4>{{ $t('moeny.withdrawableTime') }}</h4>
            <el-form-item :label="$t('market.cycle')">
              <el-radio-group v-model="form.timeLimit.type">
                <el-radio label="DAY">{{ $t('public.everyDay') }}</el-radio>
                <el-radio label="WEEK">{{ $t('public.weekly') }}</el-radio>
                <el-radio label="MONTH">{{ $t('public.monthly') }}</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item v-if="form.timeLimit.type == 'DAY'">
              <div class="flex align-center flex-wrap" v-for="(item, index) in form.timeLimit.timeLimit">
                <el-time-select v-model="item.startTime" :picker-options="{
                  start: '00:00',
                  step: '00:30',
                  end: '23:59'
                }" :placeholder="$t('public.statrtTime')">
                </el-time-select>
                <div class="ml-20 mr-20">-</div>
                <el-time-select v-model="item.endTime" :picker-options="{
                  start: '00:00',
                  step: '00:30',
                  end: '23:59',
                  minTime: item.startTime
                }" :placeholder="$t('public.endTime')">
                </el-time-select>
                <el-button type="text" size="small" :disabled="form.timeLimit.timeLimit.length == 4" v-if="index == 0"
                  @click="form.timeLimit.timeLimit.push({})" class="ml-10">{{ $t('public.add') }}</el-button>
                <el-button type="text" size="small" v-else @click="form.timeLimit.timeLimit.splice(index, 1)"
                  class="ml-10 text-danger">{{ $t('public.delete') }}</el-button>
              </div>
            </el-form-item>

            <el-form-item v-else-if="form.timeLimit.type == 'WEEK'">
              <div class="flex align-center flex-wrap" v-for="(item, index) in form.timeLimit.weeks">
                <el-select v-model="item.val" :placeholder="$t('public.pleaseSelect')">
                  <el-option v-for="(iitem, iindex) in week" :label="iitem" :value="iindex + 1">
                  </el-option>
                </el-select>
                <el-button type="text" size="small" :disabled="form.timeLimit.weeks.length == 4" v-if="index == 0"
                  @click="form.timeLimit.weeks.push({})" class="ml-10">{{ $t('public.add') }}</el-button>
                <el-button type="text" size="small" v-else @click="form.timeLimit.weeks.splice(index, 1)"
                  class="ml-10 text-danger">{{ $t('public.delete') }}</el-button>
              </div>
            </el-form-item>

            <el-form-item v-else>
              <div class="flex align-center flex-wrap" v-for="(item, index) in form.timeLimit.days">
                <el-select v-model="item.val" :placeholder="$t('public.pleaseSelect')">
                  <el-option v-for="iitem in 28" :label="iitem + $t('public.no')" :value="iitem">
                  </el-option>
                </el-select>
                <el-button type="text" size="small" :disabled="form.timeLimit.days.length == 4" v-if="index == 0"
                  @click="form.timeLimit.days.push({})" class="ml-10">{{ $t('public.add') }}</el-button>
                <el-button type="text" size="small" v-else @click="form.timeLimit.days.splice(index, 1)"
                  class="ml-10 text-danger">{{ $t('public.delete') }}</el-button>
              </div>
            </el-form-item>

            <template v-for="(item, idx) in form.supportType">
              <template v-if="item.status != 0">
                <h4 class="flex align-center">
                  <span>{{ withdrawType[item.type] ? withdrawType[item.type].name : item.type }}{{ $t('public.commission') }}</span>
                  <i class="ml-5 el-icon-top fs-b3 cursor text-primary" v-if="idx > 0"
                    @click="swapItems(form.supportType, idx, idx - 1)"></i>
                </h4>

                <!-- <el-form-item :label="$t('system.taxPoints')">
                  <div class="flex align-center flex-wrap">
                    <el-input type="number" v-model="item.taxRate" class="flex1 mr-10">
                      <template slot="append">%</template>
                    </el-input>
                    <div class="ml-30">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ $t('system.singleStroke')
                    }}</div>
                    <el-input type="number" v-model="item.handlingFee" class="flex1 ml-10 mr-10">
                      <template slot="append">{{ siteInfo.currencySymbol }}</template>
                    </el-input>
                  </div>
                </el-form-item> -->

                <el-form-item :label="$t('system.receiptTime')">
                  <div class="mb-5 flex align-center flex-wrap"
                    v-for="(ritem, rindex) in item.receipt">
                    <el-select v-model="ritem.day" :placeholder="$t('public.pleaseSelect')">
                      <el-option :label="$t('system.receiptNow')" :value="0" v-if="[2,4,5].indexOf(parseInt(item.type)) == -1"></el-option>
                      <el-option v-for="iitem in 30" :label="iitem + $t('system.receiptDay')" :value="iitem"></el-option>
                    </el-select>
                    <div class="ml-20">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ $t('public.name') }}</div>
                    <el-input v-model="ritem.name" class="flex1 ml-10 mr-10"></el-input>
                    <div class="ml-20">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ $t('system.taxPoints')}}</div>
                    <el-input type="number" v-model="ritem.taxRate" class="flex1 ml-10 mr-10">
                      <template slot="append">%</template>
                    </el-input>
                    <div class="ml-20">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ $t('system.singleStroke')}}</div>
                    <el-input type="number" v-model="ritem.handlingFee" class="flex1 ml-10 mr-10">
                      <template slot="append">{{ siteInfo.currencySymbol }}</template>
                    </el-input>
                    <el-button type="text" size="small" :disabled="item.receipt.length == 4" v-if="rindex == 0" @click="item.receipt.push({})" class="mr-10">{{ $t('public.add') }}</el-button>
                    <el-button type="text" size="small" v-else @click="item.receipt.splice(rindex, 1)" class="mr-10 text-danger">{{ $t('public.delete') }}</el-button>
                  </div>
                </el-form-item>

                <el-form-item :label="$t('system.minMoeny')">
                  <div class="flex align-center flex-wrap">
                    <el-input type="number" v-model="item.minAmount" class="flex1 mr-10">
                      <template slot="append">{{ siteInfo.currencySymbol }}</template>
                    </el-input>
                    <div class="ml-30">{{ $t('system.maxMoeny') }}</div>
                    <el-input type="number" v-model="item.maxAmount" class="flex1 ml-10 mr-10">
                      <template slot="append">{{ siteInfo.currencySymbol }}</template>
                    </el-input>
                  </div>
                </el-form-item>
                <template v-if="[1, 3, 6].indexOf(parseInt(item.type)) > -1">
                  <el-form-item :label="$t('system.needApprovalAmount')">
                    <div class="flex align-center flex-wrap">
                      <el-input type="number" v-model="item.needApprovalAmount" class="flex1 mr-10">
                        <template slot="append">{{ siteInfo.currencySymbol }}</template>
                      </el-input>
                    </div>
                  </el-form-item>
                  <el-form-item :label="$t('system.orderRefundInd')" v-if="userType == 'user'">
                    <div class="flex align-center">
                      <el-switch v-model="item.orderRefundInd" :active-value="true" :inactive-value="false" />
                      <span class="ml-10 fs-s3">{{ $t('system.orderRefundIndText') }}</span>
                    </div>
                  </el-form-item>
                  <el-form-item :label="$t('system.bindPhone')" v-if="[1].indexOf(parseInt(item.type)) > -1 && userType != 'user'">
                    <div class="flex align-center">
                      <el-switch v-model="mobileWithdraw.isAllowWithdraw" :active-value="0" :inactive-value="1" />
                      <span class="ml-10 fs-s3">{{ $t('system.bindPhoneText') }}</span>
                    </div>
                  </el-form-item>
                </template>
              </template>
            </template>

            <el-form-item class="mb-0">
              <el-button type="primary" @click="onSubmit('form')" :disabled="clickSubmit">{{ $t('public.submit')
              }}</el-button>
              <el-button type="danger" @click="del" :disabled="clickSubmit" v-if="parseInt(form.agentId) > 0 || parseInt(form.storeId) > 0">{{ $t('public.delete') }}</el-button>
            </el-form-item>
          </el-form>
        </template>
        <template v-else>
          <div class="cursor" @click="$router.push({ path: `/market/appList` })">{{ $t('public.zwPurchase') }}，<span
              class="text-primary">{{ $t('public.goBuy') }}</span></div>
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
      withdrawType: {},
      sellType: [],
      form: {
        supportType: [],
        timeLimit: {}
      },
      mobileWithdraw: {
        isAllowWithdraw: 0
      },
      userType: this.$route.query.userKey == 'storeId' ? 'store' : 'agent',
      id: this.$route.query.id || '',
      userKey: this.$route.query.userKey || '',
      ruleAgent: {}
    }
  },
  computed: {
    withdrawTypes() {
      return [
        /* {
          type: '1',
          name: this.$t('payType.wxWithdrawal')
        },
        {
          type: '2',
          name: this.$t('payType.wxCode')
        },
        {
          type: '3',
          name: this.$t('payType.zfbWithdrawal')
        },
        {
          type: '4',
          name: this.$t('payType.zfbCode')
        }, */
        {
          type: '5',
          name: this.$t('payType.card')
        },
        {
          type: '6',
          name: this.$t('payType.orderRefund'),
          userType: 'user'
        }
      ]
    },
    week() {
      return [ this.$t('public.one'), this.$t('public.two'), this.$t('public.three'), this.$t('public.four'), this.$t('public.five'), this.$t('public.six'), this.$t('public.sunday')]
    },
    siteInfo() {
      return this.$store.getters.siteInfo
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
    change(val) {
      let supportType = JSON.parse(JSON.stringify(this.form.supportType))
      supportType.map(item => {
        if (val.indexOf(item.type) > -1) {
          return item.status = 1
        } else {
          return item.status = 0
        }
      })
      let sType = this.arrayKeys(supportType, 'type')
      val.map(item => {
        if (sType.indexOf(item) == -1) {
          supportType.push(this.getSupportDefault(item))
        }
      })
      this.form.supportType = supportType
    },

    /**
     * 默认信息
     * @param {Object} type
     */
    getSupportDefault(type){
      return {
        status: 1,
        type: type,
        taxRate: 0,
        handlingFee: 0,
        minAmount: 0,
        maxAmount: 999999,
        needApprovalAmount: 0,
        orderRefundInd: false,
        receipt: [{
          day: 1,
          taxRate: 0,
          handlingFee: 0,
        }]
      }
    },

    /**
     * 获取信息
     */
    getInfo() {
      let params = {
        userType: this.userType
      }
      if(this.userKey && this.id) params[this.userKey] = this.id
      this.$get('iot-saas-basic/api/withdraw/config/v1/find', params).then((res = {}) => {
        if(res.enable){
          let days = [{val: 1}], weeks = [{val: 1}], dayas = []
          if(res.timeLimit.days && res.timeLimit.days.length > 0){
            res.timeLimit.days.map(item => {
              dayas.push({
                val: item
              })
            })
          }
          if (res.timeLimit.type == 'MONTH') {
            days = dayas
          } else if (res.timeLimit.type == 'WEEK') {
            weeks = dayas
          }
          res.supportType.map(item => {
            item.type = item.type || '5'
            if(!item.receipt){
              item.receipt = [{
                day: [2,4,5].indexOf(parseInt(item.type)) > -1 ? 1 : 0,
                name: '',
                taxRate: item.taxRate,
                handlingFee: item.handlingFee,
              }]
            }
            return item
          })
          res.timeLimit.days = days
          res.timeLimit.weeks = weeks
          console.log(weeks,'weeks')
          this.form = res
          this.sellType = this.arrayKeys(res.supportType, 'type')
          this.ruleAgent = {}
          if(parseInt(res.agentId) > 0){
            this.$get('iot-saas-basic/admin/agent/findById', {
              id: res.agentId
            }).then(res => {
              this.ruleAgent = res
            })
          }
        } else {
          this.sellType = ['5']
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
              days: [{val: 1}],
              weeks: [{val: 1}]
            },
            supportType: [
              this.getSupportDefault('5')
            ],
            days: [{ val: 1 }],
            weeks: [{ val: 1 }]
          }
        }
      })
      this.$get('iot-saas-basic/admin/settings/find', {
        code: 'BRAND_ALLOW_MOBILE_WITHDRAW'
      }).then(res => {
        if(res && res.code){
          this.mobileWithdraw = JSON.parse(res.setting)
          this.oldMobileWithdraw = JSON.parse(res.setting)
        }
      })
    },

    onSubmit() {
      let that = this;
      let url = 'iot-saas-basic/admin/withdraw/config/v1/update',
        params = JSON.parse(JSON.stringify(this.form)),
        supportType = [],
        errorText = ''
      params.supportType.map((item, idx) => {
        if (item.status != 0) {
          item.receipt.map(ritem => {
            if(!ritem.name || !(item.taxRate >= 0) || !(item.handlingFee >= 0)){
              errorText = that.$t('system.receiptRule')
            }
          })
          supportType.push(item)
        }
      })
      if(errorText){
        this.$message({
          message: errorText,
          type: 'error'
        })
        return
      }
      params.supportType = supportType
      params.userType = this.userType
      if (params.timeLimit.type == 'WEEK') {
        params.timeLimit.days = this.arrayKeys(params.timeLimit.weeks, 'val')
      } else {
        params.timeLimit.days = this.arrayKeys(params.timeLimit.days, 'val')
      }
      if(this.userKey && this.id) params[this.userKey] = this.id
      this.clickSubmit = true
      this.$post(url, params).then(res => {
        if(!this.oldMobileWithdraw || this.oldMobileWithdraw.isAllowWithdraw != this.mobileWithdraw.isAllowWithdraw){
          this.$post('iot-saas-basic/admin/settings/save', {
            code: 'BRAND_ALLOW_MOBILE_WITHDRAW',
            setting: JSON.stringify(this.mobileWithdraw)
          })
        }
        this.clickSubmit = false
        this.$message({
          message: that.$t('public.submittedSuccess'),
          type: 'success'
        })
      }).catch(err=>{
        this.clickSubmit = false
      })
    },

    del(){
      this.$alert(this.$t('system.delWdText'), this.$t('system.delWdTitle'), {
        confirmButtonText: this.$t('public.confirm'),
        center: true,
        callback: action => {
          if (action == 'confirm') {
            this.clickSubmit = true
            this.$post('iot-saas-basic/admin/withdraw/config/v1/del', {
              agentId: this.form.agentId,
              storeId: this.form.storeId,
              userType: this.userType,
            }).then(res => {
              this.clickSubmit = false
              this.$message({
                message: that.$t('public.submittedSuccess'),
                type: 'success'
              })
              this.getInfo()
            }).catch(err=>{
              this.clickSubmit = false
            })
          }
        }
      })
    }
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
