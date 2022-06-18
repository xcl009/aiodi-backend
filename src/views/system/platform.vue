<template>
  <el-row class="p-30 custom-form bg-white">
    <el-col :xs="24" :sm="18" :md="12" :lg="10">
      <el-form ref="form" :model="form" label-position="left" label-width="130px">
        <el-form-item label="小程序Logo">
          <upload v-model="form.appLogo" ratio="1:1" :upObj="{fileType: 'appLogo'}"/>
        </el-form-item>
        <el-form-item label="小程序名称">
          <el-input v-model="form.appName" placeholder="请填写小程序名称" />
        </el-form-item>
        <el-form-item label="公众号二维码">
          <upload v-model="form.officialAccountQrcode" ratio="1:1" :upObj="{fileType: 'wxQrCode'}"/>
        </el-form-item>
        <el-form-item label="公众号名称">
          <el-input v-model="form.officialAccountName" placeholder="请填写公众号名称" />
        </el-form-item>
        <el-form-item label="客服电话">
          <el-input v-model="form.customerServiceTelephone" placeholder="请填写客服电话" />
        </el-form-item>
        <el-form-item label="客服微信号">
          <el-input v-model="form.customerServiceWechatNumber" placeholder="请填写客服微信号" />
        </el-form-item>
        <el-form-item label="公司名称">
          <el-input v-model="form.companyName" placeholder="请填写公司名称" />
        </el-form-item>
        <el-form-item label="公司地址">
          <el-input v-model="form.companyAddress" placeholder="请填写公司地址" />
        </el-form-item>
        <el-form-item label="小程序介绍">
          <tinymce v-model="form.appIntroduce" :height="300" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit('form')" :disabled="clickSubmit">提交</el-button>
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
            message: '请上传小程序logo',
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
        let url = 'iot-saas-basic/admin/platform/save',
          params = JSON.parse(JSON.stringify(this.form))
        this.clickSubmit = true
        this.$post(url, params).then(res => {
          this.clickSubmit = false
          this.$message({
            message: '提交成功',
            type: 'success'
          })
        }).catch(err=>{
          this.clickSubmit = false
        })
      }
    }
  }
</script>

<style scoped>

</style>
