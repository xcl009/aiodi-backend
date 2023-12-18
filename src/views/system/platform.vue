<template>
  <el-row class="p-30 custom-form bg-white">
    <el-col :xs="24" :sm="18" :md="12" :lg="10">
      <el-form ref="form" :model="form" label-position="left" label-width="130px">
        <el-form-item :label="$t('system.appLogo')">
          <upload v-model="form.appLogo" ratio="1:1" :upObj="{ fileType: 'appLogo' }" />
        </el-form-item>
        <el-form-item :label="$t('system.appName')">
          <el-input v-model="form.appName" :placeholder="$t('system.appNameText')" />
        </el-form-item>
        <el-form-item :label="$t('system.officialAccountQrcode')">
          <upload v-model="form.officialAccountQrcode" ratio="1:1" :upObj="{ fileType: 'wxQrCode' }" />
        </el-form-item>
        <el-form-item :label="$t('system.officialAccountName')">
          <el-input v-model="form.officialAccountName" :placeholder="$t('system.officialAccountNameText')" />
        </el-form-item>
        <el-form-item :label="$t('system.customerServiceTelephone')">
          <el-input v-model="form.customerServiceTelephone" :placeholder="$t('system.customerServiceTelephoneText')" />
        </el-form-item>
        <el-form-item :label="$t('system.customerServiceWechatNumber')">
          <el-input v-model="form.customerServiceWechatNumber"
            :placeholder="$t('system.customerServiceWechatNumberText')" />
        </el-form-item>
        <el-form-item :label="$t('system.corporateName')">
          <el-input v-model="form.companyName" :placeholder="$t('system.corporateNameText')" />
        </el-form-item>
        <el-form-item :label="$t('public.companyAddress')">
          <el-input v-model="form.companyAddress" :placeholder="$t('public.companyAddressText')" />
        </el-form-item>
        <el-form-item :label="$t('system.appIntroduce')">
          <tinymce v-model="form.appIntroduce" :height="300" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit('form')" :disabled="clickSubmit">{{ $t('public.submit')
          }}</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<script>
import upload from '@/components/upload/'
import Tinymce from '@/components/Tinymce'
export default {
  components: {
    upload,
    Tinymce
  },
  data() {
    return {
      clickSubmit: false,
      form: {},
      fileList: [],
      rules: {
        avatar: [{
          required: true,
          message: this.$t('system.message1'),
          trigger: 'change'
        }]
      }
    }
  },
  mounted() {
    this.getInfo()
  },
  methods: {
    /**
     * 获取信息
     */
    getInfo() {
      this.$get('iot-saas-basic/admin/platform/find').then(res => {
        res = res || {}
        this.form = res
      })
    },

    onSubmit() {
      let that = this;
      let url = 'iot-saas-basic/admin/platform/save',
        params = JSON.parse(JSON.stringify(this.form))
      this.clickSubmit = true
      this.$post(url, params).then(res => {
        this.clickSubmit = false
        this.$message({
          message: that.$t('public.submittedSuccess'),
          type: 'success'
        })
      }).catch(err => {
        this.clickSubmit = false
      })
    }
  }
}
</script>

<style scoped></style>
