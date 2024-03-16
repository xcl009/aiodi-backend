<template>
  <div>
    <el-row class="pl-30 pr-30 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="16" :lg="14" :xl="12">
        <el-tabs class="mb-15 bg-white" :value="code" @tab-click="getInfo">
          <el-tab-pane label="隐私政策" name="privacy" />
          <el-tab-pane label="用户协议" name="userAgreement" />
          <el-tab-pane label="售后退款协议" name="salesRefund" />
          <el-tab-pane label="租借协议" name="leaseAgreement" />
        </el-tabs>

        <el-form ref="form" :model="form">
          <el-form-item>
            <tinymce ref="tinymce" v-model="form.value" :height="600" />
          </el-form-item>
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
  export default {
    components: {
      Tinymce
    },
    data() {
      return {
        clickSubmit: false,
        form: {},
        code: 'privacy'
      }
    },
    computed: {

    },
    mounted() {
      this.getInfo({}, 2)
    },
    methods: {
      /**
       * 获取信息
       */
      getInfo(e = {}, type = 1) {
        this.code = e.name ? e.name : 'privacy'
        this.$get('iot-saas-basic/admin/settings/find', {
          code: this.code
        }).then(res => {
          if(res && res.code){
            if(type == 2){
              this.form = {
                value: JSON.parse(res.setting)[this.code]
              }
            }else{
              this.$refs.tinymce.setContent(JSON.parse(res.setting)[this.code])
            }
          }else{
            this.$refs.tinymce.setContent('')
          }
        })
      },

      /**
       * 提交添加
       */
      onSubmit() {
        let that = this, params = {}
        params[this.code] = this.form.value
        this.clickSubmit = true
        this.$post('iot-saas-basic/admin/settings/save', {
          code: this.code,
          setting: JSON.stringify(params)
        }).then(res => {
          this.$message({
            message: that.$t('public.submittedSuccess'),
            type: 'success'
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
