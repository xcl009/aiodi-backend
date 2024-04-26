<template>
  <div>
    <el-row class="pl-30 pr-30 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="12" :lg="10">
        <el-form ref="form" :rules="rules" :model="form" label-width="auto">
          <h4>{{ $t('public.basicInformation') }}</h4>
          <el-form-item :label="$t('activity.typeName')" prop="type">
            <el-radio-group v-model="form.type">
              <el-radio-button :label="1">{{ $t('activity.onePurchase') }}</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="$t('activity.activityName')" prop="name">
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item :label="$t('activity.prize')" prop="activityPrizes">
            <el-select :placeholder="`${$t('public.pleaseSelect')}${$t('activity.prize')}`"
              v-model="form.activityPrizes">
              <el-option v-for="(item, code) in activityPrizesList" :label="item.prizeName" :value="item.id">{{
        item.prizeName }}</el-option>
            </el-select>
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
          <el-form-item :label="$t('activity.copyPrice')" prop="countBuying">
            <el-input v-model="form.countBuying" />
          </el-form-item>
          <el-form-item :label="$t('public.status')" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio :label="1">{{ $t('public.open') }}</el-radio>
              <el-radio :label="0">{{ $t('public.close') }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="$t('public.statrtTime')" prop="startTime">
            <el-date-picker type="datetime" :placeholder="$t('public.statrtTime')" v-model="form.startTime"
              :picker-options="pickerOptions" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
          </el-form-item>
          <el-form-item :label="$t('public.endTime')" prop="endTime">
            <el-date-picker type="datetime" :placeholder="$t('public.endTime')" v-model="form.endTime"
              :picker-options="pickerOptions" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
          </el-form-item>
          <el-form-item :label="$t('public.remark')" prop="remark">
            <el-input v-model="form.remark" />
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
      form: {
        type: 1,
        status: 1
      },
      id: this.$route.query.id || '',
      pickerOptions: {
        disabledDate: (time) => {
          return time.getTime() + 86400000 < Date.now()
        }
      },
      activityPrizesList: [],
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
        name: [
          { required: true, message: `${this.$t('public.enter')}${this.$t('activity.activityName')}`, trigger: 'blur' }
        ],
        countTotal: [
          { required: true, message: `${this.$t('public.enter')}${this.$t('activity.countTotal')}`, trigger: 'blur' }
        ],
        countPrice: [
          { required: true, message: `${this.$t('public.enter')}${this.$t('activity.countPrice')}`, trigger: 'blur' }
        ],
        countCost: [
          { required: true, message: `${this.$t('public.enter')}${this.$t('activity.countCost')}`, trigger: 'blur' }
        ],
        startTime: [
          { required: true, message: `${this.$t('public.pleaseSelect')}${this.$t('public.statrtTime')}`, trigger: 'change' }
        ],
        // endTime: [
        //   { required: true, message: '请选择结束时间', trigger: 'change' }
        // ],
        countBuying: [
          { required: true, message: `${this.$t('public.enter')}${this.$t('activity.copyPrice')}`, trigger: 'blur' }
        ],
        activityPrizes: [
          { required: true, message: `${this.$t('public.pleaseSelect')}${this.$t('activity.activityPrize')}`, trigger: 'blur' }
        ],
      }
    },
  },
  mounted() {
    this.activityPrizesListChange()
    if (this.id) {
      this.getInfo()
    }
  },
  methods: {
    activityPrizesListChange() {
      this.$post('iot-saas-activity/admin/v2/prizeInfo/findPage', { page: 0, size: 100 }).then(res => {
        this.activityPrizesList = res.rows

      })
    },
    /**
     * 获取信息
     */
    getInfo() {
      this.$get(`iot-saas-activity/admin/v2/activity/find/${this.id}`).then(res => {
        this.form = res
        this.form.status = parseInt(this.form.status);
        this.form.activityPrizes = res.activityPrizes[0].id;
      })
    },

    /**
     * 提交添加
     */
    onSubmit() {
      let that = this
      let params = {}, url = 'iot-saas-activity/admin/v2/activity/save'
      params = JSON.parse(JSON.stringify(this.form))
      params.brandId = this.agentInfo.brandId
      this.clickSubmit = true;

      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.id) {
            url = `iot-saas-activity/admin/v2/activity/update/${this.id}`
            delete params.endTime;
            delete params.createTime;
            delete params.startTime;
            delete params.updateTime;
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

<style scoped></style>
