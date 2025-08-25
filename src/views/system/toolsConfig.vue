<template>
  <div>
    <div class="pl-20 pr-20 pb-5 custom-form bg-white">
      <el-tabs class="mb-10" v-model="deviceTypeCode" @tab-click="getInfo">
        <el-tab-pane :label="item" :name="name" v-for="(item, name) in myDeviceId" />
      </el-tabs>

      <template v-if="code == 'DIVIDE_ACCOUNTS' && checkAbility([`${deviceTypeCode}_DIVIDE_ACCOUNTS`], 3)">
        <h4 class="flex mb-20 mt-10">
          <div>{{ $t('public.weChatAccountSplitting') }}</div>
          <div class="ml-5">
            <el-popover placement="top-start" :title="$t('public.tips')" width="450" trigger="hover">
              <div>
                {{ $t('system.text') }}<br>
                {{ $t('system.text1') }}<br>
                {{ $t('system.text2') }}
              </div>
              <svg-icon icon-class="doubt" slot="reference"></svg-icon>
            </el-popover>
          </div>
        </h4>
        <el-form class="custom-form" label-width="100px" label-position="left">
          <el-form-item :label="$t('public.applet')" v-if="wechatList.length > 1">
            <el-select v-model="form.wechatAppid" :placeholder="$t('public.applet')" @change="toQuery()">
              <el-option :label="item.appName" :value="item.appId" v-for="(item, key) in wechatList" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('public.status')">
            <div class="flex align-center">
              <el-switch v-model="form.enable" :active-value="1" :inactive-value="2" />
              <span class="ml-10 fs-s3">{{ $t('system.text3') }}</span>
            </div>
          </el-form-item>
          <el-form-item :label="$t('system.receiverType')">
            <el-radio-group v-model="form.divideType">
              <el-radio :label="1">{{ $t('public.store') }}</el-radio>
              <el-radio :label="2">{{ $t('system.thatPerson') }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="$t('system.recipientName')">
            <el-input v-model="form.divideName"
              :placeholder="form.divideType == 1 ? $t('system.recipientEntityName') : $t('system.recipientRealName')"></el-input>
          </el-form-item>
          <el-form-item :label="$t('system.receiverAccount')">
            <el-input v-model="form.divideAccount"
              :placeholder="form.divideType == 1 ? $t('system.receiverStoreId') : $t('system.receiverOpenId')"></el-input>
            <div class="mt-10 line-six fs-s3" v-if="form.divideType == 2">{{ $t('system.getOpenId') }}</div>
          </el-form-item>
          <el-form-item :label="$t('system.receiverRelationship')">
            <el-select v-model="form.divideRelationType" :placeholder="$t('public.pleaseSelect')">
              <el-option v-for="(name, val) in reType" :label="name" :value="val">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('system.relationshipName')" v-if="form.divideRelationType == 'CUSTOM'">
            <el-input v-model="form.divideCustomRelation"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit" :disabled="clickSubmit">{{ $t('public.submit') }}</el-button>
          </el-form-item>
        </el-form>
      </template>

      <template v-else-if="code == 'DEPOSIT_PRPR' && checkAbility([`${deviceTypeCode}_DEPOSIT_PRPR`], 3)">
        <el-form ref="form" label-position="left" label-width="auto">
          <h4 class="flex mb-20 mt-10">
            <div>{{ $t('public.probabilityDeposit') }}</div>
          </h4>

          <el-form-item :label="$t('steal.isItEnabled')">
            <div class="flex align-center">
              <el-switch v-model="form.enable" :active-value="1" :inactive-value="2" />
              <span class="ml-10 fs-s3">{{ $t('system.text3') }}</span>
            </div>
          </el-form-item>

          <div class="flex">
            <el-form-item :label="$t('public.every')">
              <el-input type="number" v-model="form.orderNumber">
                <template slot="append">{{ $t('public.people') }}</template>
              </el-input>
              <div>
                {{ $t('public.every') }}{{ form.orderNumber || 0 }}{{ $t('system.peopleplaceOrders') }}，{{ form.freeNumber
                }}{{ $t('system.forRenting') }}
              </div>
            </el-form-item>
            <el-form-item :label="$t('public.giveAsSecurity')">
              <el-input type="number" v-model="form.freeNumber">
                <template slot="append">{{ $t('public.people') }}</template>
              </el-input>
            </el-form-item>
          </div>

          <el-form-item :label="$t('public.time')">
            <el-input type="number" v-model="form.durationTime">
              <template slot="append">{{ $t('public.day') }}</template>
            </el-input>
            <div v-if="form.isNewUser != 1">
              {{ $t('system.orderForLeasing') }}{{ form.durationTime || 0 }}{{ $t('system.calculateProbability') }}
            </div>
          </el-form-item>

          <el-form-item :label="$t('public.targetingNewUsers')">
            <div class="flex align-center">
              <el-switch v-model="form.isNewUser" :active-value="1" :inactive-value="0" />
              <span class="ml-10 fs-s3">{{ $t('system.openRepresentation') }}{{ form.durationTime }}{{
                $t('system.noOrderPlaced') }}</span>
            </div>
          </el-form-item>

          <el-form-item :label="$t('public.walletBalance')">
            <el-input type="number" v-model="form.walletBalance">
              <template :slot="currencySymbolpositionType ? 'prepend':'append'">{{ siteInfo.currencySymbol }}</template>
            </el-input>
            <div>
              {{ $t('system.userMoney') }}{{ form.walletBalance > 0 ? form.walletBalance : 0.1 }}{{
                $t('system.freeOfChargeLease') }}
            </div>
          </el-form-item>

          <el-form-item class="mt-10">
            <el-button type="primary" @click="onSubmit">{{ $t('public.submitNow') }}</el-button>
          </el-form-item>
        </el-form>
      </template>

      <template v-else>
        <div class="pb-20 cursor">{{ $t('public.zwPurchase') }}</div>
      </template>
    </div>

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" :close-on-click-modal="false"
      width="700px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 1">

      </template>
      <div class="mt-30 text-center">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">{{ $t('public.cancel') }}</el-button>
        <el-button size="medium" type="primary" @click="dialogConfirm" :disabled="clickSubmit">{{ $t('public.confirm')
        }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  currencySymbolposition
} from '@/utils/index'
export default {
  name: 'toolsConfig',
  data() {
    return {
      clickSubmit: false,
      id: this.$route.query.id || '',
      userKey: this.$route.query.userKey || '',
      code: this.$route.query.code || '',
      deviceTypeCode: '',
      form: {},
      wechatList: [],

      // 弹出相关
      dialogType: 1,
      dialogStatus: false,
      dialogTitle: {
        1: ''
      },
      curRow: {},
      curIdx: 0,
      dform: {},
      currencySymbolpositionType:false
    }
  },
  computed: {
    siteInfo() {
      return this.$store.getters.siteInfo
    },
    myDeviceId() {
      return this.$store.getters.myDeviceId
    },
    agentInfo() {
      return this.$store.getters.agentInfo
    },
    Ability() {
      return this.$store.getters.Ability
    },
    //分账关系
    reType() {
      return {
        STORE: this.$t('reType.STORE'),
        STAFF: this.$t('reType.STAFF'),
        STORE_OWNER: this.$t('reType.STORE_OWNER'),
        PARTNER: this.$t('reType.PARTNER'),
        HEADQUARTER: this.$t('reType.HEADQUARTER'),
        BRAND: this.$t('reType.BRAND'),
        DISTRIBUTOR: this.$t('reType.DISTRIBUTOR'),
        USER: this.$t('reType.USER'),
        SUPPLIER: this.$t('reType.SUPPLIER'),
        CUSTOM: this.$t('reType.CUSTOM'),
      }
    }
  },
  mounted() {
    this.deviceTypeCode = Object.keys(this.myDeviceId)[0]
    if (['DIVIDE_ACCOUNTS', 'DEPOSIT_PRPR'].indexOf(this.code) > -1) {
      this.getInfo()
    }
    if (['DIVIDE_ACCOUNTS'].indexOf(this.code) > -1) {
      this.getWechatList()
    }
    this.currencySymbolpositionType =  currencySymbolposition();
  },
  methods: {
    /**
     * 获取列表
     */
    getWechatList() {
      this.$get('iot-saas-pay/admin/pay/config/wechat/list', {
        page: 0,
        size: 20
      }).then((res = {}) => {
        if (res.rows && res.rows.length > 0) {
          this.wechatList = res.rows || []
          this.wechatAppid = res.rows[res.rows.length - 1].appId
          this.toQuery(1)
        }
      })
    },

    /**
     * 获取详情
     */
    getInfo() {
      let url = 'iot-saas-basic/admin/orderdivideWXconfig/v1/findByStoryIdOrAgentId'
      let params = {
        deviceTypeCode: this.deviceTypeCode
      }
      if (this.code == 'DEPOSIT_PRPR') {
        url = 'iot-saas-basic/admin/probabilityDeposit/v1/find'
      }
      if (this.userKey && this.id) params[this.userKey] = this.id
      this.$get(url, params).then((res = {}) => {
        if (this.code == 'DEPOSIT_PRPR') {
          if (res.enable == undefined) {
            this.form = {
              enable: 2,
              durationTime: 7,
              walletBalance: 90,
              orderNumber: 0,
              freeNumber: 0,
              isNewUser: 0
            }
          } else {
            res.durationTime = parseInt(res.durationTime) / 1440
            this.form = res
          }
        } else if (this.code == 'DIVIDE_ACCOUNTS') {
          if (res.enable == undefined) {
            this.form = {
              enable: 2,
              divideType: 1
            }
          } else {
            this.form = res
          }
        } else {
          this.form = res
        }
      })
    },

    /**
     * 提交保存
     */
    onSubmit() {
      let that = this;
      let params = JSON.parse(JSON.stringify(this.form)), url = 'iot-saas-basic/admin/orderdivideWXconfig/v1/save'
      if (this.userKey && this.id) params[this.userKey] = this.id
      params.deviceTypeCode = this.deviceTypeCode
      if(this.code == 'DIVIDE_ACCOUNTS'){
        params.brandId = this.agentInfo.brandId
        params.wechatAppid = this.wechatAppid
        if(params.id){
          url = 'iot-saas-basic/admin/orderdivideWXconfig/v1/update'
        }
      } else if (this.code == 'DEPOSIT_PRPR') {
        params.durationTime = parseInt(params.durationTime) * 1440
        url = 'iot-saas-basic/admin/probabilityDeposit/v1/update'
      }
      this.$post(url, params).then(res => {
        this.$message({
          message: that.$t('public.setSuccess'),
          type: 'success'
        })
      })
    },

    /**
     * 操作数据
     * @param {Object} type 1 dialog类型
     * @param {Object} row 选择当前数据
     * @param {Object} dialogType dialog内容显示类型 1: '编辑分账接收方'
     * @param {Object} idx 当前数据所在位置
     */
    setRows(type, row, dialogType, idx) {
      switch (type) {
        case 1:
          this.dialogType = dialogType
          this.curRow = row
          this.curIdx = idx
          if (dialogType == 1) {
            // this.$get('iot-saas-basic/admin/settings/find', {
            //   code: row.code
            // }).then(res => {
            //   if(res && res.code){
            //     this.form = JSON.parse(res.setting)
            //   } else {
            //     this.form = {
            //       wx_phone: 0,
            //       ali_phone: 0
            //     }
            //   }
            // })
          } else {
            this.form = {}
          }
          this.dialogStatus = true
          break
      }
    },

    /**
     * 弹窗确认
     */
    dialogConfirm() {
      let that = this;
      let curRow = this.curRow,
        curIdx = this.curIdx,
        params = JSON.parse(JSON.stringify(this.form))
      if (this.clickSubmit) return
      this.clickSubmit = true
      switch (this.dialogType) {
        case 1:
          this.$post('iot-saas-basic/admin/settings/save', {
            code: curRow.code,
            setting: JSON.stringify(params)
          }).then(res => {
            this.$message({
              message: that.$t('public.submittedSuccess'),
              type: 'success'
            })
            this.dialogStatus = false
            this.clickSubmit = false
          }).catch(err => {
            this.clickSubmit = false
          })
          break
      }
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
