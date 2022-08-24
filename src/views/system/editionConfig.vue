<template>
  <div>


    <el-row class="pl-30 pr-30 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="16" :lg="14" :xl="12">
        <el-tabs class="mb-15 bg-white" :value="key" @tab-click="getInfo">
          <el-tab-pane label="小程序配置" name="systemConfig" />
          <el-tab-pane label="免押拍摄配置" name="freeVideoConfig" />
        </el-tabs>

        <el-form ref="form" :model="form" label-width="130px" label-position="left">
          <template v-if="key == 'systemConfig'">
            <h4>小程序配置</h4>
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
          </template>
          <template v-if="key == 'freeVideoConfig'">
            <h4>免押拍摄配置</h4>
            <el-form-item label="免押小程序APPID">
              <el-input v-model="form.appid" placeholder="小程序APPID" />
            </el-form-item>
          </template>
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
        form: {},
        key: 'systemConfig'
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
      getInfo(e = {}) {
        this.key = e.name ? e.name : 'systemConfig'
        this.$get('iot-saas-pay/open/pay/system/config', {
          key: this.key
        }).then(res => {
          this.form = res.valueJson ? JSON.parse(res.valueJson) : {}
        })
      },

      /**
       * 提交添加
       */
      onSubmit() {
        let params = {}, url = 'iot-saas-pay/admin/pay/system/config'
        params.valueJson = JSON.stringify(this.form)
        params.key = this.key
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
