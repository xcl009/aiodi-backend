<template>
  <el-row class="pl-20 pr-20 custom-form bg-white">
    <el-col :sm="24" :md="16" :lg="14" :xl="10">
      <el-tabs class="mb-10" v-model="deviceTypeCode" @tab-click="getInfo">
        <el-tab-pane :label="item" :name="name" v-for="(item, name) in myDeviceId" />
      </el-tabs>

      <template v-if="true">
        <el-form ref="form" label-position="left" label-width="130px">
          <el-form-item :label="$t('device.deviceCost')">
            <el-input v-model="form.deviceCost" type="number">
              <template slot="append">{{ $t('public.element') }}</template>
            </el-input>
          </el-form-item>

          <el-form-item :label="`${$t('device.onlySuperior')}`">
            <el-radio-group v-model="form.onlySuperior" size="medium">
              <el-radio-button :label="idx"
                v-for="(item, idx) in [$t('device.typeText'), $t('device.typeText1'), $t('device.typeText2')]">{{ item
                }}</el-radio-button>
            </el-radio-group>
            <div class="mt-10 line-six fs-s3">{{ $t('public.select') }}<span class="text-danger">{{ $t('device.typeText1')
            }}</span>{{ $t('device.text7') }}{{ form.deviceCost }}{{ $t('device.text8') }}</div>
            <div class="mt-5 line-six fs-s3">{{ $t('public.select') }}<span class="text-danger">{{ $t('device.typeText2')
            }}</span>{{ $t('device.text7') }}{{ form.deviceCost }}{{ $t('device.text9') }}</div>
          </el-form-item>

          <el-form-item class="mt-10">
            <el-button type="primary" @click="onSubmit">{{ $t('public.submitNow') }}</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template v-else>
        <div class="pb-20 cursor" @click="$router.push({ path: `/market/appList` })">{{ $t('public.zwPurchase') }}，<span
            class="text-primary">{{ $t('public.goBuy') }}</span></div>
      </template>
    </el-col>
  </el-row>
</template>

<script>
import { pickKeys } from "@/utils/index"
export default {
  name: 'steal',
  data() {
    return {
      form: {
        onlySuperior: 2
      },
      id: this.$route.query.id || '',
      deviceTypeCode: ''
    }
  },
  computed: {
    myDeviceId() {
      return this.$store.getters.myDeviceId
    },
    Ability() {
      return this.$store.getters.Ability
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
      this.$get(`iot-saas-basic/admin/brand/queryDeviceTypeCost`, {
        deviceTypeCode: this.deviceTypeCode
      }).then((res = {}) => {
        if (res.deviceTypeCode != undefined) {
          this.form = res
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
      this.$post(`iot-saas-basic/admin/brand/updateDeviceCost`, params).then(res => {
        this.$message({
          message: that.$t('public.setSuccess'),
          type: 'success'
        })
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
