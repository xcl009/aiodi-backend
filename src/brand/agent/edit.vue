<template>
  <div>
    <el-row class="pl-30 pr-30 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="12" :lg="10">
        <el-form ref="form" :rules="rules" :model="form" label-width="auto">
          <h4>基础信息</h4>
          <el-form-item label="代理名称" prop="name">
            <el-input v-model="form.name" placeholder="输入品牌名称" />
          </el-form-item>
          <el-form-item label="手机号码" prop="mobile">
            <el-input v-model="form.mobile" placeholder="请输入手机号码（此号码会作为登录账户）" />
          </el-form-item>
          <el-form-item label="登录密码" v-if="!aid">
            <el-input v-model="form.password" placeholder="会作为用户代理登录的密码" />
          </el-form-item>
          <el-form-item label="运营区域">
            <el-cascader v-model="form.areaId" :options="areaList" :props="{ expandTrigger: 'hover' }" />
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
              <el-form-item :label="`${myDeviceId[id]}：`">
                <el-input v-model="form.deviceTypDeviceProfitRatios[id]" :placeholder="`最高不能超过100%`">
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
          deviceTypDeviceProfitRatios: {}
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
        areaList: [],
        powerInfo: {},
        role: [],

        selDevice: [],
        aid: this.$route.query.aid || ''
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
        this.$get('iot-saas-basic/admin/brand/findById', {
          id: this.aid
        }).then(res => {
          res.deviceTypDeviceProfitRatios = {}
          if(res.brandDeviceType.length > 0){
            res.brandDeviceType.map(item => {
              res.deviceTypDeviceProfitRatios[item.id] = item.profitRatio
              if(this.selDevice.indexOf(item.id) == -1) {
                this.selDevice.push(item.id)
              }
            })
          } else {
            this.selDevice.push(this.myDevice[0].id)
          }
          this.form = {
            id: res.id,
            deviceTypDeviceProfitRatios: res.deviceTypDeviceProfitRatios,
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
        let params = {}, url = 'iot-saas-basic/admin/brand'
        params = JSON.parse(JSON.stringify(this.form))
        let profitRatios = []
        for(var i in params.deviceTypDeviceProfitRatios){
          profitRatios.push({
            deviceTypeId: i,
            profitRatio: params.deviceTypDeviceProfitRatios[i] || 0
          })
        }
        params.deviceTypDeviceProfitRatios = profitRatios
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
        this.$get('commonapi/tool/get_address_list').then(res => {
          for (var i in res) {
            const firstLevel = res[i]
            const obj = {
              value: firstLevel.tag,
              label: firstLevel.title,
              children: []
            }
            if (firstLevel.son_list.length > 0) {
              const secondLevel = firstLevel.son_list
              for (var s in secondLevel) {
                const secondItem = secondLevel[s]
                if (this.region_tag == secondItem.tag) this.form.region_tag = [obj.value, secondItem.tag]
                obj.children.push({
                  value: secondItem.tag,
                  label: secondItem.title,
                  children: []
                })
                if (secondItem.son_list.length > 0) {
                  const thirdLevel = secondItem.son_list
                  for (var t in thirdLevel) {
                    const thirdItem = thirdLevel[t]
                    if (this.region_tag == thirdItem.tag) this.form.region_tag = [obj.value, secondItem.tag, thirdItem.tag]
                    obj.children[s].children.push({
                      value: thirdItem.tag,
                      label: thirdItem.title
                    })
                  }
                } else {
                  obj.children = undefined
                }
              }
            } else {
              obj.children = undefined
            }
            this.areaList.push(obj)
          }
          if (!this.id) {
            const first = this.areaList[0]
            this.form.region_tag = [first.value, first.children[0].value, first.children[0].children[0].value]
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