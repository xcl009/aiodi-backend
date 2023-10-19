<template>
  <div>
    <el-row class="pl-30 pr-30 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="12" :lg="10">
        <el-form ref="form" :rules="rules" :model="form" label-width="100px" label-position="left">
          <h4>基础信息</h4>
          <el-form-item label="设备类型">
            <el-radio-group v-model="form.deviceTypeCode" prop="deviceTypeCode" class="pl-10">
              <el-radio v-for="(name, code) in myDeviceId" :label="code" class="raiod_margin">{{ name }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item ref="pictures" label="商品图片" prop="pictures">
            <upload v-model="form.pictures" :limit="1" />
          </el-form-item>
          <el-form-item label="状态" prop="statusCode">
            <el-switch v-model="form.statusCode" active-value="ENABLE" inactive-value="CLOSE">
            </el-switch>
          </el-form-item>
          <el-form-item label="设备名称" prop="name">
            <el-input v-model="form.name" placeholder="输入设备名称" />
          </el-form-item>
          <el-form-item label="所在区域" prop="province">
            <el-cascader v-model="form.province" :options="cityList" :props="{ expandTrigger: 'hover' }" />
          </el-form-item>
          <el-form-item label="关键字" prop="keyword">
            <el-input v-model="form.keyword" placeholder="输入关键字" />
          </el-form-item>
          <el-form-item label="价格" prop="price">
            <el-input v-model="form.price" placeholder="输入价格" />
          </el-form-item>
          <el-form-item label="描述信息">
            <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入描述信息" />
          </el-form-item>
          <el-form-item ref="stock" label="库存" prop="stock">
            <el-input type="number" v-model="form.stock" placeholder="请填写库存" />
          </el-form-item>
          <el-form-item ref="stockAlarmValue" label="库存预警值" prop="stockAlarmValue">
            <el-input type="number" v-model="form.stockAlarmValue" placeholder="库存预警值" />
          </el-form-item>
          <el-form-item ref="stock" label="运费" prop="freight">
            <el-input type="number" v-model="form.freight" placeholder="运费" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit('form')" :disabled="clickSubmit">提交</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import upload from '@/components/upload'
  import {
    pickKeys
  } from '@/utils/index'
  export default {
    components: {
      upload
    },
    data() {
      return {
        clickSubmit: false,
        form: {
          deviceTypeCode: [],
          name: '',
          keyword: '',
          province: '',
          description: '',
          price: 1,
          stockAlarmValue: 1,
          stock: 1,
          statusCode: 'ENABLE',
          pictures: ''
        },
        rules: {
          deviceTypeCode: [{
            required: true,
            message: '请填写关联设备类型',
            trigger: 'blur'
          }],
          name: [{
            required: true,
            message: '输入设备名称',
            trigger: 'blur'
          }],
          province: [{
            required: true,
            message: '请选择工厂所在城市',
            trigger: 'blur'
          }],
          price: [{
            required: true,
            message: '请输入价格',
            trigger: 'blur'
          }]
        },
        cityList: []
      }
    },
    computed: {
      myDeviceId() {
        return this.$store.getters.myDeviceId
      },
    },
    mounted() {
      let info = this.$route.params.info
      if (info) {
        info.deviceTypeCodes = []
        info.deviceTypeList.map(item => {
          info.deviceTypeCodes.push(item.deviceTypeCode)
        })
        info.province = [info.province, info.city, info.district]
        this.form = pickKeys(info, Object.keys(this.form))
      }
      this.getCity()
    },
    methods: {
      /**
       * 提交
       * @param {Object} formName
       */
      onSubmit(formName) {
        let params = JSON.parse(JSON.stringify(this.form)),
          url = 'iot-saas-device/shop/goods/save'
        if (Array.isArray(params.province) && params.province.length > 0) {
          params.district = params.province[2]
          params.city = params.province[1]
          params.province = params.province[0]
        }
        this.clickSubmit = true
        this.$refs[formName].validate((valid) => {
          if (valid) {
            if (params.id > 0) {
              params.factoryId = params.id
              url = 'iot-saas-device/shop/goods/edit'
            }
            this.$post(url, params).then(res => {
              this.$message({
                message: '提交成功',
                type: 'success'
              })
              this.$router.push({
                path: '/factory/factory'
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
      },

      /**
       * 获取城市
       */
      getCity() {
        this.$store.dispatch('api/getRegions').then(res => {
          let list = {},
            areaId = ''
          res.map(item => {
            if (item.level == 1) {
              list[item.tag] = {
                value: item.title,
                label: item.title,
                children: {}
              }
            } else if (item.level == 2) {
              let tag = item.tag.substring(0, 3)
              list[tag].children[item.tag] = {
                value: item.title,
                label: item.title,
                children: []
              }
            } else if (item.level == 3) {
              areaId = areaId || item.tag
              let tag1 = item.tag.substring(0, 3),
                tag2 = item.tag.substring(0, 6)
              list[tag1].children[tag2].children.push({
                value: item.title,
                label: item.title
              })
            }
          })
          list = Object.values(list)
          list.map(item => {
            if (JSON.stringify(item.children) == '{}') {
              item.children = []
            } else {
              item.children = Object.values(item.children)
            }
            return item
          })
          this.cityList = list
        })
      },
    }
  }
</script>

<style scoped>
  .el-radio {
    margin-top: 10px;
  }
</style>