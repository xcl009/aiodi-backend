<template>
  <div>
    <el-row class="pl-20 pr-30 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="16" :lg="12" :xl="10">
        <el-form ref="form" :rules="rules" :model="form" label-position="left" label-width="120px"
          @submit.native.prevent="onSubmit">
          <h3 class="pl-10">{{ $t('user.securityVerification') }}</h3>
          <el-form-item :label="$t('user.setPassword')" prop="password">
            <el-input v-model="form.password" type="password" :placeholder="$t('user.pleaseSetPassword')" />
          </el-form-item>
          <el-form-item>
            <div class="mt-10 text-black3">
              {{ $t('user.text') }}
              <router-link to="/user/opwd" class="text-primary">{{ $t('user.goSet') }}</router-link>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit" :disabled="clickSubmit">{{ $t('public.confirm') }}</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  data() {
    return {
      clickSubmit: false,
      form: {},
    }
  },
  computed: {
    rules() {
      return {
        password: [
          { required: true, message: this.$t('user.pleaseSetPassword'), trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {

  },
  methods: {
    /**
     * 提交数据
     */
    onSubmit() {
      let that = this;
      let params = JSON.parse(JSON.stringify(this.form))
      this.clickSubmit = true
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.$post('iot-saas-user/admin/user/twoPassword/confirm', params).then(res => {
            this.$message({
              message: that.$t('public.operationSuccessful'),
              type: 'success'
            })
            this.$router.back()
            this.clickSubmit = false
          }).catch(err => {
            this.clickSubmit = false
          })
        } else {
          this.clickSubmit = false
        }
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
