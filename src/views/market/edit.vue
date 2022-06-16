<template>
  <el-row class="pt-30 pl-30 pr-30 custom-form bg-white">
    <el-col :xs="24" :sm="18" :md="12" :lg="10">
      <el-form ref="form" :rules="rules" :model="form" label-width="auto">
        <el-form-item label="服务类型">
          <el-select placeholder="选择服务类型" v-model="form.serviceTypeCode">
            <el-option :label="item.name" :value="item.code" v-for="(item, index) in serviceType" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备类型">
          <el-select placeholder="选择设备类型" v-model="form.deviceTypeCode">
            <el-option v-for="(item, code) in myDeviceId" :label="item" :value="code">{{ item }}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="服务名称">
          <el-input v-model="form.serviceName" placeholder="请输入服务名称" />
        </el-form-item>
        <el-form-item label="服务详情">
          <tinymce v-model="form.description" :height="300" v-if="form.description || !id"/>
        </el-form-item>
        <el-form-item label="服务案例">
          <tinymce v-model="form.successfulCase" :height="300" v-if="form.successfulCase || !id"/>
        </el-form-item>
        <el-form-item label="图片详情" class="up-img">
          <upload v-model="form.fileUrls" :limit="5" />
        </el-form-item>
        <el-form-item label="教程链接">
          <el-input v-model="form.courseLink" placeholder="请输入教程链接" />
        </el-form-item>
        <el-form-item label="需求来源">
          <el-input v-model="form.source" placeholder="请输入需求来源" />
        </el-form-item>
        <el-form-item label="价格设置">
          <div class="mb-10 flex align-center" v-for="(item, index) in form.priceSettings">
            <el-input v-model="item.priceCode" class="mr-10" placeholder="套餐标识"></el-input>
            <el-input v-model="item.priceName" class="mr-10" placeholder="套餐名称"></el-input>
            <el-input v-model="item.monthAmount" class="mr-10">
              <template slot="append">元/月</template>
            </el-input>
            <el-input v-model="item.yearAmount" class="mr-10">
              <template slot="append">元/年</template>
            </el-input>
            <el-input v-model="item.permanentAmount" class="mr-10">
              <template slot="append">元/永久</template>
            </el-input>
            <el-button type="text" size="small" :disabled="form.priceSettings.length == 4" v-if="index == 0"
              @click="form.priceSettings.push({})">添加</el-button>
            <el-button type="text" size="small" v-else
              @click="form.priceSettings.splice(index, 1)" class="text-danger">删除</el-button>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit('form')" :disabled="clickSubmit">提交</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<script>
  import { pickKeys, currentTime } from  '@/utils/index'
  import upload from '@/components/upload'
  import Tinymce from '@/components/Tinymce'
  export default {
    components: {
      upload,
      Tinymce
    },
    data() {
      return {
        tinymceDescID: `app_desc_${currentTime()}`,
        tinymceFulID: `app_ful_${currentTime()}`,
        clickSubmit: false,
        serviceType: [],
        form: {
          serviceTypeCode: '',
          deviceTypeCode: '',
          serviceName: '',
          description: '',
          successfulCase: '',
          fileUrls: [],
          courseLink: '',
          source: '',
          priceSettings: [
            {}
          ]
        },
        rules: {
          iotServiceTypeId: [
            { required: true, message: '请选择服务类型', trigger: 'change' }
          ]
        },
        powerInfo: {},
        role: [],
        id: '',

        id: this.$route.query.id
      }
    },
    computed: {
      myDeviceId() {
        return this.$store.getters.myDeviceId
      },
      siteInfo() {
        return this.$store.getters.siteInfo
      },
      agentInfo() {
        return this.$store.getters.agentInfo
      }
    },
    mounted() {
      this.getServiceType()
      if(this.id > 0){
        this.getInfo()
      }
    },
    methods: {
      /**
       * 获取类型
       */
      getServiceType(){
        this.$store.dispatch('api/getServiceType').then(res => {
          this.serviceType = res
        })
      },

      /**
       * 获取商户信息
       */
      getInfo() {
        this.$get(`iot-saas-basic/admin/service/market/${this.id}`).then(res => {
          if(res.deviceType) res.deviceTypeCode = res.deviceType.code
          res.serviceName = res.name
          let pictureUrls = res.pictureUrls.map(item => {
            return {
              url: item
            }
          })
          res.fileUrls = pictureUrls
          this.form = pickKeys(res, Object.keys(this.form))
        })
      },

      /**
       * 提交
       * @param {Object} formName
       */
      onSubmit(formName) {
        let params = JSON.parse(JSON.stringify(this.form)), type = '$post'
        this.clickSubmit = true
        this.$refs[formName].validate((valid) => {
          if (valid) {
            if(params.fileUrls && params.fileUrls.length > 0){
              let fileUrls = []
              params.fileUrls.map(item => {
                fileUrls.push(item.url)
              })
              params.fileUrls = fileUrls
            }
            if(this.id > 0){
              params.id = this.id
              type = '$put'
            }
            this.clickSubmit = false
            this[type]('iot-saas-basic/admin/service/market', params).then(res => {
              this.$message({
                message: '提交成功',
                type: 'success'
              })
              this.$router.push({
                path: '/market/appManage'
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
      },

      /**
       * 选择区域
       */
      selectCity(e){
        this.form.province = e.province.value
        this.form.city = e.city.value
        this.form.county = e.area.value
      }
    }
  }
</script>

<style scoped>
  .line {
    text-align: center;
  }
</style>
