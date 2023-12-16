<template>
  <div>
    <div class="p-15 bg-white">
      <el-popconfirm class="pop" cancel-button-type="" icon="el-icon-info" icon-color="#FF7D00"
        :title="$t('device.areYouPopUpAll')" @onConfirm="allEject()">
        <el-button class="mb-15" type="primary" size="medium" slot="reference" :disabled="allEjectStatus">{{
          allEjectStatus ? $t('public.popUp') : $t('public.popUpAll') }} </el-button>
      </el-popconfirm>
      <el-table class="custom" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
        element-loading-text="Loading" highlight-current-row>
        <el-table-column :label="$t('public.slot')">
          <template slot-scope="scope">
            {{ scope.row.slot }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.terminalId')">
          <template slot-scope="scope">
            {{ scope.row.terminalId }}
          </template>
        </el-table-column>
        <!-- <el-table-column label="弹出次数">
          <template slot-scope="scope">
            {{ scope.row.popupNum }}
          </template>
        </el-table-column> -->
        <el-table-column :label="$t('public.presence')">
          <template slot-scope="scope">
            <div v-if="scope.row.onlineStatus == 2">{{ $t('public.popUp') }}</div>
            <div v-else-if="scope.row.onlineStatus == 1">{{ $t('public.inTheSlot') }}（{{ scope.row.electricQuantity }}%）
            </div>
            <div v-else>{{ $t('public.ejected') }}</div>
            <view v-if="scope.row.onlineStatus == 0">{{ $t('public.noPacket') }}</view>
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.operate')" v-if="checkAbility(['eject'], 3)">
          <template slot-scope="scope">
            <div class="flex flex-wrap operate">
              <el-popconfirm class="pop" cancel-button-type="" icon="el-icon-info" icon-color="#FF7D00"
                :title="$t('device.popUpThisMouth')" @onConfirm="singleEject(scope.row)">
                <el-button type="text" slot="reference">{{ scope.row.onlineStatus == 2 ? $t('public.popUp') :
                  $t('public.eject') }}</el-button>
              </el-popconfirm>
              <el-popconfirm class="pop" cancel-button-type="" icon="el-icon-info" icon-color="#FF7D00"
                :title="`${scope.row.stats == 2 ? $t('device.rentable') : $t('device.notAvailableForLease')}`"
                @onConfirm="lockChange(scope.row)">
                <el-button type="text" :disabled="[0, 2].indexOf(scope.row.stats) == -1" slot="reference">{{
                  scope.row.stats == 2 ? $t('public.unlock') : $t('public.lock') }}</el-button>
              </el-popconfirm>
              <el-popconfirm class="pop" cancel-button-type="" icon="el-icon-info" icon-color="#FF7D00"
                :title="$t('device.popUpThisTreasure')" @onConfirm="singleEject(scope.row, 3)"
                v-if="scope.row.terminalId && isBrand()">
                <el-button type="text" slot="reference">{{ scope.row.onlineStatus == 2 ? $t('public.popUp') :
                  $t('device.danbao') }}</el-button>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'eject',
  components: {

  },
  computed: {

  },
  data() {
    return {
      clickSubmit: false,
      list: [],
      listLoading: false,
      deviceSn: this.$route.query.deviceSn || '',
      allEjectStatus: false,
      factoryCode: ''
    }
  },
  mounted(options) {
    this.getInfo()
  },
  methods: {
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
            message: that.$t('device.nonPowerBank'),
            type: 'error'
          })
          return
        }
        this.factoryCode = res.factoryCode
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
     * 充电宝锁定、解锁
     * @param {Object} row
     */
    lockChange(row) {
      let that = this;
      let url = 'iot-saas-device/admin/device/stocks/ext/stockLock'
      if (row.stats == 2) {
        url = 'iot-saas-device/admin/device/stocks/ext/stockUnlock'
      }
      this.$post(url, {
        devicePowerIds: [row.terminalId]
      }).then(res => {
        this.$message({
          message: that.$t('public.submittedSuccess'),
          type: 'success'
        })
        row.stats = row.stats == 2 ? 0 : 2
        console.log(row.stats)
      })
    },

    /**
     * 单弹
     */
    singleEject(row, type = 1) {
      let that = this;
      if (this.clickSubmit) return
      this.clickSubmit = true
      row.onlineStatus = 2
      this.singleEjects(type == 3 ? row.terminalId : row.slot, type).then(() => {
        this.$message({
          message: that.$t('public.commandSent'),
          type: 'success'
        })
        this.clickSubmit = false
        setTimeout(() => {
          this.getBattery()
        }, 6000)
      }).catch(() => {
        this.clickSubmit = false
      })
    },

    /**
     * 单弹
     */
    singleEjects(slot, type = 1) {
      return new Promise((resolve, reject) => {
        let params = {
          deviceSn: this.deviceSn
        }
        if (type == 3) {
          params.terminalId = slot
        } else if (type == 2) {
          params.slot = this.list[slot].slot
        } else if (type == 1) {
          params.slot = slot
        }
        this.$get('iot-saas-device/admin/device/singlePopup', params).then((res = {}) => {
          if (type == 2) {
            if (slot < this.list.length - 1) {
              setTimeout(() => {
                this.singleEjects(slot + 1, 2)
              }, 4000)
            } else {
              setTimeout(() => {
                this.getBattery()
                this.allEjectStatus = false
              }, 2000)
            }
          } else {
            resolve()
          }
        }).catch(err => {
          reject()
        })
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
      switch (this.factoryCode) {
        case 'WS': case 'TP': case 'ZD':
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
          break
        case 'HY': case 'XC': case 'DD': case 'OT':
          this.$message({
            message: that.$t('public.commandSent'),
            type: 'success'
          })
          this.singleEjects(0, 2)
          break
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
