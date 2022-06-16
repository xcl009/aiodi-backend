<template>
  <div>
    <el-row class="pl-30 pr-30 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="16" :lg="14" :xl="12">
        <el-form ref="form" :model="form" label-width="130px">
          <h4>基础信息</h4>
          <el-form-item label="微信模板ID">
            <el-input v-model="form.wechatLatestTemplateId" placeholder="微信模板ID" />
          </el-form-item>
          <el-form-item label="模板版本">
            <el-input v-model="form.wechatLatestVersion" placeholder="微信模板号" />
          </el-form-item>
          <el-form-item label="版本描述">
            <el-input v-model="form.wechatLatestVersionDescription" placeholder="版本描述" type="textarea" rows="4" />
          </el-form-item>
          <el-form-item label="授权回调域名">
            <el-input v-model="form.wechatAuthCallbackUrl" placeholder="授权回调域名" />
          </el-form-item>
          <el-form-item label="服务域名">
            <el-input v-model="form.service" placeholder="输入服务域名" type="textarea" rows="4" />
          </el-form-item>
          <el-form-item label="业务域名">
            <el-input v-model="form.business" placeholder="输入业务域名" type="textarea" rows="4" />
          </el-form-item>
          <el-form-item label="隐私保护">
            <el-input v-model="form.wechatPrivacySettingList" placeholder="输入隐私保护" type="textarea" rows="4" />
          </el-form-item>
          <el-form-item label="支付宝模板版本">
            <el-input v-model="form.alipayLatestTemplateVersion" placeholder="支付宝模板版本号" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit('form')" :disabled="clickSubmit">提交</el-button>
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
        form: {}
      }
    },
    computed: {
    },
    mounted() {
      this.getInfo()
    },
    methods: {
      /**
       * 获取信息
       */
      getInfo() {
        this.$get('iot-saas-pay/admin/pay/system/config').then(res => {
          this.form = res || {}
        })
      },

      /**
       * 提交添加
       */
      onSubmit() {
        let params = {}, url = 'iot-saas-pay/admin/pay/system/config'
        params = JSON.parse(JSON.stringify(this.form))
        this.clickSubmit = true
        this.$refs['form'].validate((valid) => {
          if (valid) {
            this.$post(url, params).then(res => {
              this.$message({
                message: '提交成功',
                type: 'success'
              })
            }).catch( err => {
              setTimeout(() => {
                this.clickSubmit = false
              }, 1000)
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
