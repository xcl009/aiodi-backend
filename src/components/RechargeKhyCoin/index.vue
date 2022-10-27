<template>
  <el-dialog :visible.sync="khyCoinDialog" :show-close="false" :modal-append-to-body="false" :close-on-click-modal="false" width="600px"
    align="center" title="快活币充值">
    <el-form class="custom-form" label-position="left" label-width="120px" @submit.native.prevent>
      <el-form-item label="选择充值数量" v-if="!isBrand() && moneyArr.length > 0">
        <div class="flex flex-wrap">
          <div class="mb-10 mr-10" v-for="item in moneyArr">
            <el-button :class="{'el-button--primary is-plain': dform.amount == item.amount, 'bg-body': dform.amount != item.amount}" @click="dform.amount = item.amount; getPayCode()">充{{ item.amount }}{{ item.giftAmount > 0 ? '送'+ item.giftAmount : '' }}</el-button>
          </div>
        </div>
      </el-form-item>
      <el-form-item :label="isBrand() ? '充值数量' : '自定义数量'" v-if="moneyArr.length == 0">
        <el-input v-model="dform.amount" @change.native="dform.payType = 1; getPayCode()">
          <span slot="append">个</span>
        </el-input>
      </el-form-item>
    </el-form>
    <div>
      <el-button-group class="mb-30">
        <el-button type="primary" :plain="dform.payType != 1" @click="dform.payType = 1; getPayCode()">微信</el-button>
        <!-- <el-button type="primary" :plain="dform.payType != 2" @click="dform.payType = 2; getPayCode()">支付宝</el-button> -->
      </el-button-group>
      <div class="mb-30 p-10 qrcode-box" v-if="dform.payType == 1 || !dform.payType">
        <div id="wxqrcode" />
      </div>
      <div class="mb-30 p-10 qrcode-box ali" v-if="dform.payType == 2">
        <div id="aliqrcode" />
      </div>
    </div>
    <div class="mt-30 text-center">
      <el-button size="medium" class="bg-body" @click="khyCoinDialog = false">取消</el-button>
      <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">支付成功</el-button>
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
        khyCoinDialog: false,
        dform: {
          amount: '',
          payType: 1
        },
        moneyArr: [],
        coinPayInfo: {},
      }
    },
    mounted() {
     if(!this.isBrand()) this.getMoneyList()
    },
    methods: {
      /**
       * 显示充值层
       */
      show() {
        this.khyCoinDialog = true
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
  .qrcode-box {
    width: 174px;
    height: 174px;
    border: 2px solid #4bb414;

    &.ali {
      border-color: #07aaf0;
    }
  }
</style>
