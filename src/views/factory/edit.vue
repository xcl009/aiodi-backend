<template>
  <div>
    <el-row class="pl-30 pr-30 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="12" :lg="10">
        <el-form ref="form" :rules="rules" :model="form" label-width="100px" label-position="left">
          <h4>基础信息</h4>
          <el-form-item label="设备类型">
            <el-checkbox-group v-model="form.deviceTypeCodes" prop="deviceTypeCodes" class="pl-10">
              <el-checkbox v-for="(name, code) in myDeviceId" :label="code">{{ name }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="联系人姓名" prop="contacts">
            <el-input v-model="form.contacts" placeholder="输入姓名" />
          </el-form-item>
          <el-form-item label="手机号码" prop="mobile">
            <el-input v-model="form.mobile" placeholder="输入手机号" />
            <div class="fs-s2 text-gray">此手机号码会作为登录账户</div>
          </el-form-item>
          <el-form-item label="登录密码" v-if="!form.id">
            <el-input v-model="form.password" placeholder="会作为用户代理登录的密码" />
          </el-form-item>
          <el-form-item label="工厂名称" prop="name">
            <el-input v-model="form.name" placeholder="工厂名称" />
          </el-form-item>
          <el-form-item label="所在区域" prop="province">
            <el-cascader v-model="form.province" :options="cityList" :props="{ expandTrigger: 'hover' }" />
          </el-form-item>
          <el-form-item label="工厂地址" prop="address">
            <el-input v-model="form.address" placeholder="工厂地址" />
          </el-form-item>
          <el-form-item label="工厂介绍">
            <el-input v-model="form.briefIntroduction" placeholder="工厂介绍(生产设备类型)" />
          </el-form-item>
          <el-form-item label="邀请分成">
            <el-input v-model="form.profitRatio" placeholder="邀请品牌商分成比例">
              <template slot="append">%</template>
            </el-input>
          </el-form-item>
          <el-form-item label="工厂标识" v-if="!form.id">
            <el-input v-model="form.code" placeholder="2位大写字母组合" />
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
  import { pickKeys } from '@/utils/index'
  export default {
    components: {

    },
    data() {
      return {
        clickSubmit: false,
        form: {
          id: '',
          deviceTypeCodes: [],
          password: '123456',
          contacts: '',
          mobile: '',
          name: '',
          province: '',
          address: '',
          briefIntroduction: '',
          profitRatio: '',
          code: ''
        },
        rules: {
          deviceTypeCodes: [
            { required: true, message: '请填写关联设备类型', trigger: 'blur' }
          ],
          name: [
            { required: true, message: '请填写工厂名称', trigger: 'blur' }
          ],
          mobile: [
            { required: true, message: '请填写手机号码作为登录账户', trigger: 'blur' }
          ],
          contacts: [
            { required: true, message: '请填写联系人', trigger: 'blur' }
          ],
          province: [
            { required: true, message: '请选择工厂所在城市', trigger: 'blur' }
          ],
          address: [
            { required: true, message: '请选择工厂地址', trigger: 'blur' }
          ]
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
      if(info) {
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
        let params = JSON.parse(JSON.stringify(this.form)), url = 'iot-saas-basic/admin/factory/save'
        if(Array.isArray(params.province) && params.province.length > 0){
          params.district = params.province[2]
          params.city = params.province[1]
          params.province = params.province[0]
        }
        this.clickSubmit = true
        this.$refs[formName].validate((valid) => {
          if (valid) {
            if(params.id > 0){
              params.factoryId = params.id
              url = 'iot-saas-basic/admin/factory/update'
            }
            this.$post(url, params).then(res => {
              this.$message({
                message: '提交成功',
                type: 'success'
              })
              this.$router.push({
                path: '/factory/factory'
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
       * 获取城市
       */
      getCity(){
        this.$store.dispatch('api/getRegions').then(res => {
          let list = {}, areaId = ''
          res.map(item => {
            if(item.level == 1){
              list[item.tag] = {
                value: item.title,
                label: item.title,
                children: {}
              }
            }else if(item.level == 2){
              let tag = item.tag.substring(0, 3)
              list[tag].children[item.tag] = {
                value: item.title,
                label: item.title,
                children: []
              }
            }else if(item.level == 3){
              areaId = areaId || item.tag
              let tag1 = item.tag.substring(0, 3), tag2 = item.tag.substring(0, 6)
              list[tag1].children[tag2].children.push({
                value: item.title,
                label: item.title
              })
            }
          })
          list = Object.values(list)
          list.map(item => {
            if(JSON.stringify(item.children) == '{}'){
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

</style>
