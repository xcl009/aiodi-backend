<template>
  <div>
    <el-row class="pl-20 pr-30 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="16" :lg="12" :xl="10">
        <el-form ref="form" :model="form" label-position="left" label-width="120px">
          <h3 class="pl-10">安全验证</h3>
          <el-form-item label="操作密码">
            <el-input v-model="form.password" type="password" placeholder="请输入您的操作密码" />
            <div class="mt-10 text-black3">
              忘记操作密码或未设置操作密码？
              <router-link to="/user/opwd" class="text-primary">去设置</router-link>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit" :disabled="clickSubmit">确定</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  export default {
    components: {

    },
    data() {
      return {
        clickSubmit: false,
        form: {},
      }
    },
    mounted() {

    },
    methods: {
      /**
       * 提交数据
       */
      onSubmit() {
        let params = JSON.parse(JSON.stringify(this.form))
        this.clickSubmit = true
        this.$post('iot-saas-user/admin/user/twoPassword/confirm', params).then(res => {
          this.$message({
            message: '验证成功',
            type: 'success'
          })
          this.$router.back()
          this.clickSubmit = false
        }).catch(err => {
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
