<template>
  <div id="OperatePwd">
    <el-dialog :title="$t('components.passwordVerification')" :visible.sync="dialogStatus" :close="false" :center="true"
      width="450px">
      <div class="text-center">
        <div class="mb-15 fs-c1">{{ $t('components.text2') }}</div>
        <div class="mb-15 pl-30 pr-30">
          <el-input v-model="dfrom.cash_pwd" type="password"></el-input>
        </div>
        <div class="text-gray">{{ $t('user.text') }}<a href="/user/setPwd" class="text-blue">{{ $t('components.goSet')
        }}</a></div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogStatus = false">{{ $t('public.cancel') }}</el-button>
        <el-button type="primary" @click="onSubmit()">{{ $t('public.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/**
 * 修改可提现金额
 */
export default {
  props: {},
  data() {
    return {
      dialogStatus: false,
      dfrom: {}
    }
  },
  mounted() {

  },
  methods: {
    /**
     * 显示dialog
     */
    showDialog(row) {
      this.dialogStatus = true
    },

    /**
     * 获取修改记录
     */
    onSubmit() {
      let that = this;
      if (!this.dfrom.cash_pwd) {
        this.$message({
          message: that.$t('user.pleaseSetPassword'),
          type: 'error'
        })
        return
      }
      this.$post('agentapi/action/platform_check_cash_pwd', {
        cash_pwd: this.dfrom.cash_pwd
      }).then(res => {
        this.$message({
          message: that.$t('components.verificationSuccessful'),
          type: 'success'
        })
        this.dialogStatus = false
      })
    }
  }
}
</script>

<style lang="scss" scoped></style>
