<template>
  <div>
    <el-row class="pl-30 pr-30 custom-form bg-white">
      <el-col :xs="24" :sm="24" :md="18" :lg="16" :xl="12">
        <h4>绑定小程序</h4>
          <!-- <div class="pt-20 mb-20 flex fs-c1">
            <span>请先将小程序授权给我们，才能给您发布代码，</span>
            <el-link class="fs-c1" :href="`${baseURL}AlipayMini/appToAppBatchAuth`" target="_blank" type="primary">点我进行授权</el-link>
            <span>，请勾选全部权限，否则授权无效噢！</span>
            <router-link :to="`/tutorial/detail/${config.zfb_tutorial_id}`">
              <el-link class="fs-c1" target="_blank" type="danger">查看资料获取教程</el-link>
            </router-link>
          </div> -->
        <el-form ref="form" :model="form" label-position="left" label-width="210px">
          <el-form-item label="支付宝账号ID">
            <el-input v-model="form.pid"></el-input>
          </el-form-item>
          <el-form-item label="小程序名称">
            <el-input v-model="form.appName"></el-input>
          </el-form-item>
          <el-form-item label="小程序标识(APPID)">
            <el-input v-model="form.appId"></el-input>
          </el-form-item>
          <el-form-item label="接口内容加密方式">
            <el-input v-model="form.signType"></el-input>
          </el-form-item>
          <el-form-item label="应用私钥">
            <el-input v-model="form.appPrivateKey" type="textarea" :rows="6"></el-input>
          </el-form-item>
          <el-form-item label="应用公钥">
            <el-input v-model="form.appPublicKey" type="textarea" :rows="6"></el-input>
          </el-form-item>
          <el-form-item label="支付宝公钥">
            <el-input v-model="form.alipayPublicKey" type="textarea" :rows="6"></el-input>
          </el-form-item>
          <el-form-item label="应用公钥证书">
            <el-input v-model="form.appCert" type="textarea" :rows="6"></el-input>
          </el-form-item>
          <el-form-item label="支付宝公钥证书">
            <el-input v-model="form.alipayCert" type="textarea" :rows="6"></el-input>
          </el-form-item>
          <el-form-item label="支付宝根证书">
            <el-input v-model="form.alipayRootCert" type="textarea" :rows="6"></el-input>
          </el-form-item>
          <el-form-item label="信用服务id">
            <el-input v-model="form.service_id"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit" :disabled="clickSubmit">立即提交</el-button>
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
        form: {
          status: 1
        }
      }
    },
    computed: {
      siteInfo(){
        return this.$store.state.user.siteInfo
      }
    },
    mounted() {
      if(this.$route.query.app_id > 0) this.getInfo()
    },
    methods: {
      /**
       * 获取信息
       */
      getInfo() {
        this.$post('iot-saas-pay/admin/pay/config/alipay/detail', {
          appId: this.$route.query.app_id
        }).then(res => {
          this.form = this.pick(res, [
            'pid',
            'appName',
            'appId',
            'signType',
            'appPrivateKey',
            'appPublicKey',
            'alipayPublicKey',
            'appCert',
            'alipayCert',
            'alipayRootCert',
            'service_id'
          ])
        })
      },

      /**
       * 提交保存
       */
      onSubmit() {
        let url = 'iot-saas-pay/admin/pay/config/alipay/save',
          params = JSON.parse(JSON.stringify(this.form))
        if(this.$route.params.id > 0) params.id = this.$route.params.id
        this.clickSubmit = true
        params.signType = 'RSA2'
        params.gatewayUrl = 'dsdf'
        this.$post(url, params).then(res => {
          this.$message({
            message: '提交成功',
            type: 'success'
          })
          this.$router.push({
            path: '/systemSet/alipay'
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
