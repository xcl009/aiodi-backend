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
          <el-form-item label="品牌CODE" prop="code" v-if="!brandId">
            <el-input v-model="form.code" placeholder="请输入品牌英文简称（限4位字母大写）" />
          </el-form-item>
          <el-form-item label="手机号码" prop="mobile">
            <el-input type="tel" v-model="form.mobile" placeholder="请输入手机号码（此号码会作为登录账户）" />
          </el-form-item>
          <el-form-item label="登录密码" v-if="!brandId">
            <el-input v-model="form.password" placeholder="会作为用户代理登录的密码" />
          </el-form-item>
          <el-form-item label="公司名称" prop="companyName">
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
            <el-checkbox v-for="(name, code) in myDeviceId" :label="code">{{ name }}</el-checkbox>
          </el-checkbox-group>

          <template>
            <h4 class="pt-20">分润比例</h4>
            <template v-for="(id, index) in selDevice">
              <el-form-item :label="`${myDeviceId[id]}`">
                <el-input type="number" v-model="form.deviceTypeProfitRatios[id]">
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
          code: [
            { required: true, message: '请填写品牌英文简称（限4位字母大写）', trigger: 'blur' }
          ],
          mobile: [
            { required: true, message: '请填写手机号码作为登录账户', trigger: 'blur' }
          ],
          companyName: [
            { required: true, message: '请填写公司名称', trigger: 'blur' }
          ]
        },
        cityList: [],
        powerInfo: {},
        role: [],

        selDevice: [],
        brandId: this.$route.query.brandId || ''
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
        return this.$store.getters.myDevice
      }
    },
    mounted() {
      if(this.brandId){
        this.getInfo()
      } else {
        console.log(this.myDevice)
        this.selDevice.push(this.myDevice[0].code)
      }
    },
    methods: {
      /**
       * 获取信息
       */
      getInfo() {
        this.$get('iot-saas-basic/admin/brand/findInfoById', {
          id: this.brandId
        }).then(res => {
          res.deviceTypeProfitRatios = {}
          if(res.brandDeviceType && res.brandDeviceType.length > 0){
            res.brandDeviceType.map(item => {
              res.deviceTypeProfitRatios[item.code] = item.profitRatio
              if(this.selDevice.indexOf(item.code) == -1) {
                this.selDevice.push(item.code)
              }
            })
          } else {
            this.selDevice.push(this.myDevice[0].code)
          }
          this.form = {
            id: res.id,
            deviceTypeProfitRatios: res.deviceTypeProfitRatios,
            logo: res.logo,
            name: res.name,
            mobile: res.brandUser.mobile,
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
            deviceTypeCode: this.selDevice[i],
            profitRatio: params.deviceTypeProfitRatios[this.selDevice[i]] || 0
          })
        }
        params.deviceTypeProfitRatios = profitRatios
        if(params.mobile) params.mobile = this.trim(params.mobile)
        this.clickSubmit = true
        this.$refs['form'].validate((valid) => {
          if (valid) {
            if(this.brandId){
              params.id = this.brandId
              url = 'iot-saas-basic/admin/brand/updateById'
            }
            this.clickSubmit = true
            this.$post(url, params).then(res => {
              this.$message({
                message: '提交成功',
                type: 'success'
              })
              this.$router.push({
                path: '/brand'
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
  .line {
    text-align: center;
  }
</style>
