<template>
  <el-row type="flex" justify="center" class="p-30  custom-form bg-white">
    <el-col :xs="24" :sm="12" :md="6" :lg="6">
      <el-form ref="form" :model="form" :rules="rules">
        <!-- <el-form-item label="用户名">
          <el-input v-model="agentInfo.mobile" disabled></el-input>
        </el-form-item>
        <el-form-item label="验证码" ref="verificationCode" prop="verificationCode">
          <el-input v-model="form.verificationCode">
            <auth-code ref="authCode" slot="append" @authCode="getAuthCode"></auth-code>
          </el-input>
        </el-form-item> -->
        <el-form-item label="旧密码">
          <el-input v-model="form.oldPassword" show-password placeholder="未设置过可不填写"></el-input>
        </el-form-item>
        <el-form-item label="新密码" ref="newPassword" prop="newPassword">
          <el-input v-model="form.newPassword" show-password></el-input>
        </el-form-item>
        <el-form-item label="确认密码" ref="repeatNewPassword" prop="repeatNewPassword">
          <el-input v-model="form.repeatNewPassword" show-password></el-input>
        </el-form-item>
        <el-form-item class="text-center">
          <el-button type="primary" size="medium" :disabled="clickSubmit" @click="onSubmit()">保存信息</el-button>
          <el-button size="medium" class="btn-body" @click="$router.go(-1)">取消</el-button>
        </el-form-item>
       </el-form>
    </el-col>
  </el-row>
</template>

<script>
  import AuthCode from '@/components/AuthCode/'
  export default {
    name: 'operatePwd',
    components: {
      AuthCode
    },
    data() {
      return {
        rules: {
          newPassword: [
            {
              required: true,
              message: '请填写新操作密码',
              trigger: 'blur'
            },
          ],
          repeatNewPassword: [
            {
              required: true,
              message: '请再次填写新操作密码',
              trigger: 'blur'
            },
            {
              required: true,
              validator: (rule, value, callback) => {
                if (value === '') {
                  callback(new Error('请再次输入密码'))
                } else if (value !== this.form.newPassword) {
                  callback(new Error('两次输入密码不一致!'))
                } else {
                  callback()
                }
              },
              trigger: 'blur'
            }
          ]
        },
        clickSubmit: false,
        form: {}
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
       * 提交保存
       */
      onSubmit(formName = 'form') {
        this.clickSubmit = true
        this.$refs[formName].validate((valid, object) => {
          if (valid) {
            const params = JSON.parse(JSON.stringify(this.form))
            this.$post('iot-saas-user/admin/user/twoPassword/update', params).then(res => {
              this.$message({
                message: '修改成功',
                type: 'success'
              })
              this.$router.back()
              this.clickSubmit = false
            }).catch( err => {
              setTimeout(() => {
                this.clickSubmit = false
              }, 1000)
            })
          } else {
            this.clickSubmit = false
          }
        })
      },

      /**
       * 获取验证码
       */
      getAuthCode(){
        this.$refs.authCode.getAuthCode({
          mobile: this.agentInfo.mobile
        }, 'iot-saas-user/admin/user/twoPassword/sendUpdateCode')
      },
    }
  }
</script>

<style lang="scss" scoped>

</style>
