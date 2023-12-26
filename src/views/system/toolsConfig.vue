<template>
  <div>
    <div class="pl-20 pr-20 pb-5 custom-form bg-white">
      <el-tabs class="mb-10" v-model="deviceTypeCode" @tab-click="getInfo">
        <el-tab-pane :label="item" :name="name" v-for="(item, name) in myDeviceId" />
      </el-tabs>

      <template v-if="code == 'DIVIDE_ACCOUNTS' && checkAbility([`${deviceTypeCode}_DIVIDE_ACCOUNTS`], 3)">
        <h4 class="flex mb-20 mt-10">
          <div>微信分账</div>
          <div class="ml-5">
            <el-popover
              placement="top-start"
              title="温馨提示"
              width="450"
              trigger="hover">
              <div>
                切记订单的微信分账占比不可大于您商户号可分账比例，否则将不进行微信分账。<br>
                接收方类型为个人时，订单分账后将无法退款。<br>
                接收方类型为商户时，需告知该商户开启同意分账回退功能，未开启订单发生退款时金额将全部由您承担。（开启路径：访问商户平台-交易中心-分账-分账接收设置）
              </div>
              <svg-icon icon-class="doubt" slot="reference"></svg-icon>
            </el-popover>
          </div>
        </h4>
        <el-form class="custom-form" label-width="100px" label-position="left">
          <el-form-item label="小程序" v-if="wechatList.length > 1">
            <el-select v-model="form.wechatAppid" placeholder="小程序" @change="toQuery()">
              <el-option :label="item.appName" :value="item.appId" v-for="(item, key) in wechatList" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <div class="flex align-center">
              <el-switch v-model="form.enable" :active-value="1" :inactive-value="2" />
              <span class="ml-10 fs-s3">开启表示设置有效，设置后5分钟内生效</span>
            </div>
          </el-form-item>
          <el-form-item label="接收方类型">
            <el-radio-group v-model="form.divideType">
              <el-radio :label="1">商户</el-radio>
              <el-radio :label="2">个人</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="接收方名称">
            <el-input v-model="form.divideName" :placeholder="form.divideType == 1 ? '接收方主体名称' : '接收方真实姓名'"></el-input>
          </el-form-item>
          <el-form-item label="接收方账号">
            <el-input v-model="form.divideAccount" :placeholder="form.divideType == 1 ? '接收方微信商户号' : '接收方微信openid'"></el-input>
          </el-form-item>
          <el-form-item label="接收方关系">
            <el-select v-model="form.divideRelationType" placeholder="请选择">
              <el-option
                v-for="(name, val) in reType"
                :label="name"
                :value="val">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="关系名称" v-if="form.divideRelationType == 'CUSTOM'">
            <el-input v-model="form.divideCustomRelation"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit" :disabled="clickSubmit">提交</el-button>
          </el-form-item>
        </el-form>
      </template>

      <template v-else-if="code == 'DEPOSIT_PRPR' && checkAbility([`${deviceTypeCode}_DEPOSIT_PRPR`], 3)">
        <el-form ref="form" label-position="left" label-width="auto">
          <h4 class="flex mb-20 mt-10">
            <div>概率押金</div>
          </h4>

          <el-form-item label="是否开启">
            <div class="flex align-center">
              <el-switch v-model="form.enable" :active-value="1" :inactive-value="2" />
              <span class="ml-10 fs-s3">开启表示设置有效，设置后5分钟内生效</span>
            </div>
          </el-form-item>

          <div class="flex">
            <el-form-item label="每">
              <el-input type="number" v-model="form.orderNumber">
                <template slot="append">人</template>
              </el-input>
              <div>
                每{{ form.orderNumber || 0 }}人下单，{{ form.freeNumber }}人不免押，需支付押金租借
              </div>
            </el-form-item>
            <el-form-item label="押">
              <el-input type="number" v-model="form.freeNumber">
                <template slot="append">人</template>
              </el-input>
            </el-form-item>
          </div>

          <el-form-item label="时间">
            <el-input type="number" v-model="form.durationTime">
              <template slot="append">天</template>
            </el-input>
            <div v-if="form.isNewUser != 1">
              用户在下单租借{{ form.durationTime || 0 }}天后再次租借会重新计算概率
            </div>
          </el-form-item>
          
          <el-form-item label="针对新用户">
            <div class="flex align-center">
              <el-switch v-model="form.isNewUser" :active-value="1" :inactive-value="0" />
              <span class="ml-10 fs-s3">开启表示{{ form.durationTime }}天内未下过单的用户才会计算概率</span>
            </div>
          </el-form-item>

          <el-form-item label="钱包余额">
            <el-input type="number" v-model="form.walletBalance">
              <template slot="append">元</template>
            </el-input>
            <div>
              用户钱包余额大于等于{{ form.walletBalance > 0 ? form.walletBalance : 0.1 }}元时无需进行概率押金计算，直接免押租借
            </div>
          </el-form-item>

          <el-form-item class="mt-10">
            <el-button type="primary" @click="onSubmit">立即提交</el-button>
          </el-form-item>
        </el-form>
      </template>

      <template v-else>
        <div class="pb-20 cursor" @click="$router.push({path: `/market/appList`})">暂未购买此功能服务，<span class="text-primary">去购买</span></div>
      </template>
    </div>

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" :close-on-click-modal="false" width="700px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 1">

      </template>
      <div class="mt-30 text-center">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">取消</el-button>
        <el-button size="medium" type="primary" @click="dialogConfirm" :disabled="clickSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
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

        //分账关系
        reType: {
          STORE: '门店',
          STAFF: '员工',
          STORE_OWNER: '店主',
          PARTNER: '合作伙伴',
          HEADQUARTER: '总部',
          BRAND: '品牌方',
          DISTRIBUTOR: '分销商',
          USER: '用户',
          SUPPLIER: '供应商',
          CUSTOM: '自定义',
        },
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
        
        wechatAppid: '',
      }
    },
    computed: {
      myDeviceId() {
        return this.$store.getters.myDeviceId
      },
      agentInfo() {
        return this.$store.getters.agentInfo
      },
      Ability() {
        return this.$store.getters.Ability
      }
    },
    mounted() {
      this.deviceTypeCode = Object.keys(this.myDeviceId)[0]
      if(['DIVIDE_ACCOUNTS', 'DEPOSIT_PRPR'].indexOf(this.code) > -1){
        this.getInfo()
      }
      if(['DIVIDE_ACCOUNTS'].indexOf(this.code) > -1){
        this.getWechatList()
      }
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
          if(res.rows && res.rows.length > 0){
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
        if(this.code == 'DEPOSIT_PRPR'){
          url = 'iot-saas-basic/admin/probabilityDeposit/v1/find'
        }
        if(this.userKey && this.id) params[this.userKey] = this.id
        this.$get(url, params).then((res = {}) => {
          if(this.code == 'DEPOSIT_PRPR'){
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
          }else if(this.code == 'DIVIDE_ACCOUNTS'){
            if (res.enable == undefined) {
              this.form = {
                enable: 2,
                divideType: 1
              }
            } else {
              this.form = res
            }
          }else{
            this.form = res
          }
        })
      },

      /**
       * 提交保存
       */
      onSubmit() {
        let params = JSON.parse(JSON.stringify(this.form)), url = 'iot-saas-basic/admin/orderdivideWXconfig/v1/save'
        if(this.userKey && this.id) params[this.userKey] = this.id
        params.deviceTypeCode = this.deviceTypeCode
        if(this.code == 'DIVIDE_ACCOUNTS'){
          params.brandId = this.agentInfo.brandId
          params.wechatAppid = this.wechatAppid
          if(params.id){
            url = 'iot-saas-basic/admin/orderdivideWXconfig/v1/update'
          }
        }else if(this.code == 'DEPOSIT_PRPR'){
          params.durationTime = parseInt(params.durationTime) * 1440
          url = 'iot-saas-basic/admin/probabilityDeposit/v1/update'
        }
        this.$post(url, params).then(res => {
          this.$message({
            message: '设置成功',
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
            if(dialogType == 1){
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
        let curRow = this.curRow,
          curIdx = this.curIdx,
          params = JSON.parse(JSON.stringify(this.form))
        if(this.clickSubmit) return
        this.clickSubmit = true
        switch (this.dialogType) {
          case 1:
            this.$post('iot-saas-basic/admin/settings/save', {
              code: curRow.code,
              setting: JSON.stringify(params)
            }).then(res => {
              this.$message({
                message: '提交成功',
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
  /deep/ .el-tabs__item{
    height: 50px;
    line-height: 50px;
    font-size: 16px;
  }
</style>
