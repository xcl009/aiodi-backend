<template>
  <div>
    <el-row class="pl-30 pr-30 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="12" :lg="10">
        <el-form ref="form" :rules="rules" :model="form" label-position="left" label-width="100px">
          <h4>{{ $t('public.basicInformation') }}</h4>
          <el-form-item :label="$t('public.agentNickNames')" prop="name">
            <el-input v-model="form.name" :placeholder="$t('public.agentNameText')" />
          </el-form-item>
          <el-form-item :label="$t('public.phone')" prop="mobile">
            <el-input type="tel" v-model="form.mobile" :placeholder="$t('brand.phoneText')" />
          </el-form-item>
          <el-form-item :label="$t('public.loginPassword')" v-if="!agentId">
            <el-input v-model="form.password" :placeholder="$t('factory.agentLogonPassword')" />
          </el-form-item>
          <el-form-item :label="$t('public.operatingArea')">
            <el-cascader v-model="form.province" :options="cityList" :props="{ expandTrigger: 'hover' }" />
          </el-form-item>

          <h4 class="pt-20">{{ $t('public.operationalProducts') }}</h4>
          <el-checkbox-group v-model="selDevice" class="pl-10">
            <el-checkbox v-for="(name, code) in myDeviceId" :label="code">{{ name }}</el-checkbox>
          </el-checkbox-group>

          <template>
            <h4 class="pt-20">{{ $t('brand.dividendRatio') }}</h4>
            <template v-for="(id, index) in selDevice">
              <el-form-item :label="`${myDeviceId[id]}`">
                <el-input type="number" v-model="form.deviceTypeProfitRatios[id]" :placeholder="`${$t('store.max')}${myProfitRatio[id]}%`">
                  <template slot="append">%</template>
                </el-input>
              </el-form-item>
            </template>
          </template>

          <el-form-item>
            <el-button type="primary" @click="onSubmit('form')" :disabled="clickSubmit">{{ $t('public.submitNow') }}</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  export default {
    components: {

    },
    data() {
      return {
        clickSubmit: false,
        form: {
          password: '123456',
          deviceTypeProfitRatios: {}
        },
        rules: {
          role_id: [
            { required: true, message: this.$t('brand.message'), trigger: 'change' }
          ],
          name: [
            { required: true, message: this.$t('brand.message1'), trigger: 'blur' }
          ],
          mobile: [
            { required: true, message: this.$t('brand.message3'), trigger: 'blur' }
          ]
        },
        cityList: [],
        powerInfo: {},
        role: [],

        selDevice: [],
        agentId: this.$route.query.agentId || ''
      }
    },
    computed: {
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
      },
      myProfitRatio() {
        return this.$store.getters.myProfitRatio
      }
    },
    mounted() {
      this.getCity()
      if(this.agentId){
        this.getInfo()
      } else {
        this.selDevice.push(Object.keys(this.myDeviceId)[0])
      }
    },
    methods: {
      /**
       * 获取信息
       */
      getInfo() {
        this.$get('iot-saas-basic/admin/agent/findById', {
          id: this.agentId
        }).then(res => {
          res.deviceTypeProfitRatios = {}
          if(res.agentDeviceType && res.agentDeviceType.length > 0){
            res.agentDeviceType.map(item => {
              res.deviceTypeProfitRatios[item.code] = item.profitRatio
              if(this.selDevice.indexOf(item.code) == -1) {
                this.selDevice.push(item.code)
              }
            })
          } else if(this.myDevice[0]){
            this.selDevice.push(this.myDevice[0].deviceTypeCode)
          }
          this.form = {
            id: res.id,
            deviceTypeProfitRatios: res.deviceTypeProfitRatios,
            name: res.name,
            mobile: res.mobile,
            province: [res.province, res.city, res.district]
          }
        })
      },

      /**
       * 提交添加
       */
      onSubmit() {
        let that = this;
        let params = {}, url = 'iot-saas-basic/admin/agent/save'
        if(this.selDevice.length == 0){
          this.$message({
            message: that.$t('brand.message5'),
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
        if(Array.isArray(params.province) && params.province.length > 0){
          params.district = params.province[2]
          params.city = params.province[1]
          params.province = params.province[0]
        }
        if(params.mobile) params.mobile = this.trim(params.mobile)
        this.clickSubmit = true
        this.$refs['form'].validate((valid) => {
          if (valid) {
            if(this.agentId){
              params.id = this.agentId
              url = 'iot-saas-basic/admin/agent/updateById'
            }
            this.clickSubmit = true
            this.$post(url, params).then(res => {
              this.$message({
                message: that.$t('public.submittedSuccess'),
                type: 'success'
              })
              this.$router.back()
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
  .line {
    text-align: center;
  }
</style>
