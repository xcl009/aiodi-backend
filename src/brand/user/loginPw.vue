<template>
  <el-row type="flex" justify="center" class="p-30 custom-form bg-white">
    <el-col :xs="24" :sm="12" :md="6" :lg="6">
      <el-form ref="form" :model="form">
        <!-- <el-form-item label="手机号码">
          <el-input v-model="form.phone" disabled=""></el-input>
        </el-form-item> -->
        <el-form-item label="旧密码">
          <el-input v-model="form.old_pwd" type="password"></el-input>
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="form.cur_pwd" type="password"></el-input>
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="form.re_pwd" type="password"></el-input>
        </el-form-item>
        <el-form-item class="text-center">
          <el-button type="primary" size="medium" :disabled="clickSubmit" @click="postEdit()">保存信息</el-button>
          <el-button size="medium" class="btn-body" @click="$router.push({path: `/home`})">取消</el-button>
        </el-form-item>
       </el-form>
    </el-col>
  </el-row>
</template>

<script>
  export default {
    name: 'loginPw',
    components: {

    },
    data() {
      return {
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
      postEdit() {
        let url = 'agentapi/edit_password_save', params = this.form
        params.type = 0
        this.clickSubmit = true
        this.$post(url, params).then(res => {
          this.$message({
            message: '修改成功',
            type: 'success'
          })
          this.clickSubmit = false
        }).catch(()=>{
          this.clickSubmit = false
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
