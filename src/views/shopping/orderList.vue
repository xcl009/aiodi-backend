<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:tabs>
        <div class="mb-10 flex align-center bg-white" v-if="myDeviceName">
          <div class="mr-10">{{ $t('public.deviceType') }}</div>
          <el-tabs class="flex-1" v-model="listQuery.deviceTypeCode" @tab-click="toQuery()">
            <el-tab-pane :label="$t('public.allDevice')" :name="''" />
            <el-tab-pane :label="index" :name="'' + item + ''" v-for="(item, index) in myDeviceName" :key="index" />
          </el-tabs>
        </div>
        <div class="mb-10 flex align-center bg-white">
          <div class="mr-10">{{ $t('public.orderType') }}</div>
          <el-tabs class="flex-1" v-model="listQuery.status" @tab-click="toQuery()">
            <el-tab-pane :label="`${item.title}`" :name="'' + item.value + ''" v-for="(item, index) in orderTab"
              :key="index" />
          </el-tabs>
        </div>
      </template>

      <template v-slot:defult>
        <el-form-item :label="$t('public.orderNum')">
          <el-input v-model="form.orderNo" :placeholder="$t('public.orderNum')" />
        </el-form-item>
        <el-form-item :label="$t('public.productName')">
          <el-input v-model="form.productName" :placeholder="$t('public.productName')" />
        </el-form-item>
        <el-form-item>
          <el-input :placeholder="$t('public.minimumAmount')" v-model="form.minPrice">
          </el-input>
        </el-form-item>
        <el-form-item>
          -
        </el-form-item>
        <el-form-item label-width="0">
          <el-input :placeholder="$t('public.maximumAmount')" v-model="form.maxPrice">
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-date-picker class="range-day flex align-center" v-model="form.date" type="daterange" range-separator="-"
            value-format="yyyy-MM-dd" :start-placeholder="$t('public.statrtDate')" :end-placeholder="$t('public.endDate')"
            :picker-options="pickerOptionsEnd" @change="toQuery()">
          </el-date-picker>
        </el-form-item>
      </template>
    </condition>

    <div class="pl-10 pr-10 bg-white">
      <div class="flex align-center pt-15 mb-15 l-t">
        <div class="flex1 fs-c1 text-black">{{ $t('public.enquiryForm') }}</div>
        <table-column-set storageKey="orderTableColumn" :showColumn.sync="showColumn"
          :defaultColumn="defaultColumn"></table-column-set>
      </div>

      <div v-if="showColumn.length > 0">
        <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
          :max-height="tableMaxH" element-loading-text="Loading">
          <template v-for="item in showColumn">
            <el-table-column :label="$t('public.brand')" width="150" prop="brandName" v-if="isSaas()"></el-table-column>
            <el-table-column :label="$t('public.orderNum')" width="140" v-if="item.val && item.key == 'orderNo'">
              <template slot-scope="scope">
                {{ scope.row.orderNo || '--' }}
              </template>
            </el-table-column>
            <el-table-column :label="$t('public.deviceType')" v-if="item.val && item.key == 'deviceTypeCode'">
              <template slot-scope="scope">
                {{ myDeviceId[scope.row.deviceTypeCode] }}
              </template>
            </el-table-column>
            <el-table-column :label="$t('public.orderType')" v-if="item.val && item.key == 'status'">
              <template slot-scope="scope">
                <el-link type="danger" v-if="scope.row.status == 0">{{ $t('public.toBePaid') }}</el-link>
                <el-link type="primary" v-if="scope.row.status == 1">{{ $t('public.inProduction') }}</el-link>
                <el-link type="warning" v-if="scope.row.status == 2">{{ $t('public.toBeReceived') }}</el-link>
                <el-link type="success" v-if="scope.row.status == 3">{{ $t('public.receivedGoods') }}</el-link>
              </template>
            </el-table-column>
            <el-table-column :label="$t('public.orderTime')" v-if="item.val && item.key == 'orderTime'">
              <template slot-scope="scope">
                {{ parseTime(scope.row.orderTime) || '--' }}
              </template>
            </el-table-column>
            <el-table-column :label="$t('public.payTime')" v-if="item.val && item.key == 'orderTime'">
              <template slot-scope="scope">
                {{ parseTime(scope.row.payTime) || '--' }}
              </template>
            </el-table-column>
            <el-table-column :label="$t('public.deliveryTime')" v-if="item.val && item.key == 'orderTime'">
              <template slot-scope="scope">
                {{ parseTime(scope.row.receivedTime) || '--' }}
              </template>
            </el-table-column>

          </template>
          <el-table-column :label="$t('public.operate')" width="165" :fixed="device == 'desktop' ? 'right' : false">
            <template slot-scope="scope">
              <div class="flex flex-wrap operate">
                <div class="text-primary" @click="setRows(3, scope.row, 1)">{{ $t('public.particulars') }}</div>
                <template>
                  <div class="text-primary" @click="exportAll(scope.row)" v-if="scope.row.orderBatch">{{
                    $t('layout.downloadCode') }}</div>
                  <div class="text-primary" @click="setRows(3, scope.row, 2)" v-else>{{ $t('qrcode.generateCode') }}</div>
                </template>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="flex justify-end">
        <pagination v-show="listTotal > 0" :page.sync="listQuery.page" :limit.sync="listQuery.size"
          :total="parseInt(listTotal)" @pagination="getList" />
      </div>

      <el-drawer :title="dialogTitle[dialogType]" :visible.sync="drawerStatus" :wrapperClosable="false">
        <template v-if="dialogType == 1">
          <div class="pl-20 pr-20 text-black">
            <div class="mb-15">{{ $t('public.userInfo') }}</div>
            <div class="flex align-center pb-20 l-b">
              <img :src="curRow.userAvatar || agentInfo.avatar" class="round" width="56" alt="">
              <div class="pl-20">
                <div class="flex">
                  <div class="label-text">{{ $t('public.deviceType') }}:</div>
                  <div> {{ myDeviceId[curRow.deviceTypeCode] }}</div>
                  <div class="ml-10 label-text">{{ $t('public.payType') }}:</div>
                  <div>{{ payStatusText[curRow.payStatus] }}</div>
                  <div class="ml-10 label-text">{{ $t('public.orderTime') }}:</div>
                  <div>{{ parseTime(curRow.orderTime) || '--' }}</div>
                </div>
              </div>
            </div>
            <template v-if="!isStore()">
              <div class="mt-20 mb-15">{{ $t('order.orderProcess') }}</div>
              <div class="flex pb-20 timeline-box white-space text-center l-b">
                <div class="rel pt-30 timeline-item el-icon-" v-for="(item, index) in curRow.productOrderFlows">
                  <div class="pl-10 pr-10">
                    <el-tooltip :content="statusText[item.status] || $t('public.notHave')" placement="top">
                      <div class="text-cut">{{ statusText[item.status] }}</div>
                    </el-tooltip>
                    <div class="mt-10 fs-s2 text-gray">{{ parseTime(item.createTime) }}</div>
                  </div>
                </div>
              </div>
            </template>
            <template v-if="curRow.productStandardDTO">
              <div class="mt-20 mb-15">{{ $t('public.orderInformation') }}</div>
              <el-table border :data="curRow.productStandardDTO" class="custom">
                <el-table-column :label="$t('public.deviceType')" align="center">
                  <template slot-scope="scope">
                    {{ myDeviceId[curRow.deviceTypeCode] }}
                  </template>
                </el-table-column>
                <el-table-column :label="$t('public.specifications')" align="center">
                  <template slot-scope="scope">
                    {{ scope.row.number }}
                  </template>
                </el-table-column>
                <el-table-column :label="`${$t('public.unitPrice')}(${$t('public.element')})`" align="center">
                  <template slot-scope="scope">
                    {{ scope.row.price }}{{ $t('public.element') }}
                  </template>
                </el-table-column>
                <el-table-column :label="$t('public.number')" align="center">
                  <template slot-scope="scope">
                    {{ curRow.productNumber }}
                  </template>
                </el-table-column>
                <el-table-column :label="`${$t('public.totalAmount')}(${$t('public.element')})`" align="center">
                  <template slot-scope="scope">
                    <span class="red_color">{{ curRow.productPrice }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </div>
        </template>

      </el-drawer>
    </div>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import condition from '@/components/condition/'
import selectSearch from '@/components/condition/selectSearch'
import TableColumnSet from '@/components/TableColumnSet/index'
import {
  parseTime,
  unixTime,
  accAdd,
  accSub
} from '@/utils/index'

export default {
  name: 'Order',
  components: {
    TableColumnSet,
    Pagination,
    condition,
    selectSearch
  },
  props: {
    lowerAgent: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    Constant() {
      return this.$store.getters.Constant
    },
    device() {
      return this.$store.state.app.device
    },
    myDeviceName() {
      return this.$store.state.user.myDeviceName
    },
    myDeviceId() {
      return this.$store.state.user.myDeviceId
    },
    myDevice() {
      return this.$store.state.user.myDevice
    },
    agentInfo() {
      return this.$store.getters.agentInfo
    },
    siteInfo() {
      return this.$store.getters.siteInfo
    },
    Ability() {
      return this.$store.getters.Ability
    },
    orderTab() {
      return [{
        value: 'all',
        title: this.$t('public.all'),
        nkey: 'orderNumber'
      },
      {
        value: '0',
        title: this.$t('public.toBePaid'),
        nkey: 'rentingNumber'
      },
      {
        value: '1',
        title: this.$t('public.inProduction'),
        nkey: 'todayNumber'
      },
      {
        value: '2',
        title: this.$t('public.toBeReceived'),
        nkey: 'doneNumber'
      },
      {
        value: '3',
        title: this.$t('public.receivedGoods'),
        nkey: 'expiredNumber'
      },
      ]
    },
    dialogTitle() {
      return {
        1: this.$t('public.orderDetail'),
        2: this.$t('public.qrCodeGeneration')
      }
    },
    defaultColumn() {
      return [{
        key: 'brandName',
        val: true,
        name: this.$t('public.brand')
      },
      {
        key: 'orderNo',
        val: true,
        name: this.$t('public.orderNum')
      },

      {
        key: 'deviceTypeCode',
        val: true,
        name: this.$t('public.deviceType')
      },
      {
        key: 'status',
        val: true,
        name: this.$t('public.orderType')
      },
      {
        key: 'orderTime',
        val: true,
        name: this.$t('public.orderTime')
      },
      {
        key: 'payTime',
        val: true,
        name: this.$t('public.payTime')
      },
      {
        key: 'receivedTime',
        val: true,
        name: this.$t('public.deliveryTime')
      },
      ]
    },
    payStatusText() {
      return [this.$t('public.unpaid'), this.$t('public.paid'), this.$t('public.offlinePayment')]
    },
    statusText() {
      return [this.$t('public.toBePaid'), this.$t('public.inProduction'), this.$t('public.toBeReceived'), this.$t('public.receivedGoods')]
    }
  },
  data() {
    return {
      accSub: accSub,
      clickSubmit: false,
      pickerOptionsEnd: {
        disabledDate: (time) => {
          let timeOptionRange = this.timeOptionRange
          let secondNum = 60 * 60 * 24 * 31 * 1000
          if (timeOptionRange) {
            return (time.getTime() > timeOptionRange.getTime() + secondNum || time.getTime() < timeOptionRange
              .getTime() - secondNum) || time.getTime() > Date.now()
          }
          return time.getTime() > Date.now()
        },
        onPick: (time) => {
          //当第一时间选中才设置禁用
          if (time.minDate && !time.maxDate) {
            this.timeOptionRange = time.minDate
          }
          if (time.maxDate) {
            this.timeOptionRange = null
          }
        }
      },

      search_regions_tag: [],
      categoryList: [],
      areaList: [],

      tableMaxH: '250',
      listLoading: true,
      listTotal: 0,
      statInfo: {},
      list: [],
      listQuery: {
        status: 'all',
        page: 1,
        size: 20
      },
      form: {},
      order: {},
      selID: [],

      // 弹出相关
      dialogType: 1,
      dialogStatus: false,
      drawerStatus: false,
      curRow: {},
      curIdx: 0,
      dform: {},

      /**
       * 列的配置化对象，存储配置信息
       */
      showColumn: [],
    }
  },
  mounted() {
    if (this.$route.query.orderNo) {
      this.form.orderNo = this.$route.query.orderNo
    }
    this.toQuery()
  },
  methods: {

    /**
     * 搜索查询
     */
    toQuery(type = 1) {
      if (this.clickSubmit) return
      this.clickSubmit = true
      this.listQuery.page = 1
      this.listQuery.size = 20
      this.getList()
    },

    /**
     * 重置查询
     */
    reset() {
      if (this.clickSubmit) return
      this.clickSubmit = true
      this.form = {}
      this.listQuery.page = 1
      this.listQuery.size = 20
      this.getList()
    },

    /**
     * 获取列表
     */
    getList() {
      var url = 'iot-saas-order/admin/product/order/findPage',
        params = Object.assign({}, this.form, this.listQuery, {
          page: this.listQuery.page - 1
        })
      if (params.date && params.date.length > 0) {
        params.startTime = params.date[0] + ' 00:00:00'
        params.endTime = params.date[1] + ' 23:59:59'
        delete params.date
      }
      if (params.status == 'all') {
        delete params.status
      }
      for (var i in this.queryKey) {
        if (this[this.queryKey[i]]) {
          params[this.queryKey[i]] = this[this.queryKey[i]]
        }
      }
      if (params.storeId && params.storeId.indexOf('&') > -1) {
        let ids = params.storeId.split('&')
        params.storeId = ids[0]
        params.agentId = ids[1]
        params.brandId = ids[2]
      }
      if (params.deviceTypeCode == 0) delete params.deviceTypeCode
      this.$get(url, params).then(res => {
        this.list = res.rows
        this.listLoading = false
        this.clickSubmit = false
        this.listTotal = res.total
        if (params.page == 0) {
          this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 55
        }
      }).catch(() => {
        this.listLoading = false
        this.clickSubmit = false
      })
    },

    /**
     * 点击提交按钮
     */
    createCode(row) {
      let that = this;
      let params = {
        deviceTypeCode: row.deviceTypeCode,
        number: row.productNumber,
        factoryCode: row.factoryCode,
        windosNumber: 8,
        positionQty: 2,
        merchandiseQty: 1
      }
      this.clickSubmit = true
      this.$refs['form'].validate((valid, object) => {
        if (valid) {
          this.loadObj = this.$loading({
            lock: true,
            text: that.$t('public.generating'),
            spinner: 'el-icon-loading'
          })
          this.$post('iot-saas-device/admin/qrcode', params).then(res => {
            row.orderBatch = res.batch
            this.$post('iot-saas-order/admin/product/order/batch', {
              orderNo: row.orderNo,
              orderBatch: res.batch
            }).then(res => {

            })
            this.$message({
              message: that.$t('public.operationCompleted'),
              type: 'success'
            })
            this.loadObj.close()
            this.clickSubmit = false
          }).catch(err => {
            this.clickSubmit = false
            this.loadObj.close()
          })
        } else {
          this.clickSubmit = false
        }
      })
    },

    /**
     * 导出单次生成的二维码记录
     * @param {Object} row
     */
    exportAll(row) {
      let that = this;
      this.$alert(that.$t('shopping.message3'), that.$t('shopping.message4'), {
        confirmButtonText: that.$t('public.confirm'),
        callback: action => {
          if (action == 'confirm') {
            this.loadObj = this.$loading({
              lock: true,
              text: that.$t('shopping.message5'),
              spinner: 'el-icon-loading'
            })
            this.$export(`iot-saas-device/admin/qrcode/exportAll?batchNumber=${row.batchNumber}`).then(res => {
              const blob = new Blob([res])
              const fileName = `${that.$t('public.qrCodeList')}(${this.parseTime(row.createTime)}).xlsx`
              if ('download' in document.createElement('a')) {
                const elink = document.createElement('a')
                elink.download = fileName
                elink.style.display = 'none'
                elink.href = URL.createObjectURL(blob)
                document.body.appendChild(elink)
                elink.click()
                URL.revokeObjectURL(elink.href)
                document.body.removeChild(elink)
              } else {
                navigator.msSaveBlob(blob, fileName)
              }
              this.loadObj.close()
              this.$message({
                message: that.$t('public.operationSuccessful'),
                type: 'success'
              })
            }).catch(err => {
              this.loadObj.close()
              this.$message({
                message: that.$t('public.exportFailed'),
                type: 'error'
              })
            })
          }
        }
      })
    },

    /**
     * 操作商户
     * @param {Object} type 1 dialog类型  3 drawer类型
     * @param {Object} row 选择当前数据
     * @param {Object} dialogType dialog内容显示类型 1: '订单详情' 2: '生成二维码'
     * @param {Object} idx 当前数据所在位置
     */
    setRows(type, row, dialogType, idx) {
      switch (type) {
        case 3:
          this.dialogType = dialogType
          this.curIdx = idx
          if (dialogType != 1) this.curRow = row
          this.drawerStatus = true
          this.dform = {}
          if (dialogType == 1) {
            this.$get(`iot-saas-order/admin/product/order/detail/${row.id}`, {
              id: row.id
            }).then(res => {
              res.productStandardDTO = [res.productStandardDTO]
              this.curRow = res
            })
          }
          break
      }
    },


    /**
     * 弹窗确认
     */
    dialogConfirm() {
      let curRow = this.curRow,
        curIdx = this.curIdx,
        params = JSON.parse(JSON.stringify(this.dform))
      if (this.clickSubmit) return
      this.clickSubmit = true
      switch (this.dialogType) { }
    }
  }
}
</script>

<style lang="scss" scoped>
.remark-box {
  max-height: 80px;
}

/deep/ .order-no {
  .el-input__inner {
    padding-right: 0;
  }
}

.timeline-box {
  max-width: 900px;
  overflow-y: scroll;

  .timeline-item {

    &::after,
    &::before {
      content: '';
      position: absolute;
    }

    &::before {
      width: 26px;
      height: 14px;
      top: 0;
      margin-left: -13px;
      content: "";
      background-color: var(--white);
      color: var(--olive);
      z-index: 99;
    }

    &::after {
      top: 6px;
      margin-left: 10px;
      width: 100%;
      height: 1px;
      background: var(--olive);
    }

    &:last-child {
      &::before {
        color: var(--orange);
      }

      &::after {
        width: 0;
      }
    }

    &.err {
      &::before {
        content: "";
        color: var(--orange);
      }
    }
  }
}

.red_color {
  color: #F53F3F !important;
}
</style>
