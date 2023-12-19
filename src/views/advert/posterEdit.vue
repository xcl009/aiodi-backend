<template>
  <div>
    <el-row class="pt-30 pl-30 pr-30 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="12" :lg="10">
        <el-form ref="form" :model="form" label-width="auto">
          <el-form-item :label="$t('advert.advertPositionId')">
            <el-select v-model="form.advertPositionId" :placeholder="$t('advert.advertPositionIdText')">
              <el-option v-for="item in positionList" :label="item.title" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('public.name')">
            <el-input v-model="form.title" :placeholder="$t('advert.pleaseAdsName')" />
          </el-form-item>
          <el-form-item :label="$t('public.image')" class="up-img">
            <upload v-model="form.logoUrl" ratio="2:1" />
          </el-form-item>
          <el-form-item :label="$t('public.time')">
            <div class="flex align-center">
              <el-form-item>
                <el-date-picker type="datetime" :placeholder="$t('public.statrtTime')" v-model="form.startTime"
                  :picker-options="pickerOptions" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
              </el-form-item>
              <div class="ml-10 mr-10 line">-</div>
              <el-form-item>
                <el-date-picker type="datetime" :placeholder="$t('public.endTime')" v-model="form.endTime"
                  :picker-options="pickerOptions" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
              </el-form-item>
            </div>
          </el-form-item>
          <el-form-item :label="$t('advert.expandMode')">
            <el-radio-group v-model="form.expandMode">
              <el-radio-button :label="1">{{ $t('advert.extendedLongGraph') }}</el-radio-button>
              <el-radio-button :label="2">{{ $t('advert.jumpAdvertisement') }}</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="$t('advert.extendedLongGraph')" class="up-img" v-if="form.expandMode == 1">
            <upload v-model="form.images" :emitUrl="false" :limit="99" />
          </el-form-item>
          <el-form-item :label="$t('system.appid')" v-if="form.expandMode == 2">
            <el-input v-model="form.targetAppId" />
          </el-form-item>
          <el-form-item :label="$t('system.xcxLink')" v-if="form.expandMode == 2">
            <el-input v-model="form.targetAppUrl" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit" :disabled="clickSubmit">{{ $t('public.submit') }}</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { unixTime } from '@/utils/index'
import upload from '@/components/upload'
export default {
  name: 'adEdit',
  components: {
    upload
  },
  data() {
    return {
      category: 'ORDINARY',
      id: this.$route.query.id || '',
      advertTypeCode: this.$route.query.advertTypeCode || '',
      clickSubmit: false,
      positionList: [],
      form: {
        expandMode: 1,
        images: []
      },
      pickerOptions: {
        disabledDate: (time) => {
          return time.getTime() + 86400000 < Date.now()
        }
      },
    }
  },
  mounted() {
    if (this.id > 0) {
      this.getInfo()
    }
    this.getPositions()
  },
  methods: {
    /**
     * 获取广告位
     */
    getPositions() {
      this.$get(`iot-saas-advert/admin/advert/position/find`, {
        category: this.category,
        advertTypeCode: this.advertTypeCode
      }).then(res => {
        this.positionList = res
      })
    },

    /**
     * 获取商户信息
     */
    getInfo() {
      this.$get(`iot-saas-advert/admin/advert/${this.id}`).then(res => {
        let images = []
        if (res.images && res.images.length > 0) {
          res.images.map(item => {
            images.push({
              url: item
            })
          })
        }
        res.images = images
        this.form = res
      })
    },

    /**
     * 提交保存
     */
    onSubmit() {
      let that = this;
      let params = JSON.parse(JSON.stringify(this.form)),
        type = '$post',
        images = []
      if (params.startTime && params.endTime) {
        if (unixTime(params.startTime) > unixTime(params.endTime)) {
          this.$message({
            message: that.$t('public.cannotBeGreaterThan'),
            type: 'error'
          })
          return
        }
      } else {
        this.$message({
          message: that.$t('public.pleaseTime'),
          type: 'error'
        })
        return
      }
      if (params.images.length > 0) {
        params.images.map(item => {
          images.push(item.url)
        })
        params.images = images
      } else {
        delete params.images
      }
      if (this.id > 0) {
        params.id = this.id
        type = '$put'
      }
      this.clickSubmit = true
      this[type](`iot-saas-advert/admin/advert`, params).then(res => {
        this.$message({
          message: that.$t('public.submittedSuccess'),
          type: 'success'
        })
        this.$router.back()
        this.clickSubmit = false
      }).catch(() => {
        this.clickSubmit = false
      })
    }
  }
}
</script>

<style scoped></style>
