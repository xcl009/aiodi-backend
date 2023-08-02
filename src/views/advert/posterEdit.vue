<template>
  <div>
    <el-row class="pt-30 pl-30 pr-30 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="12" :lg="10">
        <el-form ref="form" :model="form" label-width="auto">
          <el-form-item label="广告位">
            <el-select v-model="form.advertPositionId" placeholder="选择广告位">
              <el-option v-for="item in positionList" :label="item.title" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="名称">
            <el-input v-model="form.title" placeholder="输入广告名称" />
          </el-form-item>
          <el-form-item label="图片" class="up-img">
            <upload v-model="form.logoUrl" ratio="4:2" />
          </el-form-item>
          <el-form-item label="时间">
            <div class="flex align-center">
              <el-form-item>
                <el-date-picker type="datetime" placeholder="开始时间" v-model="form.startTime" :picker-options="pickerOptions" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
              </el-form-item>
              <div class="ml-10 mr-10 line">-</div>
              <el-form-item>
                <el-date-picker type="datetime" placeholder="结束时间" v-model="form.endTime" :picker-options="pickerOptions" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
              </el-form-item>
            </div>
          </el-form-item>
          <el-form-item label="拓展方式">
            <el-radio-group v-model="form.expandMode">
              <el-radio-button :label="1">拓展长图</el-radio-button>
              <el-radio-button :label="2">跳转广告</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="拓展长图" class="up-img" v-if="form.expandMode == 1">
            <upload v-model="form.images" :emitUrl="false" :limit="99" />
          </el-form-item>
          <el-form-item label="小程序appid" v-if="form.expandMode == 2">
            <el-input v-model="form.targetAppId" />
          </el-form-item>
          <el-form-item label="小程序链接" v-if="form.expandMode == 2">
            <el-input v-model="form.targetAppUrl" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit" :disabled="clickSubmit">提交</el-button>
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
          if(res.images && res.images.length > 0){
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
        let params = JSON.parse(JSON.stringify(this.form)),
          type = '$post',
          images = []
        if(params.startTime && params.endTime){
          if(unixTime(params.startTime) > unixTime(params.endTime)){
            this.$message({
              message: '开始时间不能大于结束时间',
              type: 'error'
            })
            return
          }
        }else{
          this.$message({
            message: '请选择时间',
            type: 'error'
          })
          return
        }
        if(params.images.length > 0){
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
            message: '提交成功',
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

<style scoped>
</style>
