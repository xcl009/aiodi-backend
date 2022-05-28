<template>
  <div>
    <div class="p-15 bg-white">
      <div class="mb-15 flex justify-right" v-if="isBrand()">
        <el-button type="primary" round size="small" @click="setAdDialog">广告设置</el-button>
      </div>
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
        element-loading-text="Loading" stripe highlight-current-row>
        <el-table-column label="类型">
          <template slot-scope="scope">
            <div>{{ scope.row.advertTypeName }}</div>
          </template>
        </el-table-column>
        <el-table-column label="数量">
          <template slot-scope="scope">
            <div>{{ scope.row.number }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="$router.push({path: `/advert/weChatList?category=${category}&advertTypeCode=${scope.row.advertTypeCode}&advertTypeName=${scope.row.advertTypeName}`})">广告设置</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog title="广告设置" width="600px" :visible.sync="adDialog">
      <div class="fs-c1">
        <div class="mb-20 flex">
          <div class="flex1">
            <div>广告与按钮挨着</div>
            <div class="mt-5 fs-s3">注：此功能可以增加广告点击率，但是有被封的风险，望知悉。</div>
          </div>
          <el-switch v-model="form.wx_ads_closing" :active-value="1" :inactive-value="0" />
        </div>
        <div class="mb-20 flex">
          <div class="flex1">
            <div>微信老用户自动登录</div>
            <div class="mt-5 fs-s3">注：关闭表示不自动登录，可放2次广告。体验较差。</div>
          </div>
          <el-switch v-model="form.user_direct_login" :active-value="1" :inactive-value="0" />
        </div>
        <div class="mb-20 flex align-center">
          <div class="">
            微信用户登录有效期：
          </div>
          <el-input class="flex1" v-model="form.user_expired_hours">
            <template slot="append">小时</template>
          </el-input>
        </div>
        <div class="mb-20 flex">
          <div class="flex1">
            <div>扫码先跳转首页在进入租借页面</div>
            <div class="mt-5 fs-s3">注：可以多看首页的广告位置。需要可登录小程序将普通二维码跳转小程序链接设置为（pages/index/index）</div>
          </div>
        </div>
        <div class="mb-20 flex align-center">
          <div class="">
            跳转租借页延长时间：
          </div>
          <el-input class="flex1" v-model="form.wx_ads_loading_seconds">
            <template slot="append">秒</template>
          </el-input>
        </div>
        <div class="text-center">
          <el-button class="mt-10 mb-10" type="primary" @click="postEdit()" :disabled="clickSubmit">确认设置</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import QRCode from 'qrcodejs2'
  export default {
    name: 'weChatAdBase',
    components: {

    },
    data() {
      return {
        category: 'TRAFFIC',
        clickSubmit: false,
        list: [],
        listLoading: true,

        adType: {
          1: 'Banner广告',
          2: '激励视频广告',
          3: '插屏广告',
          4: '视频广告',
          5: '视频前贴广告',
          6: '封面广告',
          7: '原生模板广告'
        },

        adDialog: false,
        form: {

        },
        form_key: {
          wx_ads_closing: 0,
          user_direct_login: 1,
          user_expired_hours: 24,
          wx_ads_loading_seconds: 5
        }
      }
    },
    computed: {
      siteInfo() {
        return this.$store.state.user.siteInfo
      }
    },
    mounted() {
      this.getList()
      if (this.siteInfo.wx_ad_right == 0 && this.checkRoles(['partner'])) this.getPayCode()
    },
    methods: {
      /**
       * 显示dialog
       */
      setAdDialog() {
        let params = {}
        for (var i in this.form_key) {
          params[i] = this.siteInfo[i]
        }
        this.form = params
        this.adDialog = true
      },

      /**
       * 获取广告位置
       */
      getList() {
        this.$get('iot-saas-advert/admin/advert/findAdvertType', {
          category: this.category
        }).then(res => {
          this.list = Object.values(res)
          this.listLoading = false
        }).catch(() => {
          this.listLoading = false
        })
      },

      /**
       * 获取开通广告支付二维码
       */
      getPayCode() {
        this.$get('agentapi/pay/get_wxad_contract_qrcode').then(res => {
          document.getElementById('qrcode').innerHTML = ''
          new QRCode('qrcode', {
            width: 150,
            height: 150,
            text: res.wx_qrcode_url
          })
        })
      },

      /**
       * 提交设置
       */
      postEdit() {
        this.$post('agentapi/system/save_key_value', this.form).then(res => {
          this.$message({
            message: '设置成功',
            type: 'success'
          })
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
