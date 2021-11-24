<template>
  <div class="app-container">
    <el-row class="pt-30 bg-white">
      <el-col :span="16">
        <el-form ref="form" :model="form" label-width="180px">
          <el-form-item label="二维码SN：">
            <el-input v-model="form.code_sn" :disabled="true" />
          </el-form-item>
          <el-form-item label="设备SN：">
            <el-input v-model="form.device_id" />
          </el-form-item>
          <el-form-item label="代理ID：">
            <el-input v-model="form.agent_id" />
          </el-form-item>
          <el-form-item label="是否分配：">
            <el-checkbox v-model="form.status" :true-label="1" :false-label="0" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit">提交</el-button>
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
        form: {},
        code_sn: this.$route.query.code_sn || ''
      }
    },
    mounted() {
      if(this.code_sn && window.codeInfo){
        this.form = window.codeInfo
      }
    },
    methods: {
      onSubmit() {
        let params = JSON.parse(JSON.stringify(this.form)), url = 'QRcode/edit_qrcode'
        params.code_agent_id = params.agent_id
        this.$post(url, params).then(res => {
          this.$message({
            message: '提交成功',
            type: 'success'
          })
          history.back()
        })
      }
    }
  }
</script>

<style scoped>
  /deep/ .el-form{
    width: 580px;
  }
</style>
