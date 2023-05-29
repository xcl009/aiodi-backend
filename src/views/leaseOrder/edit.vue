<template>
  <div>
    <el-row class="pl-30 pr-30 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="12" :lg="10">
        <el-form ref="form" :rules="rules" :model="form" label-position="left" label-width="100px">
          <h4>基础信息</h4>
          <el-form-item label="设备类型" prop="deviceTypeCode">
            <el-select placeholder="设备类型" v-model="form.deviceTypeCode" :disabled="orderId ? true: false">
              <el-option v-for="(item, code) in myDeviceId" :label="item" :value="code">{{ item }}</el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="设备数量" prop="deviceNum">
            <el-input v-model="form.deviceNum" placeholder="输入设备数量" />
          </el-form-item>
          <el-form-item label="总金额" prop="amountTotal">
            <el-input type="number" v-model="form.amountTotal" placeholder="请输入订单总金额" />
          </el-form-item>
          <el-form-item label="扣款周期" prop="deductionCycle">
            <div class="flex">
              <div class="flex1">
                <el-input type="number" v-model="form.deductionCycle">
                  <template slot="prepend">每</template>
                  <template slot="append">天</template>
                </el-input>
              </div>
              <div class="pl-10 flex1">
                <el-input type="number" v-model="form.deductionAmount">
                  <template slot="prepend">扣款</template>
                  <template slot="append">元</template>
                </el-input>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="扣款第一期" :disabled="orderId ? true: false">
            <el-date-picker
              v-model="form.deductionTimeStr"
              type="date"
              format="yyyy-MM-dd"
              value-format="timestamp"
              placeholder="选择日期">
            </el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit('form')" :disabled="clickSubmit">立即提交</el-button>
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
        rules: {
          deviceTypeCode: [
            { required: true, message: '请选择设备类型', trigger: 'change' }
          ],
          amountTotal: [
            { required: true, message: '请输入订单总金额', trigger: 'blur' }
          ],
          deviceNum: [
            { required: true, message: '请填写设备数量', trigger: 'blur' }
          ],
          deductionCycle: [
            { required: true, message: '请填写扣款周期', trigger: 'blur' }
          ],
          deductionAmount: [
            { required: true, message: '请填写周期扣款金额', trigger: 'blur' }
          ]
        }
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
      }
    },
    mounted() {
      if(this.orderId){
        this.getInfo()
      }
    },
    methods: {
      /**
       * 获取信息
       */
      getInfo() {
        this.$get(`iot-saas-order/admin/order/device/rent/detail/${this.orderId}`).then(res => {
          if(res.deductionTime) res.deductionTimeStr = unixTime(res.deductionTime) * 1000
          delete res.deductionTime
          this.form = res
        })
      },

      /**
       * 提交添加
       */
      onSubmit() {
        let params = {}, url = 'iot-saas-order/admin/order/device/rent/save'
        params = JSON.parse(JSON.stringify(this.form))
        if(params.deductionTimeStr){
          params.deductionTimeStr = this.parseTime(params.deductionTimeStr / 1000)
        }
        this.clickSubmit = true
        this.$refs['form'].validate((valid) => {
          if (valid) {
            if(this.orderId){
              url = `iot-saas-order/admin/order/device/rent/update/${this.orderId}`
            }
            this.clickSubmit = true
            this.$post(url, params).then(res => {
              this.$message({
                message: '提交成功',
                type: 'success'
              })
              this.$router.push({
                path: '/leaseOrder/index'
              })
            }).catch( err => {
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

<style scoped>

</style>
