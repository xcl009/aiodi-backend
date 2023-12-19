<template>
  <div class="content">
    <BarScan ref="qrcode" @ok="getResult" @err="geterror"></BarScan>
    <div class="box flex flex justify-center align-center" v-show="scanBtn">
      <div>
        <el-button class="mb-20" type="primary" @click="toScan" style="width: 160px; height: 80px;">{{
          $t('public.bindDevice') }}</el-button><br>
        <el-button class="mb-20" type="primary" @click="toScan" style="width: 160px; height: 80px;">{{
          $t('goods.scanCode') }}</el-button><br>
        <el-button class="mb-20" type="info" @click="logout" style="width: 160px;">{{ $t('layout.logOff') }}</el-button>
      </div>
    </div>
    <el-drawer :title="$t('goods.devicepopUp')" :visible.sync="drawerStatus" :wrapperClosable="false">
      <div class="pl-15 pr-15">
        <div class="mb-15">
          <el-button class="mr-15" type="primary" size="medium" @click="getInfo()">{{ $t('public.refresh') }}</el-button>
          <el-popconfirm class="pop" cancel-button-type="" icon="el-icon-info" icon-color="#FF7D00"
            :title="$t('device.areYouPopUpAll')" @onConfirm="allEject()"
            v-if="factoryCode == 'WS' || factoryCode == 'TP'">
            <el-button type="primary" size="medium" slot="reference" :disabled="allEjectStatus">{{ allEjectStatus ?
              $t('public.popUp') : $t('public.popUpAll') }} </el-button>
          </el-popconfirm>
        </div>
        <el-table class="custom" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
          element-loading-text="Loading" highlight-current-row>
          <el-table-column :label="$t('public.position')" width="50">
            <template slot-scope="scope">
              {{ scope.row.slot }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('public.terminalId')">
            <template slot-scope="scope">
              {{ scope.row.terminalId }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('public.presence')">
            <template slot-scope="scope">
              <div v-if="scope.row.onlineStatus == 2">{{ $t('public.popUp') }}</div>
              <div v-else-if="scope.row.onlineStatus == 1">{{ $t('public.inTheSlot') }}（{{ scope.row.electricQuantity }}%）
              </div>
              <div v-else>{{ $t('public.ejected') }}</div>
              <view v-if="scope.row.onlineStatus == 0">{{ $t('public.noPacket') }}</view>
            </template>
          </el-table-column>
          <el-table-column :label="$t('public.operate')" width="60">
            <template slot-scope="scope">
              <div class="flex flex-wrap operate">
                <el-button type="text" :disabled="scope.row.distribute" @click="singleEject(scope.row)">{{
                  scope.row.onlineStatus == 2 ? $t('public.popUp') : $t('public.eject') }}</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import BarScan from './qrCodeHtml.vue'
export default {
  components: {
    BarScan
  },
  data() {
    return {
      result: '',
      scanBtn: true,
      drawerStatus: false,
      clickSubmit: false,
      list: [],
      listLoading: false,
      deviceSn: '',
      factoryCode: ''
    }
  },
  created() {

  },
  methods: {
    toScan() {
      this.scanBtn = false
      this.$refs.qrcode.getCameras()
    },

    getResult(result) {
      if (result) {
        this.deviceSn = this.getQuery(result)
        this.getInfo()
      }
      this.scanBtn = true
    },

    geterror(e) {
      this.scancode = false
      this.scanBtn = true
      this.$message({
        message: e,
        type: 'error'
      })
    },

    /**
     * 获取指定url参数
     */
    getQuery(url, key = ['sn', 't', 'n', 'dev_no']) {
      if (!url || url.indexOf('?') == -1 && url.lastIndexOf('\/') == -1) return {};
      var req = {};
      if (url.indexOf('?') > -1) {
        var query = url.split('?')[1].split('&');
        for (var i = 0; i < query.length; i++) {
          var qi = query[i].split("=");
          req[qi[0]] = qi[1];
          if (key.indexOf(qi[0]) > -1) return qi[1];
        }
        return req;
      } else {
        return url.substring(url.lastIndexOf('\/') + 1, url.length);
      }
    },

    /**
     * 获取信息
     */
    getInfo() {
      let that = this;
      this.$get('iot-saas-device/admin/device/findBelong', {
        deviceSn: this.deviceSn
      }).then(res => {
        if (res.deviceTypeCode.indexOf('PA') == -1) {
          this.$message({
            message: that.$t('goods.message'),
            type: 'error'
          })
          return
        }
        if (res.haveBind) {
          this.$message({
            message: that.$t('goods.message1'),
            type: 'error'
          })
          return
        }
        this.factoryCode = res.factoryCode
        this.drawerStatus = true
        this.getBattery()
      }).catch(err => {
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      })
    },

    /**
     * 获取列表
     */
    getBattery() {
      this.$get('iot-saas-device/admin/device/stock/list', {
        deviceSn: this.deviceSn
      }).then((res = []) => {
        this.list = res
        this.listLoading = false
        this.clickSubmit = false
      }).catch(() => {
        this.clickSubmit = false
        this.listLoading = false
      })
    },

    /**
     * 单弹
     */
    singleEject(row) {
      let that = this;
      if (this.clickSubmit) return
      this.clickSubmit = true
      row.onlineStatus = 2
      this.$get('iot-saas-device/admin/device/singlePopup', {
        deviceSn: this.deviceSn,
        slot: row.slot
      }).then((res = {}) => {
        this.$message({
          message: that.$t('public.commandSent'),
          type: 'success'
        })
        this.clickSubmit = false
        setTimeout(() => {
          this.getBattery()
        }, 8000)
      }).catch(() => {
        this.clickSubmit = false
      })
    },

    /**
     * 全弹
     */
    allEject() {
      let that = this;
      if (this.clickSubmit) return
      this.clickSubmit = true
      this.allEjectStatus = true
      this.$get('iot-saas-device/admin/device/batchPopup', {
        deviceSn: this.deviceSn
      }).then((res = {}) => {
        this.$message({
          message: that.$t('public.commandSent'),
          type: 'success'
        })
        setTimeout(() => {
          this.getBattery()
          this.allEjectStatus = false
        }, 10000)
      }).catch(err => {
        this.clickSubmit = false
      })
    },

    async logout() {
      let url = ''
      url = `/login`
      await this.$store.dispatch('user/logout')
      location.href = url
    },
  }
}
</script>

<style lang="scss" scoped>
.box {
  width: 100vw;
  height: 100vh;
}

/deep/ .el-drawer {
  width: 100vw !important;
  max-width: 100%;
}
</style>
