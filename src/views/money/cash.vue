<template>
  <div>
    <el-row class="pt-20 pb-10 pl-20 pr-20 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="16" :lg="12" :xl="8">
        <el-form ref="form" :model="form" label-position="left" label-width="120px">
          <el-form-item label="可提现金额">
            <div class="text-primary fs-b1">{{ money.balance || 0.00 }}</div>
          </el-form-item>
          <el-form-item label="提现金额">
            <el-input type="number" v-model="form.amount" placeholder="请输入提现金额" />
          </el-form-item>
          <el-form-item label="提现方式">
            <el-radio-group v-model="form.withdrawType">
              <el-radio-button :label="item.val" v-for="(item, index) in withdrawType">{{ item.name }}</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="到账账户" v-show="form.withdrawType == 3">
            <div class="flex align-center" v-if="bindAlipayInfo.alipayOpenid">
              <el-avatar size="medium" :src="bindAlipayInfo.avatar"></el-avatar>
              <div class="ml-10">{{ bindAlipayInfo.nickname }}</div>
            </div>
            <div class="flex align-center" v-else>您暂未绑定支付宝，请先进入小程序提现页面绑定支付宝</div>
          </el-form-item>
          <el-form-item label="到账账户" v-show="form.withdrawType == 1">
            <div class="flex align-center" v-if="bindWechatInfo.wechatOpenid">
              <el-avatar size="medium" :src="bindWechatInfo.avatar"></el-avatar>
              <div class="ml-10">{{ bindWechatInfo.nickname }}</div>
            </div>
            <div class="flex align-center" v-else>您暂未绑定微信，请先进入小程序提现页面绑定微信</div>
          </el-form-item>
          <div v-show="form.withdrawType == 5">
            <el-form-item label="姓名">
              <el-input v-model="bindCardInfo.cardName" placeholder="您的姓名" />
            </el-form-item>
            <el-form-item label="银行卡号">
              <el-input v-model="bindCardInfo.cardNo" placeholder="银行卡号" />
            </el-form-item>
            <el-form-item label="开户行">
              <el-input v-model="bindCardInfo.bankName" placeholder="开户行" />
            </el-form-item>
            <el-form-item label="所属支行">
              <el-input v-model="bindCardInfo.branchName" placeholder="所属支行" />
            </el-form-item>
          </div>
          <div v-show="form.withdrawType == 2">
            <el-form-item label="姓名">
              <el-input v-model="wxQrcodeInfo.userName" placeholder="您的姓名" />
            </el-form-item>
            <el-form-item label="收款码">
              <upload v-model="wxQrcodeInfo.qrcode" :upObj="{fileType: 'paymentCode'}"></upload>
            </el-form-item>
          </div>
          <div v-show="form.withdrawType == 4">
            <el-form-item label="姓名">
              <el-input v-model="aliQrcodeInfo.userName" placeholder="您的姓名" />
            </el-form-item>
            <el-form-item label="收款码">
              <upload v-model="aliQrcodeInfo.qrcode" :upObj="{fileType: 'paymentCode'}"></upload>
            </el-form-item>
          </div>
          <el-form-item label="可提现时间" v-if="timeLimit.type">
            <div class="flex" v-if="timeLimit.type == 'DAY'">
              <div v-for="(item, idx) in timeLimit.timeLimit">每天{{ item.startTime }}-{{ item.endTime }}<span class="ml-10 mr-10" v-if="idx < timeLimit.timeLimit.length - 1">|</span></div>
            </div>
            <div class="flex" v-else>
              <div v-for="(item, idx) in timeLimit.days">
                <span v-if="timeLimit.type == 'MONTH'">每月{{ item }}号<span class="ml-10 mr-10" v-if="idx < timeLimit.days.length - 1">|</span></span>
                <span v-else>每周{{ week[item] }}<span class="ml-10 mr-10" v-if="idx < timeLimit.days.length - 1">|</span></span>
              </div>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit" :disabled="clickSubmit || timeLimit.type">提交</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import upload from '@/components/upload/'
  import { unixTime } from '@/utils/index'
  export default {
    components: {
      upload
    },
    data() {
      return {
        clickSubmit: false,
        form: {
          sourceType: 3,
          withdrawType: 1
        },
        withdrawType: [],
        timeLimit: {},
        money: {},
        bindWechatInfo: {},
        bindAlipayInfo: {},
        bindCardInfo: {},
        aliQrcodeInfo: {},
        wxQrcodeInfo: {},

        week: ['', '一', '二', '三', '四', '五', '六', '日'],
        cutStoreId: ''
      }
    },
    computed: {
      siteInfo() {
        let siteInfo = this.$store.getters.siteInfo
        return siteInfo
      },
      agentInfo() {
        return this.$store.getters.agentInfo
      }
    },
    mounted() {
      if(this.isStore()){
				this.cutStoreId = this.agentInfo.storeIds[0]
      }
      this.getCashType()
      this.getBalance()
    },
    methods: {
      /**
       * 获取提现配置
       */
      getCashType(){
        this.$get('iot-saas-basic/api/withdraw/config/v1/find', {
          userType: this.agentInfo.userType
        }).then((res = {}) => {
          let withdrawType = []
          if(res.enable){
          	res.supportType.map(item => {
          		withdrawType.push({
                name: this.siteInfo.withdrawType[item.type],
                val: item.type
              })
          	})
          	let isCash = false
          	switch(res.timeLimit.type){
          		case 'DAY':
          		let timeLimit = res.timeLimit.timeLimit, cutDay = this.parseTime(this.currentTime(), '{y}-{m}-{d}')
          		for(var i in timeLimit){
          			if(unixTime(`${cutDay} ${timeLimit[i].startTime}`) < this.currentTime() && unixTime(`${cutDay} ${timeLimit[i].endTime}`) > this.currentTime()){
          				isCash = true
          				break
          			}
          		}
          		break
          	}
            if(!isCash){
              this.timeLimit = res.timeLimit
            }
          } else {
            withdrawType = [
              {
                name: '微信收款码',
                val: '2'
              },
              {
                name: '支付宝收款码',
                val: '4'
              }
            ]
          }
          this.form.withdrawType = withdrawType[0].val
          this.withdrawType = withdrawType
          let types = this.arrayKeys(withdrawType, 'val')
          if(types.indexOf('2') > -1 || types.indexOf('4') > -1){
          	this.qrcodeInfo()
          }
          if(types.indexOf('5') > -1){
          	this.cardInfo()
          }
          if(types.indexOf('1') > -1){
          	this.wechatInfo()
          }
          if(types.indexOf('3') > -1){
          	this.alipayInfo()
          }
        })
      },

      /**
       * 获取可提现金额
       */
      getBalance(){
        let params = {}
        if(this.cutStoreId) params.storeId = this.cutStoreId
        this.$get('iot-saas-pay/api/pay/withdraw/balance', params).then(res => {
          this.money = res || {}
        })
      },

      /**
       * 绑定的微信信息
       */
      wechatInfo(){
        this.$get('iot-saas-pay/api/pay/withdraw/wechatAppInfo').then(res => {
          this.bindWechatInfo = res || {}
        })
      },

      /**
       * 绑定的支付宝信息
       */
      alipayInfo(){
        this.$get('iot-saas-pay/api/pay/withdraw/alipayAppInfo').then(res => {
          this.bindAlipayInfo = res || {}
        })
      },

      /**
       * 绑定的银行卡
       */
      cardInfo(){
        this.$get('iot-saas-pay/api/pay/withdraw/bankcard').then(res => {
          if(res) res.cardName = res.userName
          this.bindCardInfo = res || {}
        })
      },

      /**
       * 绑定的收款码
       */
      qrcodeInfo(){
        this.$get('iot-saas-pay/api/pay/withdraw/qrcode', {
          qrcodeType: 2
        }).then(res => {
          this.aliQrcodeInfo = res || {}
        })

        this.$get('iot-saas-pay/api/pay/withdraw/qrcode', {
          qrcodeType: 1
        }).then(res => {
          this.wxQrcodeInfo = res || {}
        })
      },

      /**
       * 获取我的商户
       */
      getMyStore(){
      	let url = 'iot-saas-basic/admin/store/findMyStore'
      	this.$get(url).then(res => {
      		this.cutStoreId = Object.values(res)[0].id
          this.getBalance()
      	})
      },

      /**
       * 提交数据
       */
      onSubmit() {
        let params = JSON.parse(JSON.stringify(this.form))
        if(!params.amount){
          this.$message.error('请输入提现金额')
          return
        }
        else if (parseFloat(params.amount) > parseFloat(this.money.balance)){
          this.$message.error('余额不足')
          return
        }
        if(params.withdrawType == 2){
          params = Object.assign(params, this.wxQrcodeInfo)
        }else if(params.withdrawType == 4){
          params = Object.assign(params, this.aliQrcodeInfo)
        }
        if(this.cutStoreId) params.storeId = this.cutStoreId
        this.clickSubmit = true
        this.$post('iot-saas-pay/api/pay/withdraw/apply', params).then(res => {
          this.$message({
            message: '操作成功',
            type: 'success'
          })
          this.$router.push({ path: '/money/cashRecord' });
          this.clickSubmit = false
        }).catch(err => {
          this.clickSubmit = false
        })
      }
    }
  }
</script>

<style scoped>
  .line {
    text-align: center;
  }
</style>
