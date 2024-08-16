<template>
  <div>
    <el-row class="pl-30 pr-30 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="12" :lg="10">
        <el-form ref="form" :rules="rules" :model="form" label-width="auto">
          <h4>{{ $t('public.basicInformation') }}</h4>
          <el-form-item :label="$t('brand.brandLogo')" class="up-img">
            <upload v-model="form.logo" />
          </el-form-item>
          <el-form-item :label="$t('public.brandName')" prop="name">
            <el-input v-model="form.name" :placeholder="$t('store.pleaseBrandName')" />
          </el-form-item>
          <el-form-item :label="$t('brand.brandCode')" prop="code" v-if="!brandId">
            <el-input v-model="form.code" :placeholder="$t('brand.brandCodeText')" />
          </el-form-item>
          <el-form-item :label="$t('public.phone')" prop="mobile">
            <el-input type="tel" v-model="form.mobile" :placeholder="$t('brand.phoneText')" />
          </el-form-item>
          <el-form-item :label="$t('public.loginPassword')" v-if="!brandId">
            <el-input v-model="form.password" :placeholder="$t('factory.agentLogonPassword')" />
          </el-form-item>
          <el-form-item :label="$t('brand.corporateName')" prop="companyName">
            <el-input v-model="form.companyName" :placeholder="$t('brand.corporateName')" />
          </el-form-item>
          <el-form-item :label="$t('public.companyAddress')">
            <el-input v-model="form.companyAddress" :placeholder="$t('public.companyAddressText')" />
          </el-form-item>
          <el-form-item :label="$t('public.companyPhone')">
            <el-input v-model="form.companyPhoneNum" :placeholder="$t('public.companyPhoneText')" />
          </el-form-item>
          <el-form-item :label="$t('public.currency')" prop="currency">
            <el-select v-model="form.currency" style="width: 100%;">
              <el-option :label="item.code" :value="item.code" v-for="(item, index) in currencySymbolList" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('brand.country')" prop="country">
            <el-select v-model="form.country" style="width: 100%;">
              <el-option :label="item.chineseName" :value="item.name" v-for="(item, index) in countrys" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('brand.linkBrand')">
            <div class="mb-5 flex align-center flex-wrap"
              v-for="(item, idx) in form.linkBrandIds">
              <el-select
                class="flex-1 mr-10"
                v-model="form.linkBrandIds[idx]"
                filterable
                remote
                reserve-keyword
                placeholder="请输入品牌名称"
                :remote-method="queryBrand"
                :loading="loading">
                <el-option
                  v-for="item in brandList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
                </el-option>
              </el-select>
              <el-button type="text" size="small" v-if="idx == 0" @click="form.linkBrandIds.push('')">{{ $t('public.add') }}</el-button>
              <el-button type="text" size="small" v-else @click="form.linkBrandIds.splice(idx, 1)" class="text-danger">{{ $t('public.delete') }}</el-button>
            </div>
          </el-form-item>

          <h4 class="pt-20">{{ $t('public.operationalProducts') }}</h4>
          <el-checkbox-group v-model="selDevice" class="pl-10">
            <el-checkbox v-for="(name, code) in myDeviceId" :label="code">{{ name }}</el-checkbox>
          </el-checkbox-group>

          <template>
            <h4 class="pt-20">{{ $t('brand.dividendRatio') }}</h4>
            <template v-for="(id, index) in selDevice">
              <el-form-item :label="`${myDeviceId[id]}`">
                <el-input type="number" v-model="form.deviceTypeProfitRatios[id]">
                  <template slot="append">%</template>
                </el-input>
              </el-form-item>
            </template>
          </template>

          <el-form-item>
            <el-button type="primary" @click="onSubmit('form')" :disabled="clickSubmit">{{ $t('public.submit')
              }}</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import upload from '@/components/upload'
import { queryCurrencySymbol } from '@/api/user'
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
        deviceTypeProfitRatios: {},
        linkBrandIds: ['']
      },
      cityList: [],
      powerInfo: {},
      role: [],

      selDevice: [],
      brandId: this.$route.query.brandId || '',
      currencySymbolList: [],
      countrys: [],
      brandList: [],
      loading: false
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
    },
    rules() {
      return {
        role_id: [
          { required: true, message: this.$t('brand.message'), trigger: 'change' }
        ],
        name: [
          { required: true, message: this.$t('brand.message1'), trigger: 'blur' }
        ],
        code: [
          { required: true, message: this.$t('brand.message2'), trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: this.$t('brand.message3'), trigger: 'blur' }
        ],
        companyName: [
          { required: true, message: this.$t('brand.message4'), trigger: 'blur' }
        ],
        currency:[
          { required: true, message: this.$t('public.currencyText'), trigger: 'blur' }
        ],
        country:[
           { required: true, message: this.$t('brand.countryText'), trigger: 'blur' }
        ]
      }
    },
  },
  mounted() {
    this.getSymbol()
    if (this.brandId) {
      this.getInfo()
    } else {
      console.log(this.myDevice)
      this.selDevice.push(this.myDevice[0].code)
    }
  },
  methods: {
    getSymbol() {
      queryCurrencySymbol().then(res => {
        this.currencySymbolList = res
      })
      this.$get('iot-saas-user/open/countrys').then(res => {
        this.countrys = res
      })
    },

    /**
     * 获取信息
     */
    getInfo() {
      this.$get('iot-saas-basic/admin/brand/findInfoById', {
        id: this.brandId
      }).then(res => {
        res.deviceTypeProfitRatios = {}
        if (res.brandDeviceType && res.brandDeviceType.length > 0) {
          res.brandDeviceType.map(item => {
            res.deviceTypeProfitRatios[item.code] = item.profitRatio
            if (this.selDevice.indexOf(item.code) == -1) {
              this.selDevice.push(item.code)
            }
          })
        } else {
          this.selDevice.push(this.myDevice[0].code)
        }
        let linkBrandIds = []
        if(res.linkBrandVOs){
          res.linkBrandVOs.map(item => {
            if(item.id != this.brandId){
              linkBrandIds.push(item.id)
            }
          })
        }else{
          linkBrandIds = ['']
        }
        this.form = {
          id: res.id,
          deviceTypeProfitRatios: res.deviceTypeProfitRatios,
          logo: res.logo,
          name: res.name,
          mobile: res.brandUser.mobile,
          companyName: res.companyName,
          companyAddress: res.companyAddress,
          companyPhoneNum: res.companyPhoneNum,
          currency: res.currency,
          country: res.country,
          linkBrandIds: linkBrandIds
        }
      })
    },

    /**
     * 提交添加
     */
    onSubmit() {
      let that = this;
      let params = {}, url = 'iot-saas-basic/admin/brand/save'
      if (this.selDevice.length == 0) {
        this.$message({
          message: that.$t('brand.message5'),
          type: 'error'
        })
        return
      }
      params = JSON.parse(JSON.stringify(this.form))
      let profitRatios = []
      for (var i in this.selDevice) {
        profitRatios.push({
          deviceTypeCode: this.selDevice[i],
          profitRatio: params.deviceTypeProfitRatios[this.selDevice[i]] || 0
        })
      }
      params.deviceTypeProfitRatios = profitRatios
      if (params.mobile) params.mobile = this.trim(params.mobile)
      if (params.linkBrandIds){
        let linkBrandIds = []
        params.linkBrandIds.map(item => {
          if(item) linkBrandIds.push(item)
        })
        params.linkBrandIds = linkBrandIds
      }
      this.clickSubmit = true
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.brandId) {
            params.id = this.brandId
            url = 'iot-saas-basic/admin/brand/updateById'
          }
          this.clickSubmit = true
          this.$post(url, params).then(res => {
            this.$message({
              message: that.$t('public.submittedSuccess'),
              type: 'success'
            })
            this.$router.push({
              path: '/brand'
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
     * 搜索品牌
     * @param {String} query
     */
    queryBrand(query){
      if(!query) return
      this.$get('iot-saas-basic/admin/brand/findPage', {
        name: query,
        page: 0,
        size: 10
      }).then(res => {
        this.brandList = res.rows
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
