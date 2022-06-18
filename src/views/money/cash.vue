<template>
  <div>
    <el-row class="pt-20 pb-10 pl-20 pr-20 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="16" :lg="12" :xl="8">
        <el-form ref="form" :model="form" label-position="left" label-width="120px">
          <el-form-item label="可提现金额">
            <div class="text-primary fs-b1">{{ money.balance || 0.00 }}</div>
          </el-form-item>
          <el-form-item label="提现金额">
            <el-input v-model="form.amount" placeholder="请输入提现金额" />
          </el-form-item>
          <!-- <el-form-item label="冻结金额：">
            <span class="mr-20">{{ money }}</span>
            <el-link type="primary" @click="freezVisible = true">什么是冻结金额？</el-link>
          </el-form-item> -->
          <el-form-item label="提现方式">
            <el-radio-group v-model="form.withdrawType">
              <el-radio-button :label="index" v-for="(item, index) in siteInfo.withdrawType">{{ item }}</el-radio-button>
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
          <el-form-item>
            <el-button type="primary" @click="onSubmit" :disabled="clickSubmit">提交</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>

    <el-dialog
      title="冻结金额"
      :visible.sync="freezVisible">
      <span>
        <div class="mb-10">
          <span class="text-primary">什么是冻结金额？</span><br>
          冻结金额为您当前收益中不可提现部分金额，冻结金额为您实际收益的一部分，由于产品规则或其他原因使这部分金额无法提现进行其他操作。
        </div>
        <div class="mb-10">
          <span class="text-primary">冻结金额怎么产生的？</span><br>
          冻结金额为你上级代理商，在设置您的收益时,所设置的冻结金额数量。一般情况设置冻结金额是由于您还有部分货款未
          支付，或其他原因使您上级代理需要设置您起始部分收益需要冻结。
        </div>
        <div class="mb-10">
          <span class="text-primary">冻结金额如何解冻？</span><br>
           冻结金额解冻需要，您的上级代理修改您的冻结金额值，设置成功后，你通过提现功能就能够提现您那部分。
        </div>
        <div class="mb-10">
          <span class="text-primary">冻结金额资金安全吗？</span><br>
冻结金额部分资金会保留在平台账户上，您上级代理无法获取或修改您的冻结部分资金。
        </div>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="freezVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="可提现时间"
      width="400px"
      :center="true"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :visible.sync="noWithdraw">
      <div class="pt-15 text-center">
        <div class="pb-15 mb-15 flex l-b" v-for="item in withdraw_plan.plan">
          <div class="flex1">
            {{ plan_date[withdraw_plan.date_type] }}<span v-if="withdraw_plan.date_type == 1">{{ week[item.week_day] }}</span><span v-if="withdraw_plan.date_type == 2">{{ item.month_day }}号</span>
          </div>
          <div class="flex1">{{ item.begin }} - {{ item.end }}</div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="$router.go(-1)">我知道了</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import upload from '@/components/upload/'
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
        money: {},
        bindWechatInfo: {},
        bindAlipayInfo: {},
        bindCardInfo: {},
        aliQrcodeInfo: {},
        wxQrcodeInfo: {},


        freezVisible: false,
        noWithdraw: false,

        plan_date: ['每天', '每周', '每月'],
        week: ['日', '一', '二', '三', '四', '五', '六'],
        withdraw_plan: {},
        cutStoreId: ''
      }
    },
    computed: {
      siteInfo() {
        let siteInfo = this.$store.getters.siteInfo
        return siteInfo
      }
    },
    mounted() {
      if(this.isStore()){
        this.getMyStore()
      }else{
        this.getBalance()
      }
      this.wechatInfo()
      this.alipayInfo()
      this.cardInfo()
      this.qrcodeInfo()
    },
    methods: {
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
        // else if (parseFloat(params.amount) > parseFloat(this.balance)){
        //   this.$message.error('余额不足')
        //   return
        // }
        if(this.cutStoreId) params.storeId = this.cutStoreId
        this.clickSubmit = true
        this.$post('iot-saas-pay/api/pay/withdraw/apply', params).then(res => {
          this.$message({
            message: '申请成功',
            type: 'success'
          })
          this.$router.push({ path: '/money/cashRecord' });
          this.clickSubmit = false
        }).catch(err=>{
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
