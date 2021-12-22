<template>
  <div class="p-5">
    <el-row class="bg-white">
      <el-col :span="16">
        <div class="pl-20 pt-10 pb-10 l-b fs-a1">
          公众号配置
          <router-link :to="`/shop/replySet?appid=${form.account_appid}`" target="_blank" v-if="form.account_appid">
            <el-link class="ml-20 fs-c1" target="_blank" type="primary">关注回复配置</el-link>
          </router-link>
        </div>
        <div class="pt-30 pl-30">
          <el-form ref="form" :model="form" label-width="200px" label-position="left">
            <el-popover
              placement="top-start"
              title="基础信息"
              width="300"
              trigger="hover"
              content="页面引导关注展示的公众号基本信息"
            >

              <h4 slot="reference">基础信息<i class="el-icon-question" /></h4>
            </el-popover>
            <el-form-item label="公众号Logo：">
              <upload v-model="form.account_logo" />
            </el-form-item>
            <el-form-item label="公众号名称：">
              <el-input v-model="form.account_name" />
            </el-form-item>
            <el-form-item label="公众号说明：">
              <el-input v-model="form.account_remask" />
            </el-form-item>
            <el-form-item label="关注引导语：">
              <el-input v-model="form.leading_words" />
            </el-form-item>
            <el-form-item label="关注链接：">
              <el-input v-model="form.follow_http">
                <el-popover
                  slot="append"
                  placement="top-start"
                  title="关注链接"
                  width="300"
                  trigger="hover"
                  content="小程序关联的公众号中添加一篇引导关注的文章,将文章链接填入此即可"
                >
                  <el-button slot="reference" icon="el-icon-question" />
                </el-popover>

              </el-input>
            </el-form-item>
            <el-form-item label="关注开启：">
              <el-switch v-model="form.follow_open" :active-value="1" :inactive-value="0" />
            </el-form-item>

            <el-popover
              placement="top-start"
              title="基础配置"
              width="300"
              trigger="hover"
              content="填写此配置表示已关注公众号的下级代理、商户、用户能接收系统设置的模板消息。"
            >
              <h4 slot="reference">基础配置<i class="el-icon-question" /></h4>
            </el-popover>
            <el-form-item label="公众号标识(APPID)：">
              <el-input v-model="form.account_appid" />
            </el-form-item>
            <el-form-item label="原始ID(original_id)：">
              <el-input v-model="form.original_id" />
            </el-form-item>
            <el-form-item label="公众号APPSECRET：">
              <el-input v-model="form.account_appsecret" />
            </el-form-item>
            <el-form-item label="服务器地址：">
              <el-input v-model="form.account_url" />
            </el-form-item>
            <el-form-item label="令牌(token)：">
              <el-input v-model="form.account_token" />
            </el-form-item>
            <el-form-item label="消息加解密密钥：">
              <el-input v-model="form.EncodingAESKey" />
            </el-form-item>
            <el-form-item label="加密模式：">
              <el-select v-model="form.encryption_method" placeholder="请选择">
                <el-option label="明文模式" value="text" />
                <el-option label="兼容模式" value="compatibility" />
                <el-option label="安全模式" value="security" />
              </el-select>
            </el-form-item>            
            <el-form-item label="免费充电次数：">
              <el-input v-model="form.free_order_num" />
            </el-form-item>
            <el-form-item label="关注免费充电：">
              <el-switch v-model="form.free_order_switch" :active-value="1" :inactive-value="0" />
            </el-form-item>
            <el-form-item label="所有商户关注此公众号：">
              <el-switch v-model="form.cover_all_stores" :active-value="1" :inactive-value="0" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSubmit">提交</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import upload from '@/components/upload/two.vue'
export default {
  components: {
    upload
  },
  data() {
    return {
      baseURL: this.config.BASE_URL,
      mine_id: this.$route.query.mine_id || '',
      form: {}
    }
  },
  computed: {
    agentInfo() {
      return this.$store.getters.agentInfo
    }
  },
  mounted() {
    this.getInfo()
  },
  methods: {
    /**
     * 获取商户信息
     */
    getInfo() {
      const params = {}
      if (this.mine_id > 0) params.mine_agent_id = this.mine_id
      this.$get('MpWeixin/getWxCfgInfo', params).then(res => {
        res = res || {}
        res.mine_agent_id = res.agent_id || this.agentInfo.id
        res.encryption_method = res.encryption_method || 'text'
        res.follow_open = res.follow_open || 0
        this.form = res
      })
    },

    onSubmit() {
      const url = 'MpWeixin/saveWxCfg'
      const params = JSON.parse(JSON.stringify(this.form))
      this.$post(url, params).then(res => {
        this.$message({
          message: '提交成功',
          type: 'success'
        })
        if (this.checkRoles(['terminal'])) {
          this.$router.push({
            path: '/wx/wxpublic'
          })
        }
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
