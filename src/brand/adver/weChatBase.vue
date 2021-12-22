<template>
  <div class="p-5">
    <div class="bg-white">
      <div class="p-5 flex justify-right" v-if="checkRoles(['partner'])">
        <el-button type="primary" round size="small" @click="setAdDialog">广告设置</el-button>
      </div>
      <el-table v-loading="listLoading" :data="list" element-loading-text="Loading" stripe highlight-current-row>
        <el-table-column label="类型">
          <template slot-scope="scope">
            <div>{{ scope.row.business_des }}</div>
          </template>
        </el-table-column>
        <el-table-column label="数量">
          <template slot-scope="scope">
            <div>{{ scope.row.list.length }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <router-link :to="`/adver/weChatList?business_type=${scope.row.business_type}`">
              <el-button type="primary" size="mini" round plain>设置广告</el-button>
            </router-link>
            <el-button type="primary" size="mini" round plain @click="setShow(scope.row)" v-if="checkRoles(['partner'])">{{ scope.row.is_show == 1 ? '已开启' : '已关闭' }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="ad-power" v-if="checkRoles(['partner'])">
      <el-dialog
        title="请开通微信广告使用权限"
        width="600px"
        :modal-append-to-body="false"
        :center="true"
        :show-close="false"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :visible.sync="siteInfo.wx_ad_right == 0">
        <div class="renewal-box">
          <div class="flex flex-wrap justify-around">
            <div class="p-30 money-item radius-10 rel cursor act">
              <span class="abs title fs-s2 text-white">永久付</span>
              <div class="text-red f-w">￥<span class="fs-b5">2000</span></div>
              <div class="mb-5 b-line" />
              <div class="fs-s2 text-primary">微信广告，轻松赚钱</div>
              <div class="abs check">
                <span class="el-icon-check" />
              </div>
            </div>
          </div>
          <div class="l-t mt-20 pt-20 flex flex-wrap justify-around text-center">
            <div>
              <div class="p-10 qrcode-box">
                <div id="qrcode" />
              </div>
              <div class="mt-10 mb-10 text-wx">
                <i class="iconfont icon-weixinzhifu" />
                <span>微信支付</span>
              </div>
              <div class="fs-s2 text-red">
                <span>打开微信(扫一扫)</span>
              </div>
            </div>
          </div>
          <div class="mt-20 fs-s2 text-gray text-center">扫码付款完成后刷新页面即可</div>
        </div>
        <!-- <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="$router.go(-1)">我知道了</el-button>
        </span> -->
      </el-dialog>
    </div>

    <el-dialog
      title="广告设置"
      width="600px"
      :visible.sync="adDialog">
      <div class="fs-c1">
        <div class="mb-20 flex">
          <div class="flex1">
            <div>广告与按钮挨着</div>
            <div class="mt-5 fs-s3">注：此功能可以增加广告点击率，但是有被封的风险，望知悉。</div>
          </div>
          <el-switch v-model="form.wx_ads_closing" :active-value="1" :inactive-value="0"/>
        </div>
        <div class="mb-20 flex">
          <div class="flex1">
            <div>微信老用户自动登录</div>
            <div class="mt-5 fs-s3">注：关闭表示不自动登录，可放2次广告。体验较差。</div>
          </div>
          <el-switch v-model="form.user_direct_login" :active-value="1" :inactive-value="0"/>
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
      siteInfo(){
        return this.$store.state.user.siteInfo
      }
    },
    mounted() {
      let f = [
        {
          "id": "1",
          "title": "主页",
          "path": "home",
          "file_path": "",
          "is_show": "1",
          "pid": "0",
          "icon": "",
          "status": "1",
          "hidden": false
        },
        {
          "id": "2",
          "title": "主页",
          "path": "home",
          "file_path": "/home/home",
          "is_show": "1",
          "pid": "1",
          "icon": "",
          "status": "1",
          "props": "",
          "hidden": false
        },
        {
          "id": "4",
          "title": "统计",
          "path": "tongji",
          "file_path": "/home/tongji",
          "is_show": "1",
          "pid": "2",
          "icon": "",
          "status": "1",
          "props": "",
          "hidden": false
        },
        {
          "id": "3",
          "title": "登录",
          "path": "login/:gid?",
          "file_path": "/login/index",
          "is_show": "1",
          "pid": "0",
          "icon": "",
          "status": "1",
          "props": "",
          "hidden": true
        }
      ]
      this.getList()
      if(this.siteInfo.wx_ad_right == 0 && this.checkRoles(['partner'])) this.getPayCode()
    },
    methods: {
      /**
       * 显示dialog
       */
      setAdDialog(){
        let params = {}
        for(var i in this.form_key){
          params[i] = this.siteInfo[i]
        }
        this.form = params
        this.adDialog = true
      },


      /**
       * 获取广告位置
       */
      getList() {
        let url = 'agentapi/ad/get_wx_ad_positions'
        this.$get(url).then(res => {
          this.list = Object.values(res)
          this.listLoading = false
        }).catch(() => {
          this.listLoading = false
        })
      },

      /**
       * 设置是否显示
       */
      setShow(row){
        let is_show = row.is_show == 1 ? 0 : 1
        this.$post('agentapi/ad/save_wx_ad_positions_permission', {
          business_type: row.business_type,
          is_show: is_show
        }).then(res => {
          this.$message({
            message: '设置成功',
            type: 'success'
          })
          row.is_show = is_show
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
      postEdit(){
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
  /deep/ .ad-power .el-dialog__wrapper{
    left: 150px;
  }
  /deep/ .v-modal{
    left: 150px;
    top: 40px;
  }

  .renewal-box{
    .money-item{
      border: 3px solid #eee;
      &.act{
        border-color: red;
        .check{
          opacity: 1;
        }
      }
      transition: all 1s;
    }
    .check{
      bottom: 0;
      right: 0;
      width: 0;
      height: 0;
      border-bottom: 30px solid red;
      border-left: 30px solid transparent;
      opacity: 0;
      transition: all 1s;
    }
    .el-icon-check{
      margin-left: -18px;
      margin-top: 13px;
      font-weight: bold;
      font-size: 16px;
      color: #fff;
    }
    .b-line{
      height: 1px;
      background-image: linear-gradient(to right, #ffffff, #da181c, #ffffff);
    }
    .title{
      left: -2px;
      top: -2px;
      padding: 3px 5px;
      border-radius: 10px 0 10px 0;
      background-image: linear-gradient(to right, #ff15e0, #da181c);
    }
    .text-red{
      color: red;
    }
    .text-wx{
      color: #4bb414;
    }
    .text-ali{
      color: #07aaf0;
    }

    .qrcode-box{
      width: 174px;
      height: 174px;
      border: 2px solid #4bb414;
      &.ali{
        border-color: #07aaf0;
      }
    }
  }
</style>
