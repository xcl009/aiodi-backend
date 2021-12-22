<template>
  <div class="p-10">
    <el-row class="p-30 bg-white">
      <el-col>
        <el-form ref="form" :model="form" label-width="auto">
          <el-form-item label="授权标题：">
            <el-input v-model="form.order_title" placeholder="输入授权标题"/>
          </el-form-item>
          <el-form-item label="微信用户ID：">
            <el-input v-model="form.to_uid" placeholder="输入用户ID"/>
          </el-form-item>
          <el-form-item label="授权金额：">
            <el-input v-model="form.order_amount" placeholder="输入授权金额"/>
          </el-form-item>
          <el-form-item label="结算时间：">
            <el-date-picker
              v-model="form.expect_finish_date"
              value-format="timestamp"
              type="datetime"
              :unlink-panels="true"
              placeholder="选择结算时间">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="备注：">
            <el-input v-model="form.remark"/>
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
    components: {

    },
    data() {
      return {
        form: {},
        id: this.$route.query.id || ''
      }
    },
    mounted() {
      if(this.id > 0){
        this.getInfo()
      }
    },
    methods: {
      /**
       * 获取商户信息
       */
      getInfo() {
        this.$get('agentapi/ad_detail', {
          id: this.id
        }).then(res => {
          this.time = [res.info.start_date * 1000, res.info.end_date * 1000]
          this.fileList = [{ url: res.info.img_url }]
          res.info.is_all = res.info.is_all == 1 ? true : false
          this.form = res.info
        })
      },

      onSubmit() {
        let params = this.form, url = 'agentapi/fund/add_order'
        params.expect_finish_date = this.parseTime(params.expect_finish_date)
        if(this.id > 0){
          params.id = this.id
          url = 'agentapi/edit_ad'
        }
        this.$post(url, params).then(res => {
          this.$message({
            message: '提交成功',
            type: 'success'
          })
          this.$router.push({ path: '/order/accredit' })
        })
      }
    }
  }
</script>

<style scoped>
</style>
