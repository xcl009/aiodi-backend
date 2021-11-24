<template>
  <div class="p-10">
    <div class="p-30 bg-white flex justify-center">
      <el-form ref="form" :model="wForm" label-width="100px" style="width: 500px">
        <el-form-item label="手机号码：">
          <div>{{ agentInfo.phone }}</div>
        </el-form-item>
        <el-form-item label="验证码：">
          <div class="flex">
            <el-input v-model="wForm.captche_num"></el-input>
            <auth-code ref="authCode" @authCode="getAuthCode()"></auth-code>
          </div>
        </el-form-item>
        <el-form-item label="新密码：">
          <el-input v-model="wForm.cur_cash_pwd" type="password"></el-input>
        </el-form-item>
        <el-form-item label="确认密码：">
          <el-input v-model="wForm.re_cash_pwd" type="password"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="postEdit(2)">确定</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  import AuthCode from '@/components/AuthCode/'
  export default {
    name: 'withdrawPw',
    components: {
      AuthCode
    },
    data() {
      return {
        wForm: {}
      }
    },
    computed: {
      agentInfo() {
        return this.$store.getters.agentInfo
      }
    },
    mounted() {
    },
    methods: {
      /**
       * 获取验证码
       */
      getAuthCode(){
        this.$refs.authCode.getAuthCode({
          phone_num: this.agentInfo.phone,
          type: 8
        })
      },

      /**
       * 修改密码
       */
      postEdit(type) {
        let url = 'agentapi/edit_cash_pwd_save', params = this.wForm
        this.$post(url, params).then(res => {
          this.$message({
            message: '修改成功',
            type: 'success'
          })
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
