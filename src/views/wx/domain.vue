<template>
  <div class="app-container">
    <el-row class="bg-white">
      <el-col :span="16">
        <div class="pl-20 pt-10 pb-10 l-b fs-a1">编辑服务域名</div>
        <div class="pt-30 pl-30">
          <el-form ref="form" label-width="200px" label-position="left">
            <el-form-item label="方式：">
              <el-radio-group v-model="action_type">
                <el-radio label="add">添加</el-radio>
                <el-radio label="delete">删除</el-radio>
                <el-radio label="set">覆盖</el-radio>
              </el-radio-group>
            </el-form-item>
            <div v-if="type == 1">
              <el-form-item label="request合法域名：">
                <div v-for="(domain, index) in requestdomain" class="mb-10 flex">
                  <el-input v-model="requestdomain[index]" class="mr-15" />
                  <el-button v-if="index == 0" type="primary" icon="el-icon-plus" @click="addInput(1, {'name': 'requestdomain'})" />
                  <el-button v-else type="primary" icon="el-icon-minus" @click="addInput(2, {'name': 'requestdomain', 'key': index})" />
                </div>
              </el-form-item>
              <el-form-item label="socket合法域名：">
                <div v-for="(domain, index) in wsrequestdomain" class="mb-10 flex">
                  <el-input v-model="wsrequestdomain[index]" class="mr-15" />
                  <el-button v-if="index == 0" type="primary" icon="el-icon-plus" @click="addInput(1, {'name': 'wsrequestdomain'})" />
                  <el-button v-else type="primary" icon="el-icon-minus" @click="addInput(2, {'name': 'wsrequestdomain', 'key': index})" />
                </div>
              </el-form-item>
              <el-form-item label="uploadFile合法域名：">
                <div v-for="(domain, index) in uploaddomain" class="mb-10 flex">
                  <el-input v-model="uploaddomain[index]" class="mr-15" />
                  <el-button v-if="index == 0" type="primary" icon="el-icon-plus" @click="addInput(1, {'name': 'uploaddomain'})" />
                  <el-button v-else type="primary" icon="el-icon-minus" @click="addInput(2, {'name': 'uploaddomain', 'key': index})" />
                </div>
              </el-form-item>
              <el-form-item label="downloadFile合法域名：">
                <div v-for="(domain, index) in downloaddomain" class="mb-10 flex">
                  <el-input v-model="downloaddomain[index]" class="mr-15" />
                  <el-button v-if="index == 0" type="primary" icon="el-icon-plus" @click="addInput(1, {'name': 'downloaddomain'})" />
                  <el-button v-else type="primary" icon="el-icon-minus" @click="addInput(2, {'name': 'downloaddomain', 'key': index})" />
                </div>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="seversDomain">提交</el-button>
              </el-form-item>
            </div>
            <div v-if="type == 2">
              <el-form-item label="业务域名：">
                <div v-for="(domain, index) in webviewdomain" class="mb-10 flex">
                  <el-input v-model="webviewdomain[index]" class="mr-15" />
                  <el-button v-if="index == 0" type="primary" icon="el-icon-plus" @click="addInput(1, {'name': 'webviewdomain'})" />
                  <el-button v-else type="primary" icon="el-icon-minus" @click="addInput(2, {'name': 'webviewdomain', 'key': index})" />
                </div>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="webDomain">提交</el-button>
              </el-form-item>
            </div>
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
      action_type: 'set',
      requestdomain: [''],
      wsrequestdomain: [''],
      uploaddomain: [''],
      downloaddomain: [''],
      webviewdomain: [''],
      type: 0
    }
  },
  mounted() {
    this.type = this.$route.query.type || 1
    if (this.$route.query.app_id) this.getInfo()
  },
  methods: {
    /**
       * 获取信息
       */
    getInfo() {
      let url = 'WxOpen/modifyServerDomain'
      if (this.type == 2) url = 'WxOpen/setWebViewDomain'
      this.$post(url, {
        wxmini_appid: this.$route.query.app_id,
        action_type: 'get'
      }).then(res => {
        if (this.type == 2) this.webviewdomain = res.webviewdomain.length > 0 ? res.webviewdomain : ['']
        if (this.type == 1) {
          this.downloaddomain = res.downloaddomain.length > 0 ? res.downloaddomain : ['']
          this.requestdomain = res.requestdomain.length > 0 ? res.requestdomain : ['']
          this.uploaddomain = res.uploaddomain.length > 0 ? res.uploaddomain : ['']
          this.wsrequestdomain = res.wsrequestdomain.length > 0 ? res.wsrequestdomain : ['']
        }
      })
    },

    /**
       * 提交服务域名
       */
    seversDomain() {
      const url = 'WxOpen/modifyServerDomain'
      const params = {}
      params.wxmini_appid = this.$route.query.app_id
      params.action_type = this.action_type
      params.domains = {
        action: this.action_type,
        requestdomain: JSON.parse(JSON.stringify(this.requestdomain)),
        wsrequestdomain: JSON.parse(JSON.stringify(this.wsrequestdomain)),
        uploaddomain: JSON.parse(JSON.stringify(this.uploaddomain)),
        downloaddomain: JSON.parse(JSON.stringify(this.downloaddomain))
      }
      params.domains = JSON.stringify(params.domains)
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
      })
    },

    /**
       * 提交业务域名
       */
    webDomain() {
      const url = 'WxOpen/setWebViewDomain'
      const params = {}
      params.wxmini_appid = this.$route.query.app_id
      params.action_type = this.action_type
      params.domains = {
        action: this.action_type,
        webviewdomain: JSON.parse(JSON.stringify(this.webviewdomain))
      }
      params.domains = JSON.stringify(params.domains)
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
      })
    },

    /**
       * 获取授权url
       */
    getAuthUrl() {
      this.$post('WxOpen/AuthorizerUrl', {}).then(res => {
        window.open(res.url)
      })
    },

    /**
       * 添加删除input
       */
    addInput(type, params) {
      var self = this
      switch (type) {
        case 1:
          self[params.name].push('')
          break
        case 2:
          self[params.name].splice(params.key, 1)
          break
      }
    }
  }
}
</script>

<style scoped>

</style>
