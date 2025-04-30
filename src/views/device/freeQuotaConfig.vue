<template>
  <el-row class="pl-20 pr-20 custom-form bg-white">
    <el-col :sm="24" :md="16" :lg="14" :xl="10">
      <el-tabs class="mb-10 fs-b2" v-model="deviceTypeCode" @tab-click="getInfo">
        <el-tab-pane :label="item" :name="name" v-for="(item, name) in myDeviceId" />
      </el-tabs>

      <template v-if="checkAbility([`${deviceTypeCode}_FREEQUOTA`], 3)">
        <el-form ref="form" :rules="rules" :model="form" label-position="left" label-width="130px">
          <h4>{{ $t('device.freeQuotaSet') }}</h4>
          <el-form-item :label="$t('public.free')" prop="freeTime">
            <el-input v-model="form.freeTime" type="number">
              <template slot="append">{{ $t('public.huor') }}</template>
            </el-input>
          </el-form-item>
          <el-form-item :label="$t('device.canBeUsed')" prop="freeTimes">
            <el-input v-model="form.freeTimes" type="number">
              <template slot="append">{{ $t('public.few') }}</template>
            </el-input>
          </el-form-item>

          <h4>{{ $t('device.agentAddFree') }}</h4>
          <el-form-item :label="$t('device.storeMax')" prop="agentConfigFreeQuotaNum">
            <el-input v-model="form.agentConfigFreeQuotaNum" type="number">
              <template slot="append">{{ $t('device.theNumber') }}</template>
            </el-input>
          </el-form-item>
          <el-form-item :label="$t('device.agentConfigFreeTime')" prop="agentConfigFreeTime">
            <el-input v-model="form.agentConfigFreeTime" type="number">
              <template slot="append">{{ $t('public.huor') }}</template>
            </el-input>
          </el-form-item>
          <el-form-item :label="$t('device.agentConfigFreeTimes')" prop="agentConfigFreeTimes">
            <el-input v-model="form.agentConfigFreeTimes" type="number">
              <template slot="append">{{ $t('public.few') }}</template>
            </el-input>
          </el-form-item>
          <el-form-item class="mt-10">
            <el-button type="primary" @click="onSubmit" :disabled="clickSubmit">{{ $t('public.submitNow') }}</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template v-else>
        <div>{{ $t('public.zwPurchase') }}</div>
      </template>
    </el-col>
  </el-row>
</template>

<script>
export default {
  name: 'freeQuotaConfig',
  data() {
    return {
      clickSubmit: false,
      form: {},
      deviceTypeCode: ''
    }
  },
  computed: {
    myDeviceId() {
      return this.$store.getters.myDeviceId
    },
    Ability() {
      return this.$store.getters.Ability
    },
    rules() {
      return {
        freeTime: [{
          required: true,
          message: this.$t('device.message10'),
          trigger: 'blur'
        }],
        freeTimes: [{
          required: true,
          message: this.$t('device.message11'),
          trigger: 'blur'
        }],
        agentConfigFreeQuotaNum: [{
          required: true,
          message: this.$t('device.message12'),
          trigger: 'blur'
        }],
        agentConfigFreeTime: [{
          required: true,
          message: this.$t('device.message13'),
          trigger: 'blur'
        }],
        agentConfigFreeTimes: [{
          required: true,
          message: this.$t('device.message14'),
          trigger: 'blur'
        }]
      }
    }
  },
  mounted() {
    this.deviceTypeCode = Object.keys(this.myDeviceId)[0]
    this.getInfo()
  },
  methods: {
    /**
     * 获取详情
     */
    getInfo() {
      this.$get(`iot-saas-basic/admin/free/quota/config/v1/find`, {
        deviceTypeCode: this.deviceTypeCode
      }).then((res = {}) => {
        if (res.deviceTypeCode != undefined) {
          res.agentConfigFreeTime = parseInt(res.agentConfigFreeTime) / 60
          res.freeTime = parseInt(res.freeTime) / 60
          this.form = res
        } else {
          this.form = {}
        }
      })
    },

    /**
     * 提交保存
     */
    onSubmit() {
      let that = this;
      let params = JSON.parse(JSON.stringify(this.form))
      params.deviceTypeCode = this.deviceTypeCode
      params.freeTime = parseFloat(params.freeTime) * 60
      params.agentConfigFreeTime = parseFloat(params.agentConfigFreeTime) * 60
      this.clickSubmit = true
      this.$refs['form'].validate((valid, object) => {
        if (valid) {
          this.$post(`iot-saas-basic/admin/free/quota/config/v1/update`, params).then(res => {
            this.$message({
              message: that.$t('public.setSuccess'),
              type: 'success'
            })
            this.clickSubmit = false
          }).catch(err => {
            this.clickSubmit = false
          })
        } else {
          this.clickSubmit = false
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
/deep/ .el-tabs__item {
  height: 50px;
  line-height: 50px;
  font-size: 16px;
}
</style>
