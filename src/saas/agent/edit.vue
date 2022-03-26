<template>
  <div>
    <el-row class="pl-30 pr-30 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="12" :lg="10">
        <el-form ref="form" :rules="rules" :model="form" label-width="auto">
          <h4>基础信息</h4>
          <el-form-item label="品牌logo" class="up-img">
            <upload v-model="form.logo" />
          </el-form-item>
          <el-form-item label="品牌名称" prop="name">
            <el-input v-model="form.name" placeholder="输入品牌名称" />
          </el-form-item>
          <el-form-item label="手机号码" prop="mobile">
            <el-input v-model="form.mobile" placeholder="请输入手机号码（此号码会作为登录账户）" />
          </el-form-item>
          <el-form-item label="登录密码" v-if="!aid">
            <el-input v-model="form.password" placeholder="会作为用户代理登录的密码" />
          </el-form-item>
          <el-form-item label="运营区域">
            <el-cascader v-model="form.areaId" :options="cityList" :props="{ expandTrigger: 'hover' }" />
          </el-form-item>
          <el-form-item label="公司名称">
            <el-input v-model="form.companyName" placeholder="公司名称" />
          </el-form-item>
          <el-form-item label="公司地址">
            <el-input v-model="form.companyAddress" placeholder="输入公司地址" />
          </el-form-item>
          <el-form-item label="公司电话">
            <el-input v-model="form.companyPhoneNum" placeholder="输入公司电话" />
          </el-form-item>

          <h4 class="pt-20">运营产品</h4>
          <el-checkbox-group v-model="selDevice" class="pl-10">
            <el-checkbox v-for="item in myDevice" :label="item.id">{{ item.name }}</el-checkbox>
          </el-checkbox-group>

          <template>
            <h4 class="pt-20">分润比例</h4>
            <template v-for="(id, index) in selDevice">
              <el-form-item :label="`${myDeviceId[id]}`">
                <el-input v-model="form.deviceTypeProfitRatios[id]" :placeholder="`最高不能超过100%`">
                  <template slot="append">%</template>
                </el-input>
              </el-form-item>
            </template>
          </template>

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
  export default {
    components: {
      upload
    },
    data() {
      return {
        clickSubmit: false,
        form: {
          userType: 'brand',
          password: '123456',
          deviceTypeProfitRatios: {}
        },
        rules: {
          role_id: [
            { required: true, message: '请选择开通类型', trigger: 'change' }
          ],
          name: [
            { required: true, message: '请填写联系人姓名', trigger: 'blur' }
          ],
          mobile: [
            { required: true, message: '请填写手机号码作为登录账户', trigger: 'blur' }
          ]
        },
        cityList: [],
        powerInfo: {},
        role: [],

        selDevice: [],
        aid: this.$route.params.aid || ''
      }
    },
    computed: {
      myDeviceName() {
        return this.$store.getters.myDeviceName
      },
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
        let myDevice = this.$store.getters.myDevice
        return myDevice
      }
    },
    mounted() {
      this.getCity()
      if(this.aid){
        this.getInfo()
      } else {
        this.selDevice.push(this.myDevice[0].id)
      }
    },
    methods: {
      /**
       * 获取信息
       */
      getInfo() {
        this.$get('iot-saas-basic/admin/brand/findInfoById', {
          id: this.aid
        }).then(res => {
          res.deviceTypeProfitRatios = {}
          if(res.brandDeviceType.length > 0){
            res.brandDeviceType.map(item => {
              res.deviceTypeProfitRatios[item.id] = item.profitRatio
              if(this.selDevice.indexOf(item.id) == -1) {
                this.selDevice.push(item.id)
              }
            })
          } else {
            this.selDevice.push(this.myDevice[0].id)
          }
          this.form = {
            id: res.id,
            deviceTypeProfitRatios: res.deviceTypeProfitRatios,
            logo: res.logo,
            name: res.name,
            mobile: res.brandUser.mobile,
            areaId: res.areaId,
            companyName: res.companyName,
            companyAddress: res.companyAddress,
            companyPhoneNum: res.companyPhoneNum
          }
        })
      },

      /**
       * 提交添加
       */
      onSubmit() {
        let params = {}, url = 'iot-saas-basic/admin/brand/save'
        if(this.selDevice.length == 0){
          this.$message({
            message: '最少选择一个运营产品',
            type: 'error'
          })
          return
        }
        params = JSON.parse(JSON.stringify(this.form))
        let profitRatios = []
        for(var i in this.selDevice){
          profitRatios.push({
            deviceTypeId: this.selDevice[i],
            profitRatio: params.deviceTypeProfitRatios[this.selDevice[i]] || 0
          })
        }
        params.deviceTypeProfitRatios = profitRatios
        if(Array.isArray(params.areaId) && params.areaId.length > 0) params.areaId = params.areaId[params.areaId.length - 1]
        this.clickSubmit = true
        this.$refs['form'].validate((valid) => {
          if (valid) {
            if(this.aid){
              params.id = this.aid
              url = 'iot-saas-basic/admin/brand/updateById'
            }
            this.clickSubmit = true
            this.$post(url, params).then(res => {
              this.$message({
                message: '提交成功',
                type: 'success'
              })
              this.$router.push({
                path: '/partner/index'
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
          let list = {}, regionTag = ''
          res.map(item => {
            if(item.level == 1){
              list[item.tag] = {
                value: item.tag,
                label: item.title,
                children: {}
              }
            }else if(item.level == 2){
              let tag = item.tag.substring(0, 3)
              list[tag].children[item.tag] = {
                value: item.tag,
                label: item.title,
                children: []
              }
            }else if(item.level == 3){
              regionTag = regionTag || item.tag
              let tag1 = item.tag.substring(0, 3), tag2 = item.tag.substring(0, 6)
              list[tag1].children[tag2].children.push({
                value: item.tag,
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
          if(!this.aid){
            this.$set(this.form, 'areaId', regionTag)
          }
        })
      },
    }
  }
</script>

<style scoped>
  .line {
    text-align: center;
  }
</style>
