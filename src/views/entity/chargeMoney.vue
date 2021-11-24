<template>
  <div class="p-10">
    <div class="pt-30 pb-10 bg-white">
      <el-form ref="form" label-width="100px">
        <div class="flex" v-for="item in 4">
          <el-form-item label="充值：">
            <el-input class="mr-10" v-model="form[`washing_invest_${item}`]">
            <template slot="append">元</template>
            </el-input>
          </el-form-item>
          <el-form-item label="送：">
            <el-input class="mr-10" v-model="form[`washing_favourable_${item}`]">
            <template slot="append">元</template>
            </el-input>
          </el-form-item>
        </div>
        <el-form-item>
          <el-button type="primary" @click="postEdit()">立即提交</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  export default {
    components: {

    },
    data() {
      return {
        form: {},
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
        this.$get('agentapi/get_partner_config', {}).then(res => {
          let form = {}
          for(var i = 1; i < 5; i++){
            form[`washing_invest_${i}`] = res[`washing_invest_${i}`]
            form[`washing_favourable_${i}`] = res[`washing_favourable_${i}`]
          }
          this.form = form
        })
      },

      /**
       * 提交信息
       */
      postEdit(){
        let params = this.form
        this.$post('agentapi/system/save_partner_investing_setting', params).then(res => {
          this.$message({
            message: '提交成功',
            type: 'success'
          })
        })
      }
    }
  }
</script>

<style scoped>

</style>
