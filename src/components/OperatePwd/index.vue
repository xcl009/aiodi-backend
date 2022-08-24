<template>
  <div id="OperatePwd">
    <el-dialog title="操作密码校验" :visible.sync="dialogStatus" :close="false" :center="true" width="450px">
      <div class="text-center">
        <div class="mb-15 fs-c1">为保障资金安全，请输入您的操作密码进行校验</div>
        <div class="mb-15 pl-30 pr-30">
          <el-input v-model="dfrom.cash_pwd" type="password"></el-input>
        </div>
        <div class="text-gray">忘记操作密码或未设置操作密码？<a href="/user/setPwd" class="text-blue">前往设置</a></div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogStatus = false">取 消</el-button>
        <el-button type="primary" @click="onSubmit()">确 定</el-button>
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
        if (!this.dfrom.cash_pwd) {
          this.$message({
            message: '请输入您的操作密码',
            type: 'error'
          })
          return
        }
        this.$post('agentapi/action/platform_check_cash_pwd', {
          cash_pwd: this.dfrom.cash_pwd
        }).then(res => {
          this.$message({
            message: '验证成功',
            type: 'success'
          })
          this.dialogStatus = false
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
