<template>
  <div class="p-10">
    <div class="p-30 bg-white flex justify-center">
      <el-form ref="form" :model="loginForm" label-width="100px" style="width: 500px">
        <el-form-item label="手机号码：">
          <div>{{ agentInfo.phone }}</div>
        </el-form-item>
        <el-form-item label="旧密码：" v-if="checkRoles(['terminal'])">
          <el-input v-model="loginForm.old_pwd" type="password"></el-input>
        </el-form-item>
        <el-form-item label="验证码：" v-else>
          <div class="flex">
            <el-input v-model="loginForm.captche_num"></el-input>
            <auth-code ref="authCode" @authCode="getAuthCode()"></auth-code>
          </div>
        </el-form-item>
        <el-form-item label="新密码：">
          <el-input v-model="loginForm.cur_pwd" type="password"></el-input>
        </el-form-item>
        <el-form-item label="确认密码：">
          <el-input v-model="loginForm.re_pwd" type="password"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="postEdit(1)">确定</el-button>
        </el-form-item>
       </el-form>
    </div>
  </div>
</template>

<script>
  import AuthCode from '@/components/AuthCode/'
  export default {
    name: 'loginPw',
    components: {
      AuthCode
    },
    data() {
      return {
        loginForm: {}
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
          type: 7
        })
      },

      /**
       * 修改密码
       */
      postEdit(type) {
        let url = 'agentapi/edit_password_save', params = this.loginForm
        if(this.checkRoles(['terminal'])) params.type = 0
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
