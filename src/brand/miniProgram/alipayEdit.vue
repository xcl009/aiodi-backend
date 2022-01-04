<template>
  <div>
    <el-row class="pl-30 pr-30 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="12" :lg="10">
        <h4>绑定小程序</h4>
          <!-- <div class="pt-20 mb-20 flex fs-c1">
            <span>请先将小程序授权给我们，才能给您发布代码，</span>
            <el-link class="fs-c1" :href="`${baseURL}AlipayMini/appToAppBatchAuth`" target="_blank" type="primary">点我进行授权</el-link>
            <span>，请勾选全部权限，否则授权无效噢！</span>
            <router-link :to="`/tutorial/detail/${config.zfb_tutorial_id}`">
              <el-link class="fs-c1" target="_blank" type="danger">查看资料获取教程</el-link>
            </router-link>
          </div> -->
        <el-form ref="form" :rules="rules" :model="form" label-position="left" label-width="150px">
          <el-form-item label="支付宝账号ID">
            <el-input v-model="form.pid"></el-input>
          </el-form-item>
          <el-form-item label="小程序名称">
            <el-input v-model="form.app_name"></el-input>
          </el-form-item>
          <el-form-item label="小程序标识(APPID)">
            <el-input v-model="form.app_id"></el-input>
          </el-form-item>
          <el-form-item label="接口内容加密方式">
            <el-input v-model="form.aes_key"></el-input>
          </el-form-item>
          <el-form-item label="应用私钥">
            <el-input v-model="form.private_key" type="textarea" :rows="6"></el-input>
          </el-form-item>
          <el-form-item label="应用公钥证书">
            <el-input v-model="form.app_cert" type="textarea" :rows="6"></el-input>
          </el-form-item>
          <el-form-item label="支付宝公钥证书">
            <el-input v-model="form.alipay_cert" type="textarea" :rows="6"></el-input>
          </el-form-item>
          <el-form-item label="支付宝根证书">
            <el-input v-model="form.root_cert" type="textarea" :rows="6"></el-input>
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
      if(this.$route.params.id > 0) this.getInfo()
    },
    methods: {
      /**
       * 获取信息
       */
      getInfo() {
        this.$get('AlipayMini/getConfig', {
          app_id: this.$route.params.id
        }).then(res => {
          this.form = {
            mine_agent_id: res.agent_id,
            app_name: res.app_name,
            app_id: res.appId,
            pid: res.pid,
            aes_key: res.aes_key,
            service_id: res.service_id,
            public_key: res.alipayrsaPublicKey,
            app_cert: res.app_cert,
            alipay_cert: res.alipay_cert,
            root_cert: res.root_cert,
            private_key: res.rsaPrivateKey,
            status: 1
          }
        })
      },

      onSubmit() {
        let url = 'AlipayMini/saveConfig',
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
              path: '/ali/index'
            })
            return
          }
          this.$router.push({
            path: '/setting/aliIndex'
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
