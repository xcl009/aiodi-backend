<template>
  <div class="p-10">
    <el-row class="pt-30 pb-30 bg-white">
      <el-col :span="12" :offset="5">
        <el-form ref="form" :model="form" label-width="180px">
          <el-form-item label="可提现金额：">
            <div class="text-primary fs-b1">{{ money.available_withdraw_money }}</div>
          </el-form-item>
          <el-form-item label="提现金额：">
            <el-input v-model="form.withdraw_money" placeholder="请输入提现金额" />
          </el-form-item>
          <el-form-item label="冻结金额：">
            <span class="mr-20">{{ money.freez_money }}</span>
            <el-link type="primary" @click="freezVisible = true">什么是冻结金额？</el-link>
          </el-form-item>
          <el-form-item label="提现方式：">
            <el-radio-group v-model="form.withdraw_type">
              <el-radio-button :label="item" v-for="item in siteInfo.agent_withdraw_type">{{ config.withdraw_way[item] }}</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="到账账户：" v-show="form.withdraw_type == 2">
            <div class="flex align-center" v-if="agentInfo.zfb_open_id">
              <el-avatar size="medium" :src="agentInfo.zfb_avatar"></el-avatar>
              <div class="ml-10">{{ agentInfo.zfb_nick_name }}</div>
            </div>
            <div class="flex align-center" v-else>您暂未绑定支付宝，请先进入小程序提现页面绑定支付宝</div>
          </el-form-item>
          <el-form-item label="到账账户：" v-show="form.withdraw_type == 1">
            <div class="flex align-center" v-if="agentInfo.wx_open_id">
              <el-avatar size="medium" :src="agentInfo.wx_avatar"></el-avatar>
              <div class="ml-10">{{ agentInfo.wx_nick_name }}</div>
            </div>
            <div class="flex align-center" v-else>您暂未绑定微信，请先进入小程序提现页面绑定微信</div>
          </el-form-item>
          <el-form-item label="到账账户：" v-show="form.withdraw_type == 0">
            <div class="flex align-center" v-if="agentInfo.bank_id">
              <span class="mr-10">{{ agentInfo.name }}</span>
              <span>{{ agentInfo.bank_name }}({{ agentInfo.bank_id.substring(agentInfo.bank_id.length - 4) }})</span>
            </div>
            <router-link class="flex align-center text-primary" v-else :to="`/user/index`">未设置银行卡信息，去设置<i class="el-icon-arrow-right
"></i></router-link>
          </el-form-item>
          <div v-show="form.withdraw_type == 3">
            <el-form-item label="姓名：">
              <el-input v-model="form.wx_account_name" placeholder="您的姓名" />
            </el-form-item>
            <el-form-item label="收款码：">
              <upload v-model="form.wx_account_qrcode"></upload>
            </el-form-item>
          </div>
          <div v-show="form.withdraw_type == 4">
            <el-form-item label="姓名：">
              <el-input v-model="form.zfb_account_name" placeholder="您的姓名" />
            </el-form-item>
            <el-form-item label="收款码：">
              <upload v-model="form.zfb_account_qrcode"></upload>
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
          wx_account_name: '',
          wx_account_qrcode: '',
          zfb_account_name: '',
          zfb_account_qrcode: '',
          withdraw_type: 1
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
        if(siteInfo.agent_id) this.form.withdraw_type = siteInfo.agent_withdraw_type[0]
        return siteInfo
      }
    },
    mounted() {
      this.getMoney()
      this.verifyWithdraw()
      this.$store.dispatch('user/postSetRecode', [3, 1, 4])
    },
    methods: {
      verifyWithdraw() {
        this.$get('agentapi/apply/verify_withdraw_alvalie').then(res => {
          if(res.status == 1){
            this.noWithdraw = true
            this.withdraw_plan = {
              date_type: res.date_type,
              plan: res.plan
            }
          }
        })
      },

      getMoney() {
        this.$get('agentapi/index').then(res => {
          this.money = res
        })
      },

      onSubmit() {
        if(!this.form.withdraw_money){
          this.$message.error('请输入提现金额')
          return
        } else if (parseFloat(this.form.withdraw_money) > parseFloat(this.money.available_withdraw_money)){
          this.$message.error('余额不足')
          return
        }
        this.clickSubmit = true
        this.$post('agentapi/launch_withdraw_apply', this.form).then(res => {
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
