<template>
  <div class="p-10">
    <el-row class="p-30 bg-white">
      <el-col>
        <el-form ref="form" :model="form" label-width="auto">
          <el-form-item label="广告位：">
            <el-select v-model="form.position_id" placeholder="选择广告位">
              <el-option v-for="item in positionList" v-if="item.has_access == 1" :label="item.name" :value="item.position_id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="名称：">
            <el-input v-model="form.ad_name" placeholder="输入广告名称"/>
          </el-form-item>
          <el-form-item label="图片：">
            <upload :file-list="fileList" :ratio="proportion[form.position_id]" @fileOk="fileOk"/>
          </el-form-item>
          <el-form-item label="排序：">
            <el-input v-model="form.orderby" placeholder="" />
          </el-form-item>
          <el-form-item label="时间：">
            <el-date-picker
              v-model="time"
              value-format="timestamp"
              type="datetimerange"
              :unlink-panels="true"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="重定向链接：">
            <el-input v-model="form.ad_link" placeholder="请填写关联的公众号文章链接或报名活动链接"/>
          </el-form-item>
          <el-form-item label="投放设备：">
            <el-switch v-model="form.is_all" />
            <div class="el-upload__tip">开启表示投放到全部设备。关闭表示投放到指定设备(编辑提交完成后可到广告列表绑定设备)</div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit">提交</el-button>
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
        proportion: { 1: '3:3.75', 2: '4:1', 3: '2:1', 4: '2:1'},
        positionList: [],
        form: {
          position_id: ''
        },
        time: [],
        fileList: [],
        id: ''
      }
    },
    mounted() {
      if(this.$route.query.pid) this.form.position_id = parseInt(this.$route.query.pid)
      if(this.$route.query.id > 0){
        this.id = this.$route.query.id
        this.getInfo()
      }
      this.getPower()
    },
    methods: {
      /**
       * 获取可以添加的广告位
       */
      getPower() {
        this.$get('agentapi/get_ad_auths').then(res => {
          this.positionList = res
        })
      },

      /**
       * 获取商户信息
       */
      getInfo() {
        this.$get('agentapi/ad_detail', {
          id: this.id
        }).then(res => {
          this.time = [res.info.start_date * 1000, res.info.end_date * 1000]
          this.fileList = [{ url: res.info.img_url }]
          res.info.is_all = res.info.is_all == 1 ? true : false
          this.form = res.info
        })
      },

      onSubmit() {
        let params = this.form, url = 'agentapi/add_ad'
        if(this.time[1] <= this.time[0]){
          this.$message({
            message: '广告投放结束时间必须大于开始时间',
            type: 'error'
          })
          return
        }
        params.start_date = this.parseTime(this.time[0])
        params.end_date = this.parseTime(this.time[1])
        if(this.id > 0){
          params.id = this.id
          url = 'agentapi/edit_ad'
        }
        params.is_all = params.is_all ? 1 : 0
        this.$post(url, params).then(res => {
          this.$message({
            message: '提交成功',
            type: 'success'
          })
          this.$router.push({ path: '/adver/photo', query: { 'pid': this.form.position_id } })
        })
      },

      /**
       * 上传文件成功通知
       */
      fileOk(arr){
        this.form.img_url = arr[0] || ''
      }
    }
  }
</script>

<style scoped>
</style>
