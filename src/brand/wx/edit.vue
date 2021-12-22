<template>
  <div class="app-container">
    <el-row class="bg-white">
      <el-col :span="16">
        <div class="pl-20 pt-10 pb-10 l-b fs-a1">绑定小程序</div>
        <div class="pl-30">
          <div class="pt-20 mb-20 flex fs-c1" v-if="siteInfo.wx_third_api_switch">
            <span>请先将小程序授权给我们，才能给您发布代码，</span>
            <el-link class="fs-c1" :href="`${baseURL}Authorize/authorize`" target="_blank" type="primary">点我进行授权</el-link>
            <span>，请勾选全部权限，否则授权无效噢！</span>
            <router-link :to="`/tutorial/detail/${config.wx_tutorial_id}`" target="_blank">
              <el-link class="fs-c1" target="_blank" type="danger">查看资料获取教程</el-link>
            </router-link>
          </div>
          <el-form ref="form" :model="form" label-width="200px" label-position="left">
            <el-form-item label="小程序名称：">
              <el-input v-model="form.app_name"></el-input>
            </el-form-item>
            <el-form-item label="小程序标识(APPID)：">
              <el-input v-model="form.app_id"></el-input>
            </el-form-item>
            <el-form-item label="小程序APPSECRET：">
              <el-input v-model="form.app_secret"></el-input>
            </el-form-item>
            <el-form-item label="小程序原始ID：">
              <el-input v-model="form.origin_id"></el-input>
            </el-form-item>
            <el-form-item label="微信支付商户号(MCHID)：">
              <el-input v-model="form.pay_mchid"></el-input>
            </el-form-item>
            <el-form-item label="微信支付API秘钥(key)：">
              <el-input v-model="form.pay_key"></el-input>
            </el-form-item>
            <el-form-item label="微信支付APIV3秘钥：">
              <el-input v-model="form.apiv3_key"></el-input>
            </el-form-item>
            <el-form-item label="支付证书(apiclient_cert)：">
              <el-input v-model="form.payssl_cert" type="textarea" :rows="6"></el-input>
            </el-form-item>
            <el-form-item label="支付证书密钥(apiclient_key)：">
              <el-input v-model="form.payssl_key" type="textarea" :rows="6"></el-input>
            </el-form-item>
            <el-form-item label="支付API证书序列号：">
              <el-input v-model="form.serial_no"></el-input>
            </el-form-item>
            <el-form-item label="微信支付分id(service_id)：">
              <el-input v-model="form.service_id"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSubmit" :disabled="clickSubmit">提交</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  export default {
    components: {

    },
    data() {
      return {
        clickSubmit: false,
        baseURL: this.config.BASE_URL,
        form: {}
      }
    },
    computed: {
      siteInfo(){
        return this.$store.state.user.siteInfo
      }
    },
    mounted() {
      console.log(this.config)
      if(this.$route.params.id > 0) this.getInfo()
    },
    methods: {
      /**
       * 获取商户信息
       */
      getInfo() {
        this.$get('WxOpen/getWxInfo', {
          config_id: this.$route.params.id
        }).then(res => {
          res.mine_agent_id = res.agent_id
          this.form = this.pick(res, [
            'mine_agent_id',
            'app_name',
            'app_id',
            'app_secret',
            'origin_id',
            'pay_mchid',
            'pay_key',
            'payssl_cert',
            'payssl_key',
            'apiv3_key',
            'serial_no',
            'service_id'
          ])
        })
      },

      onSubmit() {
        let url = 'WxOpen/editWxInfo',
          params = JSON.parse(JSON.stringify(this.form))
          if(this.$route.params.id > 0) params.id = this.$route.params.id
          this.clickSubmit = true
        this.$post(url, params).then(res => {
          this.$message({
            message: '提交成功',
            type: 'success'
          })
          if(this.checkRoles(['terminal'])){
            this.$router.push({
              path: '/wx/index'
            })
            return
          }
          this.$router.push({
            path: '/setting/index'
          })
        }).catch(err => {
          this.clickSubmit = false
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
