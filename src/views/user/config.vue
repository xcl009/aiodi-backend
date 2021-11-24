<template>
  <div class="p-10">
    <el-row class="pl-30 pr-30 bg-white">
      <el-col>
        <el-form ref="form" :model="form" label-width="auto">
          <span class="dnone">{{ agentInfo.id }}</span>
          <template v-if="!checkRoles(['terminal','merchants'])">
            <h4>设备设置</h4>
            <el-form-item label="默认商户ID:">
              <el-input oninput="value=value.replace(/[^\d.]/g,'')" v-model="form.default_store_id"></el-input>
              <div class="fs-s2 text-gray">注：设备未铺货时，用户租借订单取此商户的计费规则，商户ID可在商户列表查到。</div>
            </el-form-item>
          </template>
          <template v-if="!checkRoles(['merchants'])">
            <h4>数据模拟</h4>
            <el-form-item label="状态:">
              <el-switch v-model="form.is_show_virtual_data" :active-value="1" :inactive-value="0"/>
            </el-form-item>
            <el-form-item label="翻倍倍数:">
              <el-input oninput="value=value.replace(/[^\d.]/g,'')" v-model="form.show_virtual_data_times"></el-input>
              <div class="fs-s2 text-gray">注：状态开启时，首页、设备列表、订单列表、商户列表的统计数据会在当前基础上乘以设置的倍数。</div>
            </el-form-item>
          </template>
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
        form_key: {
          'default_store_id': '',
          'is_show_virtual_data': '',
          'show_virtual_data_times': '',
        },
        powerInfo: {}
      }
    },
    computed: {
      agentInfo(){
        let agentInfo = this.$store.state.user.agentInfo
        let params = {}
        for(var i in this.form_key){
          params[i] = agentInfo[i]
        }
        this.form = params
        return agentInfo
      }
    },
    mounted() {
      this.getPower()
    },
    methods: {
      getPower(){
        this.$get('agentapi/add_agent').then(res => {
          this.powerInfo = res
        })
      },

      onSubmit() {
        let params = JSON.parse(JSON.stringify(this.form))
        if(this.checkRoles(['terminal','merchants']) || params.default_store_id == 0) delete params.default_store_id
        this.$post('agentapi/ucenter/save_key_value', params).then(res => {
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
