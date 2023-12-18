<template>
  <div>
    <el-row class="pl-30 pr-30 custom-form bg-white">
      <el-col :xs="24" :sm="24" :md="18" :lg="16" :xl="12">
        <h4>{{ $t('miniProgram.bindApplet') }}</h4>
        <div class="pt-20 mb-20 flex fs-c1">
          <span>{{ $t('miniProgram.text') }}</span>
          <el-link class="fs-c1" :href="config.ali_auth_url" target="_blank" type="primary">{{ $t('miniProgram.authorize')
          }}</el-link>
          <span>{{ $t('miniProgram.text1') }}</span>
        </div>
        <el-form ref="form" :model="form" label-position="left" label-width="210px">
          <el-form-item :label="$t('miniProgram.zfbId')">
            <el-input v-model="form.pid"></el-input>
          </el-form-item>
          <el-form-item :label="$t('public.appletName')">
            <el-input v-model="form.appName"></el-input>
          </el-form-item>
          <el-form-item :label="$t('public.xcxAppid')">
            <el-input v-model="form.appId"></el-input>
          </el-form-item>
          <!--<el-form-item label="接口内容加密方式">
            <el-input v-model="form.signType"></el-input>
          </el-form-item> -->
          <el-form-item :label="$t('miniProgram.appPrivateKey')">
            <el-input v-model="form.appPrivateKey" type="textarea" :rows="6"></el-input>
          </el-form-item>
          <el-form-item :label="$t('miniProgram.appCert')">
            <el-input v-model="form.appCert" type="textarea" :rows="6"></el-input>
          </el-form-item>
          <el-form-item :label="$t('miniProgram.alipayCert')">
            <el-input v-model="form.alipayCert" type="textarea" :rows="6"></el-input>
          </el-form-item>
          <el-form-item :label="$t('miniProgram.alipayRootCert')">
            <el-input v-model="form.alipayRootCert" type="textarea" :rows="6"></el-input>
          </el-form-item>
          <el-form-item :label="$t('miniProgram.serviceId')">
            <el-input v-model="form.serviceId"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit" :disabled="clickSubmit">{{ $t('public.submitNow') }}</el-button>
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
      form: {
        status: 1
      }
    }
  },
  computed: {
    siteInfo() {
      return this.$store.state.user.siteInfo
    }
  },
  mounted() {
    if (this.$route.query.app_id > 0) this.getInfo()
  },
  methods: {
    /**
     * 获取信息
     */
    getInfo() {
      this.$post('iot-saas-pay/admin/pay/config/alipay/detail', {
        appId: this.$route.query.app_id
      }).then(res => {
        this.form = this.pick(res, [
          'pid',
          'appName',
          'appId',
          'appPrivateKey',
          'appCert',
          'alipayCert',
          'alipayRootCert',
          'serviceId'
        ])
      })
    },

    /**
     * 提交保存
     */
    onSubmit() {
      let that = this;
      let url = 'iot-saas-pay/admin/pay/config/alipay/save',
        params = JSON.parse(JSON.stringify(this.form))
      if (this.$route.params.id > 0) params.id = this.$route.params.id
      this.clickSubmit = true
      this.$post(url, params).then(res => {
        this.$message({
          message: that.$t('public.submittedSuccess'),
          type: 'success'
        })
        this.$router.push({
          path: '/system/alipay'
        })
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
