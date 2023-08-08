<template>
  <el-dialog :visible.sync="dialogStatus" :show-close="false" :modal-append-to-body="false" :close-on-click-modal="false" class="coin-content" width="680px">
    <div class="coin-header flex align-center p-30 text-white">
      <i class="el-icon-arrow-left fs-b5 cursor" @click="dialogStatus = false"></i>
      <div class="flex1 fs-c1 text-center">充值快活币</div>
      <i class="el-icon-close fs-b5 cursor" @click="dialogStatus = false"></i>
    </div>
    <div class="rel flex justify-center custom-form o-v bg-white fs-c1 text-black line-1" style="border-radius: 16px;">
      <div class="pt-20 pb-40">
        <div class="mb-20 text-bold">充值账号：{{ agentInfo.nickname }}</div>
        <div class="mb-20 flex align-center">
          <div class="text-bold">支付方式：</div>
          <el-radio-group v-model="dform.payType">
            <el-radio :label="1">微信支付</el-radio>
            <el-radio :label="2" disabled>支付宝支付(暂未支持)</el-radio>
          </el-radio-group>
        </div>
        <div class="mb-30 flex align-center">
          <div class="text-bold">充值数量：</div>
          <el-input placeholder="请输入充值数量" v-model="dform.amount" @change.native="dform.payType = 1; getPayCode()" >
            <span slot="append">个</span>
          </el-input>
        </div>
        <div class="rel p-10 qrcode-box" v-if="dform.payType == 1 || !dform.payType">
          <div id="wxqrcode" />
          <img :src="require('@/assets/code.png')" class="block" width="148" alt="" v-if="!coinPayInfo[`wx_${dform.amount}`]">
          <div class="abs p-all flex align-center justify-center" v-if="!coinPayInfo[`wx_${dform.amount}`]">请先输入充值数量</div>
        </div>
        <div class="p-10 qrcode-box" v-if="dform.payType == 2">
          <div id="aliqrcode" />
        </div>
        <div class="mt-25 text-center">
          <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">支付完成</el-button>
        </div>
        <div class="abs dialog-br"></div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
  import QRCode from 'qrcodejs2'
  export default {
    name: 'RechargeKhyCoin',
    props: {
      status: false
    },
    data() {
      return {
        clickSubmit: false,
        dialogStatus: false,
        dform: {
          amount: '',
          payType: 1
        },
        moneyArr: [],
        coinPayInfo: {}
      }
    },
    computed: {
      agentInfo() {
        return this.$store.state.user.agentInfo
      },
    },
    mounted() {
     if(!this.isBrand()) this.getMoneyList()
    },
    methods: {
      /**
       * 显示充值层
       */
      show(val = 0) {
        if(val > 0){
          this.dform.amount = val
          this.getPayCode()
        }
        this.dialogStatus = true
      },

      /**
       * 获取充值金额
       */
      getMoneyList(){
      	this.$get('iot-saas-pay/api/recharge/list', {
      		currencyType: 'KHB'
      	}).then(res => {
      		if(res.length > 0){
      			this.moneyArr = res
      		}
      	})
      },

      /**
       * 获取支付二维码
       */
      getPayCode() {
        let params = JSON.parse(JSON.stringify(this.dform)),
          url = 'iot-saas-pay/api/pay/codeRecharge'
        let amount = parseInt(params.amount)
        if (amount < 1 || !amount) {
          this.$message({
            message: '请输入正确的快活币数量',
            type: 'error'
          })
          return
        }
        if (params.payType == 1 && this.coinPayInfo[`wx_${amount}`]) return
        if (params.payType == 2 && this.coinPayInfo[`ali_${amount}`]) return
        params.happyCurrency = true
        if (this.clickSubmit) return
        this.clickSubmit = true
        this.$post(url, params).then(res => {
          if(res.payResult){
            let payResult = JSON.parse(res.payResult)
            if (params.payType == 1) {
              this.coinPayInfo[`wx_${amount}`] = payResult.code_url
              document.getElementById('wxqrcode').innerHTML = ''
              new QRCode('wxqrcode', {
                width: 150,
                height: 150,
                text: payResult.code_url
              })
              this.createCode = true
            } else if (params.payType == 2) {
              this.coinPayInfo[`ali_${amount}`] = payResult.code_url
              document.getElementById('aliqrcode').innerHTML = ''
              new QRCode('aliqrcode', {
                width: 150,
                height: 150,
                text: payResult.code_url
              })
            }
          } else {
            this.$message({
              message: '支付二维码获取失败',
              type: 'error'
            })
          }
          this.clickSubmit = false
        }).catch(err => {
          this.clickSubmit = false
        })
      },

      /**
       * 弹窗确认
       */
      dialogConfirm() {
        location.reload()
      }
    }
  }
</script>
<style scoped lang="scss">
  .coin-content{
    /deep/ .el-dialog{
      border-radius: 16px;
      background: linear-gradient(225deg, #0F3A7C 0%, #01183A 100%);
      .el-dialog__header{
        display: none;
      }
      .el-dialog__body{
        padding: 0;
      }
    }
    .coin-header{
      background: url('../../assets/vip_headbg.png'), -63px -72.85px / 115.108% 205.37% no-repeat;
      border-radius: 16px;
    }
    .custom-form{
      .el-input{
        width: 230px;
      }
    }
  }
  .qrcode-box {
    margin: 0 auto;
    width: 168px;
    height: 168px;
    border-radius: 8px;
    border: 1px solid var(--color-border-2, #E5E6EB);
  }
</style>
