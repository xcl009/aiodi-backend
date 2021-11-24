<template>
  <div class="p-10">
    <el-row class="pl-30 pr-30 bg-white">
      <el-col>
        <el-form ref="form" :model="form" label-width="auto">
          <h4 class="mb-30">贴牌代理续费金额设置</h4>

          <el-form-item class="mr-30" :label="item.service_name" v-for="item in list">
            <el-input v-model="item.service_price">
              <template slot="append">元</template>
            </el-input>
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
        list: [],
        form: {}
      }
    },
    mounted() {
      this.setInfo()
    },
    methods: {
      /**
       * 获取信息
       */
      setInfo() {
        this.$get('agentapi/system/contract_config', {
          platform_agent_id: this.$route.query.id
        }).then(res => {
          this.list = res
        })
      },

      /**
       * 提交编辑
       */
      onSubmit() {
        let params = {}
        if(this.$route.query.id) params.platform_agent_id = this.$route.query.id
        for(var i in this.list){
          params[this.list[i].service_id] = this.list[i].service_price
        }
        this.$post('agentapi/system/contract_config', params).then(res => {
          this.$message({
            message: '提交成功',
            type: 'success'
          })
          this.$store.dispatch('user/getPlatformConfig')
        })
      }
    }
  }
</script>

<style scoped>

</style>
