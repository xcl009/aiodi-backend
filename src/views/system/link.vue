<template>
  <div class="p-20 bg-white">
    <el-table class="custom" :data="list" stripe highlight-current-row>
      <el-table-column label="名称">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="链接">
        <template slot-scope="scope">
          <div v-if="scope.row.deviceTypeCode">二维码链接：{{ scope.row.link }}</div>
          <div class="mt-10" v-if="scope.row.deviceTypeCode">小程序链接：{{ config.xcx_page[scope.row.deviceTypeCode] }}</div>
          <div v-else>{{ scope.row.link }}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" plain @click="copyLink(scope.row)">复制链接</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pt-20 fs-s4">
      <div class="mb-15">
        温馨提示：扫二维码进入小程序需要登录微信、支付宝小程序添加普通二维码跳转小程序规则。添加方法：<a class="text-blue" href="https://developers.weixin.qq.com/miniprogram/introduction/qrcode.html#%E9%85%8D%E7%BD%AE%E6%B5%81%E7%A8%8B" target="_blank">微信</a>、<a class="text-blue" href="https://opendocs.alipay.com/mini/operation/vzd5v0" target="_blank">支付宝</a>。需要上传校验文件时，下载文件后点击下面上传校验文件。
      </div>
      <upload uploadText="上传校验文件" accept=".txt,.html" :raw="true" @getFile="getFile"/>
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
            link: 'pagesA/pages/index/index'
          },
          {
            name: '个人中心',
            link: 'pagesA/pages/user/user'
          },
          {
            name: '我的订单',
            link: 'pagesA/pages/user/order'
          },
          {
            name: '我的钱包',
            link: 'pagesA/pages/wallet/wallet'
          },
          {
            name: '代理商登录',
            link: 'pages/agent/login'
          },
          {
            name: 'PC端登录页',
            link: `${window.location.host}/login/${agentInfo['brandId']}`
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
        for(var i in this.myDeviceName){
          this.list.push({
            name: i,
            deviceTypeCode: this.myDeviceName[i],
            link: `${this.config.CODE_URL}${this.agentInfo.brandCode}/${this.myDeviceName[i]}/`
          })
        }
      },

      /**
       * 上传文件
       */
      getFile(file){
        let params = new FormData()
        params.append('file', file)
        this.loadObj = this.$loading({
          lock: true,
          text: '上传中',
          spinner: 'el-icon-loading'
        })
        this.$post('iot-saas-device/file/uploads', params).then(res => {
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
