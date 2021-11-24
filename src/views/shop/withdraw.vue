<template>
  <div class="p-5">
    <el-row class="pt-30 pb-30 bg-white">
      <el-col :span="12" :offset="5">
        <el-form ref="form" :model="form" label-width="180px">
          <el-form-item label="银行卡号：">
            <el-input v-model="form.bank_id"></el-input>
          </el-form-item>
          <el-form-item label="所属银行：">
            <el-input v-model="form.bank_name"></el-input>
          </el-form-item>
          <el-form-item label="所属分行：">
            <el-input v-model="form.bank_branch_name"></el-input>
          </el-form-item>
          <el-form-item label="微信收款名：">
            <el-input v-model="form.wx_account_name"/>
          </el-form-item>
          <el-form-item label="微信收款码：">
            <upload v-model="form.wx_account_qrcode"></upload>
          </el-form-item>
          <el-form-item label="支付宝收款名：">
            <el-input v-model="form.zfb_account_name" />
          </el-form-item>
          <el-form-item label="支付宝收款码：">
            <upload v-model="form.zfb_account_qrcode"></upload>
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
  import upload from '@/components/upload/two'
  export default {
    components: {
      upload
    },
    data() {
      return {
        aid: this.$route.query.aid || '',
        form: {
        }
      }
    },
    computed: {

    },
    mounted() {
      this.getInfo()
    },
    methods: {
      getInfo() {
        this.$get('agentapi/sttuf/my_son_detail', {
          son_id: this.aid
        }).then(res => {
          this.form = res
        })
      },

      onSubmit() {
        let params = this.form
        params.son_id = this.aid
        this.$post('agentapi/apply/modify_son_account_fileds', this.form).then(res => {
          this.$message({
            message: '修改成功',
            type: 'success'
          })
          history.go(-1)
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
