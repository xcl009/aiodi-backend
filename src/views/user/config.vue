<template>
  <div class="p-10">
    <el-row class="pl-30 pr-30 bg-white">
      <el-col>
        <el-form ref="form" :model="form" label-width="auto">
          <span class="dnone">{{ agentInfo.id }}</span>
          <template v-if="!checkRoles(['terminal', 'partners'])">
            <h4>{{ $t('user.setDevice') }}</h4>
            <el-form-item :label="$t('user.defaultStore')">
              <el-input oninput="value=value.replace(/[^\d.]/g,'')" v-model="form.default_store_id"></el-input>
              <div class="fs-s2 text-gray">{{ $t('user.defaultStoreText') }}</div>
            </el-form-item>
          </template>
          <template v-if="!checkRoles(['partners'])">
            <h4>{{ $t('layout.dataSimulation') }}</h4>
            <el-form-item :label="`${$t('public.status')}:`">
              <el-switch v-model="form.is_show_virtual_data" :active-value="1" :inactive-value="0" />
            </el-form-item>
            <el-form-item :label="`${$t('layout.doublingMultiple')}:`">
              <el-input oninput="value=value.replace(/[^\d.]/g,'')" v-model="form.show_virtual_data_times"></el-input>
              <div class="fs-s2 text-gray">{{ $t('user.text1') }}</div>
            </el-form-item>
          </template>
          <el-form-item>
            <el-button type="primary" @click="onSubmit">{{ $t('public.submit') }}</el-button>
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
    agentInfo() {
      let agentInfo = this.$store.state.user.agentInfo
      let params = {}
      for (var i in this.form_key) {
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
    getPower() {
      this.$get('agentapi/add_agent').then(res => {
        this.powerInfo = res
      })
    },

    onSubmit() {
      let that = this;
      let params = JSON.parse(JSON.stringify(this.form))
      if (this.checkRoles(['terminal', 'partners']) || params.default_store_id == 0) delete params.default_store_id
      this.$post('agentapi/ucenter/save_key_value', params).then(res => {
        this.$message({
          message: that.$t('public.operationSuccessful'),
          type: 'success'
        })
      })
    }
  }
}
</script>

<style scoped></style>
