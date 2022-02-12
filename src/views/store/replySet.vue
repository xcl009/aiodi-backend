<template>
  <div class="p-5">
    <div class="p-20 bg-white">
      <el-form ref="form" label-width="auto">
        <div class="mb-10" v-if="form.params.length < 5">
          <el-button type="primary" size="small" @click="form.params.push({
            type: 'text',
            content: ''
          })">添加文本</el-button>
          <el-button class="ml-30" type="primary" size="small" @click="form.params.push({
            type: 'image',
            content: []
          })">添加图片</el-button>
        </div>

        <el-form-item label="跳转小程序链接：">
          <div class="flex align-start">
            {{ atStr }}
            <a class="ml-10 cursor text-blue" @click="copyText(atStr); $message({ message: '复制成功', type: 'success'})">复制链接</a>
          </div>
          <div class="fs-s2 text-gray">注：点击复制链接，将复制的内容放入关注回复的文本消息中，用户即可点击跳转到小程序中。</div>
        </el-form-item>

        <template v-for="(item, index) in form.params">
          <el-form-item label="文本回复：" v-if="item.type == 'text'">
            <div class="flex align-start">
              <el-input v-model="item.content" rows="4" type="textarea"/>
              <el-button class="ml-30" type="danger" icon="el-icon-minus" @click="form.params.splice(index, 1)"></el-button>
            </div>
          </el-form-item>
          <el-form-item label="图片回复：" v-if="item.type == 'image'">
            <div class="flex align-start">
              <upload v-model="item.content" :upObj="upObj" :emitUrl="false" action='agentapi/action/wx_material_updimg'/>
              <el-button class="ml-30" type="danger" icon="el-icon-minus" @click="form.params.splice(index, 1)"></el-button>
            </div>
          </el-form-item>
        </template>

        <el-form-item>
          <el-button type="primary" @click="postCard()">立即提交</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  import { copyText } from '@/utils/index'
  import { getToken } from '@/utils/auth'
  import upload from '@/components/upload/'
  export default {
    name: 'replySet',
    components: {
      upload
    },
    data() {
      return {
        copyText: copyText,
        form: {
          params: []
        },
        upObj: {
          account_appid: this.$route.query.appid,
          token: getToken()
        },
        appid: this.$route.query.appid || '',
        store_id: this.$route.query.store_id || '',
        atStr: ''
      }
    },
    mounted() {
      this.getInfo()
      this.getWxxcx()
    },
    methods: {
      /**
       * 获取微信小程序列表
       */
      getWxxcx() {
        this.$get('WxOpen/getWxList', {
          page: 1,
          limit: 1,
          wx_status: 1
        }).then(res => {
          let list = res.list
          if(list.length > 0){
            this.atStr = `<a data-miniprogram-appid="${ list[0].app_id }" data-miniprogram-path="pages/index/index?form_public=true${this.store_id ? '&store_id=' + this.store_id : ''}">借充电宝</a>`
          }
        })
      },

      /**
       * 获取info
       */
      getInfo() {
        this.$get('commonapi/feedback/wxgz_response_detail', {
          account_appid: this.appid
        }).then(res => {
          this.form.params = res.params || []
        })
      },

      /**
       * 提交会员卡信息
       */
      postCard() {
        let url = 'agentapi/feedback/save_wxgz_response',
            form = JSON.parse(JSON.stringify(this.form)),
            params = {
              account_appid: this.appid,
              params: []
            }
        if(form.params){
          form.params.map(item => {
            if(item.content){
              if(item.type == 'image'){
                var media_id = this.arrayKeys(item.content, 'media_id')
                var img_url = this.arrayKeys(item.content, 'url')
                params.params.push({
                  type: item.type,
                  media_id: media_id[0],
                  content: [{
                    media_id: media_id[0],
                    url: img_url[0]
                  }]
                })
              } else {
                params.params.push({
                  type: item.type,
                  content: item.content
                })
              }
            }
          })
        }
        console.log(params)
        this.$post(url, params).then(res => {
          this.$message({
            message: '提交成功',
            type: 'success'
          })
        })
      }
    }
  }
</script>

<style scoped>

</style>
