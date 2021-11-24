<template>
  <div class="p-10">
    <el-row class="p-30 bg-white">
      <el-col>
        <el-form ref="form" :model="form" label-width="auto">
          <el-form-item label="关联类型：">
            <el-select v-model="form.info_type">
              <el-option label="不关联" :value="-1"></el-option>
              <el-option v-for="(item, index) in deviceNameObj" :label="index" :value="item"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="名称：">
            <el-input v-model="form.info_name" placeholder="输入报名活动名称(分享标题)"/>
          </el-form-item>
          <el-form-item label="图片：">
            <upload v-model="form.img_url" :emitUrl="false" :limit="99"/>
          </el-form-item>
          <el-form-item label="微信号：">
            <el-input v-model="form.wechat" placeholder="" />
          </el-form-item>
          <el-form-item label="手机号码：">
            <el-input v-model="form.phone" placeholder="" />
          </el-form-item>
          <el-form-item label="底部按钮文字：">
            <el-input v-model="form.introduce.foot_text">
              <el-popover slot="append" trigger="hover">
                <img src="@/assets/gzh.jpg" alt="">
                <el-button slot="reference" icon="el-icon-question"></el-button>
              </el-popover>
            </el-input>
          </el-form-item>
          <el-form-item label="提交资料标题：">
            <el-input v-model="form.introduce.modal_title">
              <el-popover slot="append" trigger="hover">
                <img src="@/assets/gzh.jpg" alt="">
                <el-button slot="reference" icon="el-icon-question"></el-button>
              </el-popover>
            </el-input>
          </el-form-item>
          <el-form-item label="提交资料按钮文字：">
            <el-input v-model="form.introduce.modal_btntext">
              <el-popover slot="append" trigger="hover">
                <img src="@/assets/gzh.jpg" alt="">
                <el-button slot="reference" icon="el-icon-question"></el-button>
              </el-popover>
            </el-input>
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
  import upload from '@/components/upload/two'
  export default {
    components: {
      upload
    },
    data() {
      return {
        form: {
          introduce: {
            foot_text: '名额有限，领取机会',
            modal_title: '马上加入我们，开启赚钱红利',
            modal_btntext: '立即提交了解详情'
          },
          info_type: -1,
          img_url: []
        },
        id: this.$route.query.id
      }
    },
    computed: {
      deviceNameObj(){
        return this.$store.state.user.deviceNameObj
      }
    },
    mounted() {
      if(this.id > 0) this.getInfo()
    },
    methods: {
      /**
       * 获取信息
       */
      getInfo() {
        this.$get('commonapi/signin/detail', {
          id: this.id
        }).then(res => {
          let img_url = []
          res.img_url = res.img_url ? JSON.parse(res.img_url) : []
          for(var i in res.img_url){
            img_url.push({
              url: res.img_url[i]
            })
          }
          res.img_url = img_url
          res.introduce = res.introduce ? JSON.parse(res.introduce) : {}
          this.form = res
        })
      },

      /**
       * 提交数据
       */
      onSubmit() {
        let params = JSON.parse(JSON.stringify(this.form))
        params.img_url = this.arrayKeys(params.img_url, 'url')
        params.introduce = JSON.stringify(params.introduce)
        if(this.id > 0) params.id = this.id
        this.$post('/signin/save', params).then(res => {
          this.$message({
            message: '提交成功',
            type: 'success'
          })
          this.$router.push({ path: '/signup/index' })
        })
      }
    }
  }
</script>

<style scoped>
</style>
