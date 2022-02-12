<template>
  <div>
    <el-row class="pl-30 pr-30 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="12" :lg="10">
        <h4>绑定小程序</h4>
        <!-- <div class="pt-20 mb-20 flex fs-c1">
          <span>请先将小程序授权给我们，才能给您发布代码，</span>
          <el-link class="fs-c1" :href="`${baseURL}Authorize/authorize`" target="_blank" type="primary">点我进行授权</el-link>
          <span>，请勾选全部权限，否则授权无效噢！</span>
          <router-link :to="`/tutorial/detail/${config.wx_tutorial_id}`" target="_blank">
            <el-link class="fs-c1" target="_blank" type="danger">查看资料获取教程</el-link>
          </router-link>
        </div> -->
        <el-form ref="form" :model="form" label-position="left" label-width="210px">
          <el-form-item label="小程序名称">
            <el-input v-model="form.appName"></el-input>
          </el-form-item>
          <el-form-item label="小程序标识(APPID)">
            <el-input v-model="form.appId"></el-input>
          </el-form-item>
          <el-form-item label="小程序APPSECRET">
            <el-input v-model="form.appSecret"></el-input>
          </el-form-item>
          <el-form-item label="小程序原始ID">
            <el-input v-model="form.originId"></el-input>
          </el-form-item>
          <el-form-item label="微信支付商户号(MCHID)">
            <el-input v-model="form.appMchid"></el-input>
          </el-form-item>
          <el-form-item label="微信支付API秘钥(key)">
            <el-input v-model="form.apiv2Key"></el-input>
          </el-form-item>
          <el-form-item label="微信支付APIV3秘钥">
            <el-input v-model="form.apiv3Key"></el-input>
          </el-form-item>
          <el-form-item label="支付证书(apiclient_cert)">
            <el-input v-model="form.apiclientCert" type="textarea" :rows="6"></el-input>
          </el-form-item>
          <el-form-item label="支付证书密钥(apiclient_key)">
            <el-input v-model="form.apiclientKey" type="textarea" :rows="6"></el-input>
          </el-form-item>
          <el-form-item label="微信支付分ID">
            <el-input v-model="form.serviceId"></el-input>
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
      if(this.$route.query.app_id) this.getInfo()
    },
    methods: {
      /**
       * 获取信息
       */
      getInfo() {
        this.$post('iot-saas-pay/admin/pay/config/wechat/detail', {
          appId: this.$route.query.app_id
        }).then(res => {
          this.form = this.pick(res, [
            'appName',
            'appId',
            'appSecret',
            'originId',
            'appMchid',
            'apiv2Key',
            'apiv3Key',
            'apiclientCert',
            'apiclientKey',
            'serviceId'
          ])
        })
      },

      /**
       * 提交信息
       */
      onSubmit() {
        let url = 'iot-saas-pay/admin/pay/config/wechat/save',
          params = JSON.parse(JSON.stringify(this.form))
        this.clickSubmit = true
        this.$post(url, params).then(res => {
          this.$message({
            message: '提交成功',
            type: 'success'
          })
          // if(this.checkRoles(['terminal'])){
          //   this.$router.push({
          //     path: '/wx/index'
          //   })
          //   return
          // }
          this.$router.push({
            path: '/systemSet/wechat'
          })
          this.clickSubmit = false
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
