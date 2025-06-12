<template>
  <el-row class="pt-30 pl-30 pr-30 custom-form bg-white">
    <el-col :xs="24" :sm="24" :md="18" :lg="16">
      <el-form ref="form" :rules="rules" :model="form" label-width="auto">
        <el-form-item :label="$t('public.serviceType')">
          <el-select :placeholder="$t('market.inputText')" v-model="form.serviceTypeCode">
            <el-option :label="item.name" :value="item.code" v-for="(item, index) in serviceType" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('public.deviceType')">
          <el-select :placeholder="$t('market.inputText1')" v-model="form.deviceTypeCode">
            <el-option v-for="(code, item) in myDeviceName" :label="item" :value="code">{{ item }}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('market.serverName')">
          <el-input v-model="form.serviceName" :placeholder="$t('market.inputText2')" />
        </el-form-item>
        <el-form-item :label="$t('market.theService')">
          <el-input v-model="form.brief" type="textarea" :placeholder="$t('market.inputText3')" />
        </el-form-item>
        <el-form-item :label="$t('market.imageDetails')" class="up-img">
          <upload v-model="form.fileUrls" :limit="5" />
        </el-form-item>
        <el-form-item :label="$t('market.courseLink')">
          <el-input v-model="form.courseLink" :placeholder="$t('market.inputText4')" />
        </el-form-item>
        <el-form-item :label="$t('market.source')">
          <el-input v-model="form.source" :placeholder="$t('market.source')" />
        </el-form-item>
        <el-form-item :label="$t('market.priceSettings')">
          <div class="mb-10 flex align-center" v-for="(item, index) in form.priceSettings">
            <el-input v-model="item.priceCode" class="mr-10" :placeholder="$t('market.packageIdentification')"></el-input>
            <el-input v-model="item.priceName" class="mr-10" :placeholder="$t('market.packageName')"></el-input>
            <el-input type="number" v-model="item.monthAmount" class="mr-10">
              <template slot="append">{{ siteInfo.currencySymbol }}/{{ $t('public.theMoon') }}</template>
            </el-input>
            <el-input type="number" v-model="item.yearAmount" class="mr-10">
              <template slot="append">{{ siteInfo.currencySymbol }}/{{ $t('public.year') }}</template>
            </el-input>
            <el-input type="number" v-model="item.permanentAmount" class="mr-10">
              <template slot="append">{{ siteInfo.currencySymbol }}/{{ $t('payType.permanent') }}</template>
            </el-input>
            <el-button type="text" size="small" v-if="index == 0" @click="form.priceSettings.push({})">{{ $t('public.add')
            }}</el-button>
            <el-button type="text" size="small" v-if="index > 0 || form.priceSettings.length > 1"
              @click="form.priceSettings.splice(index, 1)" class="text-danger">{{ $t('public.delete') }}</el-button>
          </div>
        </el-form-item>
        <el-form-item :label="$t('market.serviceDetails')">
          <tinymce v-model="form.description" :height="300" />
        </el-form-item>
        <el-form-item :label="$t('market.serviceCases')">
          <tinymce v-model="form.successfulCase" :height="300" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit('form')" :disabled="clickSubmit">{{ $t('public.submit')
          }}</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<script>
import { pickKeys, currentTime } from '@/utils/index'
import upload from '@/components/upload/'
import Tinymce from '@/components/Tinymce/'
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
        brief: '',
        description: '',
        successfulCase: '',
        fileUrls: [],
        courseLink: '',
        source: '',
        priceSettings: [
          {}
        ]
      },
      powerInfo: {},
      role: [],
      id: '',

      id: this.$route.query.id
    }
  },
  computed: {
    myDeviceName() {
      return this.$store.getters.myDeviceName
    },
    myDeviceId() {
      return this.$store.getters.myDeviceId
    },
    siteInfo() {
      return this.$store.getters.siteInfo
    },
    agentInfo() {
      return this.$store.getters.agentInfo
    },
    rules(){
      return {
        iotServiceTypeId: [
          { required: true, message: this.$t('market.inputText'), trigger: 'change' }
        ]
      }
    },
  },
  mounted() {
    this.getServiceType()
    if (this.id > 0) {
      this.getInfo()
    }
  },
  methods: {
    /**
     * 获取类型
     */
    getServiceType() {
      this.$store.dispatch('api/getServiceType').then(res => {
        this.serviceType = res
      })
    },

    /**
     * 获取商户信息
     */
    getInfo() {
      this.$get(`iot-saas-basic/admin/service/market/${this.id}`).then(res => {
        if (res.deviceType) res.deviceTypeCode = res.deviceType.code
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
      let that = this;
      let params = JSON.parse(JSON.stringify(this.form)), type = '$post'
      this.clickSubmit = true
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (params.fileUrls && params.fileUrls.length > 0) {
            let fileUrls = []
            params.fileUrls.map(item => {
              fileUrls.push(item.url)
            })
            params.fileUrls = fileUrls
          }
          if (this.id > 0) {
            params.id = this.id
            type = '$put'
          }
          this.clickSubmit = false
          this[type]('iot-saas-basic/admin/service/market', params).then(res => {
            this.$message({
              message: that.$t('public.submittedSuccess'),
              type: 'success'
            })
            this.$router.push({
              path: '/market/appManage'
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
     * 选择区域
     */
    selectCity(e) {
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
