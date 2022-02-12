<template>
  <div class="bg-white">
    <el-table :data="list" stripe highlight-current-row>
      <el-table-column label="名称">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="链接">
        <template slot-scope="scope">
          <div v-if="scope.row.deviceType >= 0">二维码：{{ scope.row.link }}</div>
          <div class="mt-10" v-if="scope.row.deviceType >= 0">小程序：{{ config.xcx_page[scope.row.deviceType] }}</div>
          <div v-else>{{ scope.row.link }}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" round plain @click="copyLink(scope.row)">复制链接</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pl-15 pb-10 pt-20 fs-s4">
      <div class="mb-15">
        温馨提示：扫二维码进入小程序需要登录微信、支付宝小程序添加普通二维码跳转小程序规则。添加方法：<a class="text-blue" href="https://developers.weixin.qq.com/miniprogram/introduction/qrcode.html#%E9%85%8D%E7%BD%AE%E6%B5%81%E7%A8%8B" target="_blank">微信</a>、<a class="text-blue" href="https://opendocs.alipay.com/mini/operation/vzd5v0" target="_blank">支付宝</a>。需要上传校验文件时，下载文件后点击下面上传校验文件。
      </div>
      <upload uploadText="上传校验文件" :raw="true" @getFile="getFile"/>
    </div>
  </div>
</template>

<script>
  import { copyText } from '@/utils/index'
  import { getToken } from '@/utils/auth'
  import upload from '@/components/upload/'
  export default {
    name: 'alink',
    components: {
      upload
    },
    data() {
      return {
        list: [
          {
            name: '首页',
            link: 'pages/index/index'
          },
          {
            name: '附近商家',
            link: 'packageB/pages/store/list'
          },
          {
            name: '个人中心',
            link: 'pages/me/user/user'
          },
          {
            name: '我的订单',
            link: 'pages/me/order/order'
          },
          {
            name: '帮助中心',
            link: 'packageB/pages/helpCenter/helpCenter'
          },
          {
            name: '关于我们',
            link: 'pages/me/about/about'
          },
          {
            name: '我的钱包',
            link: 'packageB/pages/wallet/index'
          },
          {
            name: '代理商登录',
            link: 'pages/agent/login/login'
          },
          {
            name: 'PC端登录页',
            link: `http://${window.location.host}/login/${getToken("agent_id")}`
          }
        ],
        checkFile: ''
      }
    },
    computed: {
      myDeviceName() {
        return this.$store.getters.myDeviceName
      },
      agentInfo(){
        return this.$store.getters.agentInfo
      }
    },
    mounted() {
      this.getDeviceList()
    },
    methods: {
      /*
      *链接地址
      **/
      copyLink(row){
        copyText(row.link)
        this.$message({
          message: '复制成功',
          type: 'success'
        })
      },

      /**
       * 获取设备类型
       */
      getDeviceList() {
        this.$get('agentapi/goods/goods_detail_types', {
          limit: 1000
        }).then(res => {
          let jump_tag_obj = {}
          res.list.map(item => {
            jump_tag_obj[item.depend_type] = jump_tag_obj[item.depend_type] ? jump_tag_obj[item.depend_type] : item.code_type
          })
          this.getInfo(jump_tag_obj)
        })
      },

      /**
       * 获取配置
       */
      getInfo(jump_tag_obj){
        this.$get('QRcode/getCodesnUnifiedConfig').then(res => {
          this.codeConfig = res
          let url = `http://${res.domain}/${res.jump_tag}${this.agentInfo.id}/`
          if(res.open_scan == 1){
            url = `${this.DEVICDE_CODE_URL}scan/${res.jump_tag}${this.agentInfo.id}/`
          }
          for(var i in this.myDeviceName){
            this.list.push({
              deviceType: this.myDeviceName[i],
              name: `${i}二维码、小程序地址`,
              link: `${url}${jump_tag_obj[this.myDeviceName[i]]}/`
            })
          }
        })
      },

      /**
       * 上传文件
       */
      getFile(file){
        let params = new FormData()
        params.append('file_name', file)
        params.append('jump_tag', this.codeConfig.jump_tag)
        params.append('site_agent_id', this.agentInfo.id)
        params.append('open_scan', this.codeConfig.open_scan)
        this.loadObj = this.$loading({
          lock: true,
          text: '上传中',
          spinner: 'el-icon-loading'
        })
        this.$post('/QRcode/add_verify_file', params).then(res => {
          this.loadObj.close()
          this.$message({
            message: '上传成功',
            type: 'success'
          })
        }).catch(err => {
          this.loadObj.close()
        })
      },
    },
  }
</script>

<style lang="scss" scoped>

</style>
