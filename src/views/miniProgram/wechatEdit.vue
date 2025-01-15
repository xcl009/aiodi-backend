<template>
  <div>
    <el-row class="pl-30 pr-30 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="16" :lg="14" :xl="12">
        <h4>{{ $t('miniProgram.bindApplet') }}</h4>
        <div class="pt-20 mb-20 flex fs-c1">
          <span>{{ $t('miniProgram.text') }}</span>
          <el-link class="fs-c1" href="http://authorize.api.iotgx.cn/open/wechat/authorizeaccount" target="_blank" type="primary">{{ $t('miniProgram.authorize')
          }}</el-link>
          <span>{{ $t('miniProgram.text1') }}</span>
        </div>
        <el-form ref="form" :model="form" label-position="left" label-width="210px">
          <el-form-item :label="$t('public.appletName')">
            <el-input v-model="form.appName"></el-input>
          </el-form-item>
          <el-form-item :label="$t('public.xcxAppid')">
            <el-input v-model="form.appId"></el-input>
          </el-form-item>
          <el-form-item :label="$t('miniProgram.xcxAPPSECRET')">
            <el-input v-model="form.appSecret"></el-input>
          </el-form-item>
          <el-form-item :label="$t('miniProgram.originId')">
            <el-input v-model="form.originId"></el-input>
          </el-form-item>
          <el-form-item :label="$t('miniProgram.appMchid')">
            <el-input v-model="form.appMchid"></el-input>
          </el-form-item>
          <el-form-item :label="$t('miniProgram.apiv2Key')">
            <el-input v-model="form.apiv2Key"></el-input>
          </el-form-item>
          <el-form-item :label="$t('miniProgram.apiv3Key')">
            <el-input v-model="form.apiv3Key"></el-input>
          </el-form-item>
          <el-form-item :label="$t('miniProgram.serviceId')">
            <el-input v-model="form.serviceId"></el-input>
          </el-form-item>
          <el-form-item :label="$t('miniProgram.maxDividePercent')">
            <el-input v-model="form.maxDividePercent">
              <template slot="append">%</template>
            </el-input>
          </el-form-item>
          <el-form-item :label="$t('miniProgram.settlementCycle')">
            <el-input v-model="form.settlementCycle">
              <template slot="append">{{ $t('public.day') }}</template>
            </el-input>
          </el-form-item>
					<el-form-item label="验签类型">
					  <el-radio-group v-model="form.verificationMethod">
					    <el-radio-button :label="1">公钥</el-radio-button>
					    <el-radio-button :label="0">平台证书</el-radio-button>
					  </el-radio-group>
					</el-form-item>
          <el-form-item :label="$t('miniProgram.certName')">
            <div class="flex align-center">
              <upload :uploadText="$t('miniProgram.certNameText')" :raw="true" @getFile="getCert" />
              <div class="pl-15">{{ certName }}</div>
            </div>
          </el-form-item>
          <el-form-item label="apiclientKey">
            <el-input v-model="form.apiclientKey" type="textarea" :rows="6"></el-input>
          </el-form-item>
					<el-form-item label="公钥" v-if="form.verificationMethod == 1">
					  <el-input v-model="form.publicKey" type="textarea" :rows="6"></el-input>
					</el-form-item>
					<el-form-item label="公钥ID" v-if="form.verificationMethod == 1">
					  <el-input v-model="form.publicKeyId"></el-input>
					</el-form-item>
					<!-- <el-form-item label="商户类型">
					  <el-radio-group v-model="form.type">
					    <el-radio-button :label="0">正常商户</el-radio-button>
					    <el-radio-button :label="1">押金商户</el-radio-button>
					  </el-radio-group>
					</el-form-item> -->
          <el-form-item>
            <el-button type="primary" @click="onSubmit" :disabled="clickSubmit">{{ $t('public.submit') }}</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import upload from '@/components/upload'
export default {
  components: {
    upload
  },
  data() {
    return {
      clickSubmit: false,
      baseURL: this.config.BASE_URL,
      form: {
        maxDividePercent: 30,
        settlementCycle: 1,
				type: 0,
				verificationMethod: 1,
      },
			type: this.$route.query.type || 0,
      certName: ''
    }
  },
  computed: {
    siteInfo() {
      return this.$store.state.user.siteInfo
    }
  },
  mounted() {
    if (this.$route.query.app_id) this.getInfo()
  },
  methods: {
    /**
     * 获取信息
     */
    getInfo() {
      this.$post('iot-saas-pay/admin/pay/config/wechat/detail', {
        appId: this.$route.query.app_id,
        type: this.type
      }).then(res => {
        let params = this.pick(res, [
          'appName',
          'appId',
          'appSecret',
          'originId',
          'appMchid',
          'apiv2Key',
          'apiv3Key',
          'apiclientCert',
          'apiclientKey',
          'serviceId',
          'maxDividePercent',
          'settlementCycle',
          'verificationMethod',
          'publicKey',
          'publicKeyId',
        ])
				if(params.publicKey){
				  params.publicKey = atob(params.publicKey)
				}
				this.form = params
      })
    },

    /**
     * 提交信息
     */
    onSubmit() {
      let that = this;
      let url = 'iot-saas-pay/admin/pay/config/wechat/save',
        params = JSON.parse(JSON.stringify(this.form))
			if(params.publicKey){
				params.publicKey = btoa(params.publicKey)
			}
      this.clickSubmit = true
      this.$post(url, params).then(res => {
        this.$message({
          message: that.$t('public.submittedSuccess'),
          type: 'success'
        })
        this.$router.push({
          path: '/system/wechat'
        })
        this.clickSubmit = false
      }).catch(err => {
        this.clickSubmit = false
      })
    },

    /**
     * 证书上传
     */
    getCert(e) {
      var reader = new FileReader()
      reader.readAsDataURL(e)
      reader.onload = (res) => {
        this.form.apiclientCert = res.currentTarget.result.replace('data:application/x-pkcs12;base64,', '')
        this.certName = e.name
      }
    }
  }
}
</script>

<style scoped>
.line {
  text-align: center;
}
</style>
