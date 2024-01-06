<template>
  <div>
    <el-row class="pl-30 pr-30 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="12" :lg="10">
        <el-form ref="form" :rules="rules" :model="form" label-position="left" label-width="100px">
          <h4>{{ $t('public.basicInformation') }}</h4>
          <el-form-item :label="$t('public.deviceType')" prop="deviceTypeCode">
            <el-select :placeholder="$t('public.deviceType')" v-model="form.deviceTypeCode"
              :disabled="orderId ? true : false">
              <el-option v-for="(item, code) in myDeviceId" :label="item" :value="code">{{ item }}</el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('leaseOrder.deviceNum')" prop="deviceNum">
            <el-input v-model="form.deviceNum" :placeholder="$t('leaseOrder.deviceNumText')" />
          </el-form-item>
          <el-form-item :label="$t('public.totalAmount')" prop="amountTotal">
            <el-input type="number" v-model="form.amountTotal" :placeholder="$t('leaseOrder.inputText')" />
          </el-form-item>
          <el-form-item :label="$t('leaseOrder.deductionPeriod')" prop="deductionCycle">
            <div class="flex">
              <div class="flex1">
                <el-input type="number" v-model="form.deductionCycle">
                  <template slot="prepend">{{ $t('public.every') }}</template>
                  <template slot="append">{{ $t('public.day') }}</template>
                </el-input>
              </div>
              <div class="pl-10 flex1">
                <el-input type="number" v-model="form.deductionAmount">
                  <template slot="prepend">{{ $t('leaseOrder.deduction') }}</template>
                  <template slot="append">{{ $t('public.element') }}</template>
                </el-input>
              </div>
            </div>
          </el-form-item>
          <el-form-item :label="$t('leaseOrder.deductionPhase')" :disabled="orderId ? true : false">
            <el-date-picker v-model="form.deductionTimeStr" type="date" format="yyyy-MM-dd" value-format="timestamp"
              :placeholder="$t('leaseOrder.selectDate')">
            </el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit('form')" :disabled="clickSubmit">{{ $t('public.submitNow')
            }}</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { unixTime } from '@/utils/index'
export default {
  data() {
    return {
      orderId: this.$route.query.orderId || '',
      clickSubmit: false,
      form: {
        marketCode: 'DEVICE_LEASE',
        createType: this.$route.query.createType || 0,
        deductionId: this.$route.query.deductionId,
        deductionTimeStr: (this.currentTime() + 86400) * 1000
      },
    }
  },
  computed: {
    siteInfo() {
      return this.$store.getters.siteInfo
    },
    agentInfo() {
      return this.$store.getters.agentInfo
    },
    myDeviceId() {
      return this.$store.getters.myDeviceId
    },
    myDevice() {
      return this.$store.getters.myDevice
    },
    myProfitRatio() {
      return this.$store.getters.myProfitRatio
    },
    rules() {
      return {
        deviceTypeCode: [
          { required: true, message: this.$t('qrcode.plseaseDeviceType'), trigger: 'change' }
        ],
        amountTotal: [
          { required: true, message: this.$t('leaseOrder.inputText'), trigger: 'blur' }
        ],
        deviceNum: [
          { required: true, message: this.$t('leaseOrder.message'), trigger: 'blur' }
        ],
        deductionCycle: [
          { required: true, message: this.$t('leaseOrder.message1'), trigger: 'blur' }
        ],
        deductionAmount: [
          { required: true, message: this.$t('leaseOrder.message2'), trigger: 'blur' }
        ]
      }
    },
  },
  mounted() {
    if (this.orderId) {
      this.getInfo()
    }
  },
  methods: {
    /**
     * 获取信息
     */
    getInfo() {
      this.$get(`iot-saas-order/admin/order/device/rent/detail/${this.orderId}`).then(res => {
        if (res.deductionTime) res.deductionTimeStr = unixTime(res.deductionTime) * 1000
        delete res.deductionTime
        this.form = res
      })
    },

    /**
     * 提交添加
     */
    onSubmit() {
      let that = this;
      let params = {}, url = 'iot-saas-order/admin/order/device/rent/save'
      params = JSON.parse(JSON.stringify(this.form))
      if (params.deductionTimeStr) {
        params.deductionTimeStr = this.parseTime(params.deductionTimeStr / 1000)
      }
      this.clickSubmit = true
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (params.deductionAmount > params.amountTotal) {
            this.$message({
              message: that.$t('leaseOrder.message3'),
              type: 'error'
            })
            return
          }
          if (this.orderId) {
            url = `iot-saas-order/admin/order/device/rent/update/${this.orderId}`
          }
          this.clickSubmit = true
          this.$post(url, params).then(res => {
            this.$message({
              message: that.$t('leaseOrder.submittedSuccess'),
              type: 'success'
            })
            this.$router.push({
              path: '/leaseOrder/index'
            })
          }).catch(err => {
            setTimeout(() => {
              this.clickSubmit = false
            }, 1000)
          })
        } else {
          this.clickSubmit = false
        }
      })
    }
  }
}
</script>

<style scoped></style>
