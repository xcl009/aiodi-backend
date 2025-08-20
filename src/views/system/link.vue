<template>
  <div class="p-20 bg-white">
    <el-table class="custom" :data="list" highlight-current-row>
      <el-table-column :label="$t('public.name')">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('public.link')">
        <template slot-scope="scope">
          <div v-if="scope.row.deviceTypeCode">{{ $t('system.ewmLink') }}: {{ scope.row.link }}</div>
          <div class="mt-10" v-if="scope.row.deviceTypeCode">{{ $t('system.xcxLink') }}: {{
            config.xcx_page[scope.row.deviceTypeCode] }}</div>
          <div v-else>{{ scope.row.link }}</div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('public.actions')">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" plain @click="copyLink(scope.row)">{{ $t('layout.copyLink') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pt-20 fs-s4">
      <div class="mb-15">
        {{ $t('system.text10') }}: <a class="text-blue"
          href="https://developers.weixin.qq.com/miniprogram/introduction/qrcode.html#%E9%85%8D%E7%BD%AE%E6%B5%81%E7%A8%8B"
          target="_blank">{{ $t('payType.wx') }}</a>、<a class="text-blue" href="https://opendocs.alipay.com/mini/operation/vzd5v0"
          target="_blank">{{ $t('payType.zfb') }}</a>。{{ $t('system.text11') }}。
      </div>
      <upload :uploadText="$t('system.uploadWj')" accept=".txt,.html" :upObj="upObj" />
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
      upObj: {
        fileType: 'wxAliCheck'
      },
      checkFile: ''
    }
  },
  computed: {
    myDeviceName() {
      return this.$store.getters.myDeviceName
    },
    agentInfo() {
      return this.$store.getters.agentInfo
    },
    list() {
      return [
        {
          name: this.$t('system.home'),
          link: 'pagesA/pages/index/index'
        },
        {
          name: this.$t('system.personalCenter'),
          link: 'pagesA/pages/user/user'
        },
        {
          name: this.$t('system.myOder'),
          link: 'pagesA/pages/user/order'
        },
        {
          name: this.$t('system.myWallet'),
          link: 'pagesA/pages/wallet/wallet'
        },
        {
          name: this.$t('system.agentLogin'),
          link: 'pages/agent/login'
        },
        {
          name: this.$t('system.pcLogin'),
          link: `${window.location.host}/login/${agentInfo['brandId']}`
        }
      ]
    },
  },
  mounted() {
    this.getDeviceList()
  },
  methods: {
    /*
    *链接地址
    **/
    copyLink(row) {
      let that = this;
      copyText(row.link)
      this.$message({
        message: that.$t('public.copySuccess'),
        type: 'success'
      })
    },

    /**
     * 获取设备类型
     */
    getDeviceList() {
      for (var i in this.myDeviceName) {
        this.list.push({
          name: i,
          deviceTypeCode: this.myDeviceName[i],
          link: `${this.config.CODE_URL}${this.SITE_INFO.code}/${this.myDeviceName[i]}/`
        })
      }
    },

    /**
     * 上传文件
     */
    getFile(file) {
      let that = this;
      let params = new FormData()
      params.append('file', file)
      let reader = new FileReader()
      //将上传的文件读取成text
      reader.onload = function () {
        console.log(reader.result,'reader');
      }
      reader.readAsText(file)
      return
      this.loadObj = this.$loading({
        lock: true,
        text: that.$t('system.uploading'),
        spinner: 'el-icon-loading'
      })
      this.$post('iot-saas-device/file/uploads', params).then(res => {
        this.loadObj.close()
        this.$message({
          message: that.$t('public.uploadSuccess'),
          type: 'success'
        })
      }).catch(err => {
        this.loadObj.close()
      })
    },
  },
}
</script>

<style lang="scss" scoped></style>
