<template>
  <el-row type="flex" justify="center" align="middle" class="p-30 custom-form bg-white">
    <el-col :xs="24" :sm="18" :md="14" :lg="10" :xl="8">
      <el-form ref="form" :model="form" :rules="rules" :hide-required-asterisk="true" label-width="auto">
        <el-form-item label="设备类型" ref="deviceTypeCode" prop="deviceTypeCode">
          <el-select v-model="form.deviceTypeCode" placeholder="请选择设备类型">
            <template v-for="item in myDevice">
              <el-option :label="item.name" :value="item.deviceTypeCode" v-if="item.fatherCode"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="生成数量" ref="number" prop="number">
          <el-input type="number" v-model="form.number" placeholder="生成二维码的数量" />
        </el-form-item>
        <el-form-item label="设备工厂" ref="deviceFactoryCode" prop="deviceFactoryCode">
          <el-select v-model="form.deviceFactoryCode" placeholder="请选择设备工厂">
            <template v-for="item in factoryList">
              <el-option :label="item.name" :value="item.code" v-if="form.deviceTypeCode && item.deviceTypeList[form.deviceTypeCode.substr(0, 2)]"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="仓口数量" v-if="form.deviceTypeCode && form.deviceTypeCode.indexOf('PA') > -1" ref="windosNumber" prop="windosNumber">
          <el-input type="number" v-model="form.windosNumber" placeholder="请输入设备仓口数量" />
        </el-form-item>
        <el-form-item label="仓口数量" v-if="form.deviceTypeCode && form.deviceTypeCode.indexOf('VM') > -1" ref="positionQty" prop="positionQty">
          <el-input type="number" v-model="form.positionQty" placeholder="请输入设备仓口数量" />
        </el-form-item>
        <el-form-item label="单口商品数" v-if="form.deviceTypeCode && form.deviceTypeCode.indexOf('VM') > -1" ref="merchandiseQty" prop="merchandiseQty">
          <el-input type="number" v-model="form.merchandiseQty" placeholder="请输入单口商品数量" />
        </el-form-item>
        <label class="flex justify-center align-center mb-15 cursor">
          <el-checkbox v-model="form.picture"/><span class="ml-10">生成二维码图片</span>
        </label>
        <div class="p-10 mb-10 fs-s3 text-gray">注：二维码单次生成数量最大5000。勾选二维码图片生成时，图片生成需要时间，提交生成后10分钟左右可下载二维码图片。</div>
        <div class="p-10 pt-10 mt-50 flex">
          <el-button class="flex1" type="primary" @click="onSubmit" :disabled="clickSubmit">生成</el-button>
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
        rules: {
          deviceTypeCode: [{
            required: true,
            message: '请选择设备类型',
            trigger: 'blur'
          }],
          number: [{
            required: true,
            message: '请输入生成二维码的数量',
            trigger: 'blur'
          }],
          deviceFactoryCode: [{
            required: true,
            message: '请选择工厂',
            trigger: 'blur'
          }],
          windosNumber: [{
            required: true,
            message: '请输入设备仓口数量',
            trigger: 'blur'
          }]
        },

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
      myDevice(){
        return this.$store.state.user.myDevice
      },
      myDeviceName(){
        return this.$store.state.user.myDeviceName
      }
    },
    mounted() {
      this.getFactory()
    },
    methods: {
      /**
       * 获取工厂
       */
      getFactory(){
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
        let params = JSON.parse(JSON.stringify(this.form))
        if(params.windosNumber) params.positionQty = params.windosNumber
        this.clickSubmit = true
        this.$refs['form'].validate((valid, object) => {
          if (valid) {
            this.loadObj = this.$loading({
              lock: true,
              text: '生成中，请耐心等待',
              spinner: 'el-icon-loading'
            })
            this.$post('iot-saas-device/admin/qrcode', params).then(res => {
              this.$message({
                message: '操作完成',
                type: 'success'
              })
              this.loadObj.close()
              this.clickSubmit = false
              this.$router.push({path: `/device/qrAddRecord`})
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
  .custom-form{
    min-height: 81vh;
    /deep/ .el-select{
      width: 100%;
    }
  }
</style>
