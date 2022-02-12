<template>
  <div class="p-10">
    <el-row class="pt-30 pl-30 pr-30 bg-white">
      <el-col>
        <el-form ref="form" :model="form" :rules="rules" label-width="140px">
          <el-form-item label="设备类型：" ref="code_tag" prop="code_tag">
            <el-select v-model="form.code_tag" placeholder="请选择设备类型" @change="deviceChange">
              <template v-for="item in deviceList">
                <el-option :label="item.type_name" :value="item.code_tag"></el-option>
              </template>
            </el-select>
          </el-form-item>
          <el-form-item label="生成数量：" ref="num" prop="num">
            <el-input v-model="form.num" placeholder="生成二维码的数量" />
          </el-form-item>
          <el-form-item label="设备工厂：" ref="factory_id" prop="factory_id">
            <el-select v-model="form.factory_id" placeholder="请选择设备工厂">
              <template v-for="item in factoryList">
                <el-option :label="item.factory_name" :value="item.factory_id" v-if="item.support_device_type && item.support_device_type.indexOf(`${sel_depend_type},`) > -1"></el-option>
              </template>
            </el-select>
          </el-form-item>
          <el-form-item label="仓口数量：" v-if="form.factory_id == 'Shark'" ref="num" prop="num">
            <el-input v-model="form.bayonet" placeholder="设备仓口数量" />
          </el-form-item>
          <el-form-item label="生成二维码图片：">
            <el-checkbox v-model="form.open" :true-label="1" :false-label="0" />
            <div class="fs-s3 text-gray">注：勾选时，由于生成二维码图片较慢，建议每次生成数量不要超过100，适合需要下载二维码图片的设备类型。不勾选时，建议数量不要超过5000。</div>
          </el-form-item>
          <el-form-item label="logo：" v-show="form.open == 1">
            <upload v-model="form.logo"/><!-- :raw="true" @getFile="getFile" -->
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit">生成</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import upload from '@/components/upload/'
  export default {
    components: {
      upload
    },
    data() {
      return {
        sel_depend_type: 0,
        deviceList: [],
        form: {
          open: 0
        },
        aid: this.$route.query.aid,
        factoryList: [],

        rules: {
          code_tag: [{
            required: true,
            message: '请选择设备类型',
            trigger: 'blur'
          }],
          num: [{
            required: true,
            message: '请输入生成二维码的数量',
            trigger: 'blur'
          }],
          factory_id: [{
            required: true,
            message: '请选择工厂',
            trigger: 'blur'
          }]
        }
      }
    },
    computed: {
      myDeviceName(){
        return this.$store.state.user.myDeviceName
      }
    },
    mounted() {
      this.getDeviceList()
      this.getFactory()
    },
    methods: {
      /**
       * 获取设备类型
       */
      getDeviceList() {
        this.$get('agentapi/goods/goods_detail_types', {
          limit: 1000
        }).then(res => {
          let list = []
          for(var i in this.myDeviceName){
            res.list.map( item => {
              if(this.myDeviceName[i] == item.depend_type){
                list.push(item)
              }
            })
          }
          this.deviceList = list
        })
      },

      /**
       * 获取公司
       */
      getFactory(){
        this.$get('/SyFactory/getList', { limit: 100 }).then(res => {
          res.list.map(item => {
            this.factoryList.push({
              factory_id: item.factory_id,
              factory_name: item.factory_name,
              support_device_type: item.support_device_type
            })
          })
        })
      },

      /**
       * 点击提交按钮
       */
      onSubmit() {
        let params = JSON.parse(JSON.stringify(this.form))
        this.code_num = parseInt(params.num)
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
       * 选择设备类型
       */
      deviceChange(val){
        for(var item of this.deviceList){
          if(item.code_tag == val){
            this.sel_depend_type = item.depend_type
            this.code_type = item.code_type
            this.word_end = item.code_letter
            break
          }
        }
      },

      /**
       * 获取文件流
       */
      getFile(file){
        this.logo = file
      },

      /**
       * 点击提交创建二维码
       */
      createSn(params){
        let last = false
        this.base_code_num = 1000
        if(params.open == 1){
          params.force = 0
          this.base_code_num = 20
        } else {
          params.force = 1
        }
        if(this.code_num > this.base_code_num){
          params.num = this.base_code_num
          this.code_num = this.code_num - this.base_code_num
        } else {
          params.num = this.code_num
          last = true
        }
        params.site_agent_id = this.aid
        params.depend_type = this.sel_depend_type
        if(this.code_type) params.code_type = this.code_type
        if(this.word_end) params.word_end = this.word_end
        this.$post('/QRcode/getCodeSnByUnified', params).then(res => {
          if(!last){
            this.createSn(params)
          } else {
            this.$message({
              message: '生成完成',
              type: 'success'
            })
            this.loadObj.close()
          }
        }).catch(err => {
          this.loadObj.close()
        })
      }
    }
  }
</script>

<style scoped>

</style>
