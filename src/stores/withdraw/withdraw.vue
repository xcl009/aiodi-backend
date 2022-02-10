<template>
  <div>
    <el-row class="pt-10 pl-30 pr-30 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="16" :lg="12" :xl="10">
        <el-form ref="form" :model="form" label-position="left" label-width="135px">
          <el-form-item label="可提现金额：">
            <div class="text-primary fs-b1">{{ money.available_withdraw_money || 0.00 }}</div>
          </el-form-item>
          <el-form-item label="提现金额：">
            <el-input v-model="form.amount" placeholder="请输入提现金额" />
          </el-form-item>
          <el-form-item label="冻结金额：">
            <span class="mr-20">{{ money.freez_money || 0.00 }}</span>
            <el-link type="primary" @click="freezVisible = true">什么是冻结金额？</el-link>
          </el-form-item>
          <el-form-item label="提现方式：">
            <el-radio-group v-model="form.withdrawType">
              <el-radio-button :label="index" v-for="(item, index) in siteInfo.withdrawType">{{ item }}</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="到账账户：" v-show="form.withdrawType == 2">
            <div class="flex align-center" v-if="agentInfo.zfb_open_id">
              <el-avatar size="medium" :src="agentInfo.zfb_avatar"></el-avatar>
              <div class="ml-10">{{ agentInfo.zfb_nick_name }}</div>
            </div>
            <div class="flex align-center" v-else>您暂未绑定支付宝，请先进入小程序提现页面绑定支付宝</div>
          </el-form-item>
          <el-form-item label="到账账户：" v-show="form.withdrawType == 1">
            <div class="flex align-center" v-if="agentInfo.wx_open_id">
              <el-avatar size="medium" :src="agentInfo.wx_avatar"></el-avatar>
              <div class="ml-10">{{ agentInfo.wx_nick_name }}</div>
            </div>
            <div class="flex align-center" v-else>您暂未绑定微信，请先进入小程序提现页面绑定微信</div>
          </el-form-item>
          <el-form-item label="到账账户：" v-show="form.withdrawType == 0">
            <div class="flex align-center" v-if="agentInfo.cardNo">
              <span class="mr-10">{{ agentInfo.cardName }}</span>
              <span>{{ agentInfo.bankName }}({{ agentInfo.cardNo.substring(agentInfo.cardNo.length - 4) }})</span>
            </div>
            <router-link class="flex align-center text-primary" v-else :to="`/user/index`">未设置银行卡信息，去设置<i class="el-icon-arrow-right
"></i></router-link>
          </el-form-item>
          <div v-show="form.withdrawType == 3">
            <el-form-item label="姓名：">
              <el-input v-model="form.userName" placeholder="您的姓名" />
            </el-form-item>
            <el-form-item label="收款码：">
              <upload v-model="form.qrcode"></upload>
            </el-form-item>
          </div>
          <div v-show="form.withdrawType == 4">
            <el-form-item label="姓名：">
              <el-input v-model="form.userName" placeholder="您的姓名" />
            </el-form-item>
            <el-form-item label="收款码：">
              <upload v-model="form.qrcode"></upload>
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
  import upload from '@/components/upload/two'
  export default {
    components: {
      upload
    },
    data() {
      return {
        clickSubmit: false,
        form: {
          sourceType: 3,
          withdrawType: 0
        },
        money: {},
        freezVisible: false,
        noWithdraw: false,

        plan_date: ['每天', '每周', '每月'],
        week: ['日', '一', '二', '三', '四', '五', '六'],
        withdraw_plan: {}
      }
    },
    computed: {
      agentInfo() {
        let agentInfo = this.$store.getters.agentInfo
        this.form.wx_account_name = agentInfo.wx_account_name
        this.form.wx_account_qrcode = agentInfo.wx_account_qrcode
        this.form.zfb_account_name = agentInfo.zfb_account_name
        this.form.zfb_account_qrcode = agentInfo.zfb_account_qrcode
        return agentInfo
      },
      siteInfo() {
        let siteInfo = this.$store.getters.siteInfo
        siteInfo.withdrawType = ['银行卡', '微信', '支付宝', '微信收款码', '支付宝收款码']
        return siteInfo
      }
    },
    mounted() {
    },
    methods: {
      onSubmit() {
        let params = JSON.parse(JSON.stringify(this.form))
        if(!params.amount){
          this.$message.error('请输入提现金额')
          return
        }
        // else if (parseFloat(params.amount) > parseFloat(params.available_withdraw_money)){
        //   this.$message.error('余额不足')
        //   return
        // }
        params.withdrawType = params.withdrawType + 1
        this.clickSubmit = true
        this.$post('iot-saas-pay/api/pay/withdraw/apply', params).then(res => {
          this.$message({
            message: '申请成功',
            type: 'success'
          })
          this.$router.push({ path: '/withdraw/record' });
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
