<template>
  <div>
    <el-row class="pl-30 pr-30 custom-form bg-white">
      <el-col :xs="24" :sm="24" :md="18" :lg="16" :xl="14">
        <el-tabs class="mb-15 bg-white" :value="key" @tab-click="getInfo">
          <el-tab-pane :label="$t('system.miniProgramConfiguration')" name="systemConfig" />
          <el-tab-pane :label="$t('system.shootingConfiguration')" name="freeVideoConfig" />
          <el-tab-pane :label="$t('system.hideConfiguration')" name="xcxMoneyConfig" />
          <el-tab-pane :label="$t('system.updateDetails')" name="systemUpdateDetails" />
          <el-tab-pane label="设备软件升级配置" name="deviceUpdateConfig" />
          <el-tab-pane label="品牌商相关配置" name="brandDomainConfig" />
        </el-tabs>

        <el-form ref="form" :model="form" label-width="150px" label-position="left">
          <template v-if="key == 'systemConfig'">
            <h4>{{ $t('system.miniProgramConfiguration') }}</h4>
            <el-form-item :label="$t('system.wxId')">
              <el-input v-model="form.wechatLatestTemplateId" :placeholder="$t('system.wxId')" />
            </el-form-item>
            <el-form-item :label="$t('system.wechatLatestVersion')">
              <el-input v-model="form.wechatLatestVersion" :placeholder="$t('system.wechatLatestVersion')" />
            </el-form-item>
            <el-form-item :label="$t('system.wechatLatestVersionDescription')">
              <el-input v-model="form.wechatLatestVersionDescription" :placeholder="$t('system.wechatLatestVersionDescription')" type="textarea" rows="4" />
            </el-form-item>
            <el-form-item :label="$t('system.wechatAuthCallbackUrl')">
              <el-input v-model="form.wechatAuthCallbackUrl" :placeholder="$t('system.wechatAuthCallbackUrl')" />
            </el-form-item>
            <el-form-item :label="$t('system.service')">
              <el-input v-model="form.service" :placeholder="$t('system.service')" type="textarea" rows="4" />
            </el-form-item>
            <el-form-item :label="$t('system.business')">
              <el-input v-model="form.business" :placeholder="$t('system.business')" type="textarea" rows="4" />
            </el-form-item>
            <el-form-item :label="$t('system.wechatPrivacySettingList')">
              <el-input v-model="form.wechatPrivacySettingList" :placeholder="$t('system.wechatPrivacySettingList')" type="textarea" rows="4" />
            </el-form-item>
            <el-form-item :label="$t('system.alipayLatestTemplateVersion')">
              <el-input v-model="form.alipayLatestTemplateVersion" :placeholder="$t('system.alipayLatestTemplateVersion')" />
            </el-form-item>
          </template>
          <template v-if="key == 'freeVideoConfig'">
            <h4>{{ $t('system.appidTitle') }}</h4>
            <el-form-item :label="$t('system.freeOfChargeAppid')">
              <el-input v-model="form.appid" :placeholder="$t('system.appid')" />
            </el-form-item>
          </template>
          <template v-if="key == 'xcxMoneyConfig'">
            <h4>{{ $t('system.xcxMoneyConfig') }}</h4>
            <el-form-item :label="$t('system.appid')">
              <el-input v-model="form.appid" :placeholder="$t('system.appidText')" />
            </el-form-item>
            <el-form-item label="管理员登录入口隐藏">
              <el-input v-model="form.brandId" placeholder="请填写品牌ID" />
            </el-form-item>
          </template>
          <template v-if="key == 'systemUpdateDetails'">
            <h4>{{ $t('system.updateDetails') }}</h4>
            <el-form-item :label="$t('system.recentTime')">
              <el-date-picker type="datetime" v-model="form.updateTime" value-format="yyyy-MM-dd HH:mm"></el-date-picker>
            </el-form-item>
            <el-form-item :label="$t('system.updateDetails')">
              <tinymce v-model="form.updateDetails" :height="600" />
            </el-form-item>
          </template>
          <template v-if="key == 'deviceUpdateConfig'">
            <h4>设备软件升级配置</h4>
            <el-form-item label="配置内容">
              <el-input v-model="form.config" placeholder="例:天盘6口网关版本升级配置:{TP_6_1:{updateType:'1',domainUrl:'tjwl.oss-cn-shenzhen.aliyuncs.com',path:'/new_roms/TJ8051_T_6_24_PN_V1_241016_1-update.bin',md5:'218293312BF159D4ACDA90DE06F6A608',size:'61972',deviceVersion:'',fileVersion:'',}}" type="textarea" rows="10" />
            </el-form-item>
          </template>
          <template v-if="key == 'brandDomainConfig'">
            <h4>品牌商相关配置</h4>
            <div style="min-height: 70vh;">
              <vue-json-editor
                v-model="form"
                :showBtns="false"
                :mode="'code'"
                lang="zh"
              />
            </div>
          </template>
          <el-form-item>
            <el-button type="primary" @click="onSubmit('form')" :disabled="clickSubmit">{{ $t('public.submit') }}</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import Tinymce from '@/components/Tinymce'
  import vueJsonEditor from 'vue-json-editor'
  export default {
    components: {
      Tinymce,
      vueJsonEditor
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
          let valueJson = res.valueJson ? JSON.parse(res.valueJson) : {}
          if(this.key == 'brandDomainConfig'){
            this.form = {
              val: valueJson
            }
          }else{
            this.form = valueJson
          }
        })
      },

      /**
       * 提交添加
       */
      onSubmit() {
        let that = this;
        let params = {}, url = 'iot-saas-pay/admin/pay/system/config', json = JSON.parse(JSON.stringify(this.form))
        if(this.key == 'brandDomainConfig'){
          params.valueJson = JSON.stringify(json.val)
        }else{
          params.valueJson = JSON.stringify(json)
        }
        params.key = this.key
        this.clickSubmit = true
        this.$refs['form'].validate((valid) => {
          if (valid) {
            this.$post(url, params).then(res => {
              this.$message({
                message: that.$t('public.operationSuccessful'),
                type: 'success'
              })
              setTimeout(() => {
                this.clickSubmit = false
              }, 1000)
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
  /deep/ .jsoneditor-vue{
    height: 75vh;
  }
</style>
