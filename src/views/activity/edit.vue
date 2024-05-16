<template>
  <div>
    <el-row class="pl-30 pr-30 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="12" :lg="10">
        <el-form ref="form" :rules="rules" :model="form" label-width="auto">
          <h4>{{ $t('public.basicInformation') }}</h4>
          <el-form-item :label="$t('activity.typeName')" prop="type">
            <el-radio-group v-model="form.type">
              <el-radio-button :label="1">一元购</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="$t('activity.activityName')" prop="name">
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item :label="$t('activity.countTotal')" prop="countTotal">
            <el-input v-model="form.countTotal" />
          </el-form-item>
          <el-form-item :label="$t('activity.countPrice')" prop="countPrice">
            <el-input v-model="form.countPrice" />
          </el-form-item>
          <el-form-item :label="$t('activity.countCost')" prop="countCost">
            <el-input v-model="form.countCost" />
          </el-form-item>
          <el-form-item :label="$t('public.status')" prop="status">
            <el-input v-model="form.status" />
          </el-form-item>
          <el-form-item :label="$t('public.statrtTime')" prop="statrtTime">
            <el-date-picker type="datetime" :placeholder="$t('public.statrtTime')" v-model="form.statrtTime"
              :picker-options="pickerOptions" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
          </el-form-item>
          <el-form-item :label="$t('public.endTime')" prop="endTime">
            <el-date-picker type="datetime" :placeholder="$t('public.endTime')" v-model="form.endTime"
              :picker-options="pickerOptions" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
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
import upload from '@/components/upload'
export default {
  components: {
    upload
  },
  data() {
    return {
      clickSubmit: false,
      form: {},
      id: this.$route.query.id || '',
      pickerOptions: {
        disabledDate: (time) => {
          return time.getTime() + 86400000 < Date.now()
        }
      },
    }
  },
  computed: {
    siteInfo() {
      return this.$store.getters.siteInfo
    },
    agentInfo() {
      return this.$store.getters.agentInfo
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
        ]
      }
    },
  },
  mounted() {
    if (this.id) {
      this.getInfo()
    }
  },
  methods: {
    /**
     * 获取信息
     */
    getInfo() {
      this.$get(`iot-saas-activity/admin/v2/activity/find/${this.id}`).then(res => {
        this.form = res
      })
    },

    /**
     * 提交添加
     */
    onSubmit() {
      let that = this
      let params = {}, url = 'iot-saas-activity/admin/v2/activity/save'
      params = JSON.parse(JSON.stringify(this.form))
      this.clickSubmit = true
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.id) {
            url = `iot-saas-activity/admin/v2/activity/${this.id}`
          }
          this.clickSubmit = true
          this.$post(url, params).then(res => {
            this.$message({
              message: that.$t('public.submittedSuccess'),
              type: 'success'
            })
            this.$router.push({
              path: '/activity/index'
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
    }
  }
}
</script>

<style scoped>
  
</style>
