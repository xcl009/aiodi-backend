<template>
  <el-row type="flex" justify="center" align="middle" class="p-30 custom-form bg-white">
    <el-col :xs="24" :sm="18" :md="14" :lg="10" :xl="8">
      <el-form ref="form" :model="form" :rules="rules" :hide-required-asterisk="true" label-width="auto">
        <el-form-item :label="$t('public.deviceType')" ref="deviceTypeCode" prop="deviceTypeCode">
          <el-select v-model="form.deviceTypeCode" :placeholder="$t('qrcode.plseaseDeviceType')">
            <template v-for="item in myDevice">
              <el-option :label="item.name" :value="item.deviceTypeCode" v-if="item.fatherCode"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('qrcode.number')" ref="number" prop="number">
          <el-input type="number" v-model="form.number" :placeholder="$t('qrcode.numberText')" />
        </el-form-item>
        <el-form-item :label="$t('qrcode.equipmentFactory')" ref="deviceFactoryCode" prop="deviceFactoryCode">
          <el-select v-model="form.deviceFactoryCode" :placeholder="$t('qrcode.equipmentFactoryText')">
            <template v-for="item in factoryList">
              <el-option :label="item.name" :value="item.code"
                v-if="form.deviceTypeCode && item.deviceTypeList[form.deviceTypeCode.substr(0, 2)]"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('qrcode.numberOfWarehouses')"
          v-if="form.deviceTypeCode && form.deviceTypeCode.indexOf('PA') > -1" ref="windosNumber" prop="windosNumber">
          <el-input type="number" v-model="form.windosNumber" :placeholder="$t('qrcode.numberOfWarehousesText')" />
        </el-form-item>
        <el-form-item :label="$t('qrcode.numberOfWarehouses')"
          v-if="form.deviceTypeCode && form.deviceTypeCode.indexOf('VM') > -1" ref="positionQty" prop="positionQty">
          <el-input type="number" v-model="form.positionQty" :placeholder="$t('qrcode.numberOfWarehousesText')" />
        </el-form-item>
        <el-form-item :label="$t('shopping.numberOfProductsPerUnit')"
          v-if="form.deviceTypeCode && form.deviceTypeCode.indexOf('VM') > -1" ref="merchandiseQty" prop="merchandiseQty">
          <el-input type="number" v-model="form.merchandiseQty" :placeholder="$t('qrcode.numberOfProductsPerUnitText')" />
        </el-form-item>
        <label class="flex justify-center align-center mb-15 cursor">
          <el-checkbox v-model="form.picture" /><span class="ml-10">{{ $t('qrcode.generateqrCodeImage') }}</span>
        </label>
        <div class="p-10 mb-10 fs-s3 text-gray">{{ $t('qrcode.generateqrCodeImageText') }}</div>
        <div class="p-10 pt-10 mt-50 flex">
          <el-button class="flex1" type="primary" @click="onSubmit" :disabled="clickSubmit">{{ $t('public.generate')
          }}</el-button>
        </div>
      </el-form>
    </el-col>
  </el-row>
</template>

<script>
import { arrayToObj } from '@/utils/index'
export default {
  components: {

  },
  data() {
    return {
      clickSubmit: false,
      form: {
        picture: false,
        brandId: this.$route.query.brandId || '',
        positionQty: 1,
        merchandiseQty: 1,
      },
      factoryList: []
    }
  },
  computed: {
    myDevice() {
      return this.$store.state.user.myDevice
    },
    myDeviceName() {
      return this.$store.state.user.myDeviceName
    },
    rules() {
      return {
        deviceTypeCode: [{
          required: true,
          message: this.$t('qrcode.plseaseDeviceType'),
          trigger: 'blur'
        }],
        number: [{
          required: true,
          message: this.$t('qrcode.message'),
          trigger: 'blur'
        }],
        deviceFactoryCode: [{
          required: true,
          message: this.$t('shopping.pleaseSelectFactory'),
          trigger: 'blur'
        }],
        windosNumber: [{
          required: true,
          message: this.$t('qrcode.numberOfWarehousesText'),
          trigger: 'blur'
        }]
      }
    },
  },
  mounted() {
    this.getFactory()
  },
  methods: {
    /**
     * 获取工厂
     */
    getFactory() {
      this.$get('iot-saas-basic/admin/factory/list').then(res => {
        res.map(item => {
          return item.deviceTypeList = arrayToObj(item.deviceTypeList, 'deviceTypeCode')
        })
        this.factoryList = res
      })
    },

    /**
     * 点击提交按钮
     */
    onSubmit() {
      let that = this;
      let params = JSON.parse(JSON.stringify(this.form))
      if (params.windosNumber) params.positionQty = params.windosNumber
      this.clickSubmit = true
      this.$refs['form'].validate((valid, object) => {
        if (valid) {
          this.loadObj = this.$loading({
            lock: true,
            text: that.$t('public.generating'),
            spinner: 'el-icon-loading'
          })
          this.$post('iot-saas-device/admin/qrcode', params).then(res => {
            this.$message({
              message: that.$t('public.operationCompleted'),
              type: 'success'
            })
            this.loadObj.close()
            this.clickSubmit = false
            this.$router.push({ path: `/device/qrAddRecord` })
          }).catch(err => {
            this.clickSubmit = false
            this.loadObj.close()
          })
        } else {
          this.clickSubmit = false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.custom-form {
  min-height: 81vh;

  /deep/ .el-select {
    width: 100%;
  }
}
</style>
