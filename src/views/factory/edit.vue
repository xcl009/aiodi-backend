<template>
  <div>
    <el-row class="pl-30 pr-30 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="12" :lg="10">
        <el-form ref="form" :rules="rules" :model="form" label-width="100px" label-position="left">
          <h4>{{ $t('public.basicInformation') }}</h4>
          <el-form-item :label="$t('public.deviceType')">
            <el-checkbox-group v-model="form.deviceTypeCodes" prop="deviceTypeCodes" class="pl-10">
              <el-checkbox v-for="(code, name) in myDeviceName" :label="code">{{ name }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item :label="$t('public.contactName')" prop="contacts">
            <el-input v-model="form.contacts" :placeholder="$t('factory.enterName')" />
          </el-form-item>
          <el-form-item :label="$t('public.phone')" prop="mobile">
            <el-input v-model="form.mobile" :placeholder="$t('public.phoneText')" />
            <div class="fs-s2 text-gray">{{ $t('factory.phoneLoginAccount') }}</div>
          </el-form-item>
          <el-form-item :label="$t('public.loginPassword')" v-if="!form.id">
            <el-input v-model="form.password" :placeholder="$t('factory.agentLogonPassword')" />
          </el-form-item>
          <el-form-item :label="$t('factory.factoryName')" prop="name">
            <el-input v-model="form.name" :placeholder="$t('factory.factoryName')" />
          </el-form-item>
          <el-form-item :label="$t('factory.region')" prop="province">
            <el-cascader v-model="form.province" :options="cityList" :props="{ expandTrigger: 'hover' }" />
          </el-form-item>
          <el-form-item :label="$t('public.address')" prop="address">
            <el-input v-model="form.address" :placeholder="$t('factory.factoryAddress')" />
          </el-form-item>
          <el-form-item :label="$t('factory.briefIntroduction')">
            <el-input v-model="form.briefIntroduction" :placeholder="$t('factory.briefIntroductionText')" />
          </el-form-item>
          <el-form-item :label="$t('factory.profitRatio')">
            <el-input type="number" v-model="form.profitRatio" :placeholder="$t('factory.profitRatioText')">
              <template slot="append">%</template>
            </el-input>
          </el-form-item>
          <el-form-item :label="$t('factory.code')" v-if="!form.id">
            <el-input v-model="form.code" :placeholder="$t('factory.codeText')" />
          </el-form-item>
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
      cityList: []
    }
  },
  computed: {
    myDeviceName() {
      return this.$store.getters.myDeviceName
    },
    myDeviceId() {
      return this.$store.getters.myDeviceId
    },
    rules() {
      return {
        deviceTypeCodes: [
          { required: true, message: this.$t('factory.message'), trigger: 'blur' }
        ],
        name: [
          { required: true, message: this.$t('factory.message1'), trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: this.$t('factory.message2'), trigger: 'blur' }
        ],
        contacts: [
          { required: true, message: this.$t('factory.message3'), trigger: 'blur' }
        ],
        
        address: [
          { required: true, message: this.$t('factory.message5'), trigger: 'blur' }
        ]
      }
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
      let that = this;
      let params = JSON.parse(JSON.stringify(this.form)), url = 'iot-saas-basic/admin/factory/save'
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
            url = 'iot-saas-basic/admin/factory/update'
          }
          this.$post(url, params).then(res => {
            this.$message({
              message: that.$t('public.submittedSuccess'),
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
        let list = {}, areaId = ''
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
            let tag1 = item.tag.substring(0, 3), tag2 = item.tag.substring(0, 6)
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

<style scoped></style>
