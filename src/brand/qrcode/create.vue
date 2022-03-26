<template>
  <el-row type="flex" justify="center" align="middle" class="p-30 custom-form bg-white">
    <el-col :xs="24" :sm="18" :md="14" :lg="10" :xl="8">
      <el-form ref="form" :model="form" :rules="rules" :hide-required-asterisk="true" label-width="auto">
        <el-form-item label="设备类型" ref="deviceTypeId" prop="deviceTypeId">
          <el-select v-model="form.deviceTypeId" placeholder="请选择设备类型">
            <template v-for="item in myDevice">
              <el-option :label="item.name" :value="item.id"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="生成数量" ref="amount" prop="amount">
          <el-input v-model="form.amount" placeholder="生成二维码的数量" />
        </el-form-item>
        <el-form-item label="设备工厂" ref="deviceFactoryId" prop="deviceFactoryId">
          <el-select v-model="form.deviceFactoryId" placeholder="请选择设备工厂">
            <template v-for="item in factoryList">
              <el-option :label="item.name" :value="item.id"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="仓口数量" v-if="form.deviceFactoryId == 'Shark'" ref="bayonet" prop="bayonet">
          <el-input v-model="form.bayonet" placeholder="设备仓口数量" />
        </el-form-item> -->
        <label class="flex justify-center align-center mb-15 cursor">
          <el-checkbox v-model="form.picture"/><span class="ml-10">生成二维码图片</span>
        </label>
        <div class="p-10 mb-10 fs-s3 text-gray">注：勾选时，由于生成二维码图片较慢，建议每次生成数量不要超过100，适合需要下载二维码图片的设备类型。不勾选时，建议数量不要超过5000。</div>
        <div class="p-10 pt-10 mt-50 flex">
          <el-button class="flex1" type="primary" @click="onSubmit" :disabled="clickSubmit">生成</el-button>
        </div>
      </el-form>
    </el-col>
  </el-row>
</template>

<script>
  export default {
    components: {

    },
    data() {
      return {
        rules: {
          devicedeviceFactoryId: [{
            required: true,
            message: '请选择设备类型',
            trigger: 'blur'
          }],
          amount: [{
            required: true,
            message: '请输入生成二维码的数量',
            trigger: 'blur'
          }],
          deviceFactoryId: [{
            required: true,
            message: '请选择工厂',
            trigger: 'blur'
          }],
          bayonet: [{
            required: true,
            message: '请输入充电宝口数量',
            trigger: 'blur'
          }]
        },

        clickSubmit: false,
        form: {
          picture: false,
          brandId: this.$route.query.brandId || '',
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
        this.$get('iot-saas-device/admin/device/factory/loadAll').then(res => {
          this.factoryList = res
        })
      },

      /**
       * 点击提交按钮
       */
      onSubmit() {
        let params = JSON.parse(JSON.stringify(this.form))
        this.clickSubmit = true
        this.amount = parseInt(params.amount)
        this.$refs['form'].validate((valid, object) => {
          if (valid) {
            this.loadObj = this.$loading({
              lock: true,
              text: '生成中，请耐心等待',
              spinner: 'el-icon-loading'
            })
            this.createSn(params)
          } else {
            this.formErrow(object)
          }
        })
      },

      /**
       * 点击提交创建二维码
       */
      createSn(params){
        let last = false
        this.base_amount = 1000
        if(params.picture){
          this.base_amount = 50
        }
        if(this.amount > this.base_amount){
          params.amount = this.base_amount
          this.amount = this.amount - this.base_amount
        } else {
          params.amount = this.amount
          last = true
        }
        this.$post('iot-saas-device/admin/qrcode', params).then(res => {
          if(!last){
            this.createSn(params)
          } else {
            this.$message({
              message: '生成完成',
              type: 'success'
            })
            this.clickSubmit = false
            this.loadObj.close()
            this.$router.push({path: `/device/createRecord`})
          }
        }).catch(err => {
          this.clickSubmit = false
          this.loadObj.close()
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
