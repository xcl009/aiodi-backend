<template>
  <div>
    <el-row :gutter="20" type="flex" class="flex-wrap mb-15 stat-box text-nowrap text-white">
      <el-col :span="24" :md="8" class="item-box">
        <div class="flex align-center pl-30 pr-30 pt-20 pb-20 info radius-5">
          <div class="flex align-center justify-center img bg-white">
            <img :src="require('@/assets/lease/all_amount.svg')" width="30">
          </div>
          <div class="flex1 ml-30">
            <div class="mb-5">{{ $t('home.alldeposit') }}</div>
            <div><span class="mr-5 fs-b3 text-bold">{{ accSub(totalStat.allAmount, totalStat.amount) || 0 }}</span>{{
              $t('public.element') }}</div>
          </div>
          <div class="flex1 ml-30">
            <div class="mb-5">{{ $t('moeny.totalNumber') }}</div>
            <div><span class="mr-5 fs-b3 text-bold">{{ totalStat.allNumber || 0 }}</span>{{ $t('public.pen') }}</div>
          </div>
        </div>
      </el-col>
      <el-col :span="24" :md="8" class="item-box">
        <div class="flex align-center pl-30 pr-30 pt-20 pb-20 info radius-5">
          <div class="flex align-center justify-center img bg-white">
            <img :src="require('@/assets/lease/unrefund_amount.svg')" width="30">
          </div>
          <div class="flex1 ml-30">
            <div class="mb-5">{{ $t('moeny.unreturnedAmount') }}</div>
            <div><span class="mr-5 fs-b3 text-bold">{{ totalStat.unrefundAmount || 0.00 }}</span>{{ $t('public.element')
            }}</div>
          </div>
          <div class="flex1 ml-30">
            <div class="mb-5">{{ $t('moeny.unreturnedTransactions') }}</div>
            <div><span class="mr-5 fs-b3 text-bold">{{ totalStat.unrefundNumber || 0 }}</span>{{ $t('public.pen') }}</div>
          </div>
        </div>
      </el-col>
      <el-col :span="24" :md="8" class="item-box">
        <div class="flex align-center pl-30 pr-30 pt-20 pb-20 info radius-5">
          <div class="flex align-center justify-center img bg-white">
            <img :src="require('@/assets/lease/refunded_amount.svg')" width="30">
          </div>
          <div class="flex1 ml-30">
            <div class="mb-5">{{ $t('moeny.refundedAmount') }}</div>
            <div><span class="mr-5 fs-b3 text-bold">{{ totalStat.refundedAmount || 0 }}</span>{{ $t('public.element') }}
            </div>
          </div>
          <div class="flex1 ml-30">
            <div class="mb-5">{{ $t('moeny.refundedNumber') }}</div>
            <div><span class="mr-5 fs-b3 text-bold">{{ totalStat.refundedNumber || 0 }}</span>{{ $t('public.pen') }}</div>
          </div>
        </div>
      </el-col>
    </el-row>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:tabs>
        <div class="mb-10 flex align-center bg-white" v-if="myDeviceName">
          <div class="mr-10">{{ $t('public.deviceType') }}</div>
          <el-tabs class="flex1" v-model="listQuery.deviceTypeCode" @tab-click="toQuery()">
            <el-tab-pane :label="$t('public.allDevice')" :name="''" />
            <el-tab-pane :label="index" :name="'' + item + ''" v-for="(item, index) in myDeviceName" />
          </el-tabs>
        </div>
      </template>

      <template v-slot:defult>
        <el-form-item v-for="item in 2">
          <div class="flex combined">
            <el-select v-model="formKey[`sel${item}`]" :placeholder="$t('public.pleaseSelect')">
              <template v-for="(q, key) in queryObj">
                <el-option :label="q.title" :value="key" v-if="checkQueryRepeat(key, item, formKey)"></el-option>
              </template>
            </el-select>
            <template v-if="queryObj[formKey[`sel${item}`]] && queryObj[formKey[`sel${item}`]].type == 'input'">
              <el-input :placeholder="`${$t('public.pleaseSelect')}${queryObj[formKey[`sel${item}`]].title}`"
                v-model="form[formKey[`sel${item}`]]"></el-input>
            </template>
            <template v-if="queryObj[formKey[`sel${item}`]] && queryObj[formKey[`sel${item}`]].type == 'selectSearch'">
              <selectSearch v-model="form[formKey[`sel${item}`]]" :type="queryObj[formKey[`sel${item}`]].sType"
                :name="queryObj[formKey[`sel${item}`]].name" :placeholder="`${queryObj[formKey['sel' + item]].title}`"
                @change="toQuery()" :isStoreOrder="['storeId'].indexOf(formKey[`sel${item}`]) > -1"></selectSearch>
            </template>
            <template v-if="queryObj[formKey[`sel${item}`]] && queryObj[formKey[`sel${item}`]].type == 'select'">
              <el-select v-model="form[formKey[`sel${item}`]]" :placeholder="`${queryObj[formKey['sel' + item]].title}`"
                clearable @change="toQuery()">
                <el-option :label="item" :value="key" v-for="(item, key) in queryObj[formKey[`sel${item}`]].selectArr" />
              </el-select>
            </template>
          </div>
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
        <table-column-set storageKey="leaseOrderTableColumn" :showColumn.sync="showColumn"
          :defaultColumn="defaultColumn"></table-column-set>
      </div>

      <el-table class="custom" id="table_box" ref="table_box" v-loading="listLoading" :data="list"
        element-loading-text="Loading" highlight-current-row :max-height="tableMaxH">
        <template v-for="item in showColumn" v-if="item.val">
          <el-table-column :label="item.name" width="150" v-if="item.key == 'userId'">
            <template slot-scope="scope">
              <el-tooltip :content="scope.row.userId || $t('public.notHave')">
                <div>{{ scope.row.userId ? parseInt(scope.row.userId.substr(-8, 8)) : '' }}</div>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" :width="item.width || 120" v-else-if="item.key.indexOf('Time') > -1">
            <template slot-scope="scope">
              {{ parseTime(scope.row[item.key]) }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" v-else-if="item.key == 'lAmount'">
            <template slot-scope="scope">
              {{ accSub(scope.row.depositAmount, scope.row.amount) }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" v-else-if="item.key == 'rStatus'">
            <template slot-scope="scope">
              {{ scope.row.depositAmount > accAdd(scope.row.amountEnable, scope.row.amount) ? $t('public.refunded') :
                $t('public.unreimbursed') }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" v-else-if="item.key == 'rAmount'">
            <template slot-scope="scope">
              {{ accSub(accSub(scope.row.depositAmount, scope.row.amount), scope.row.amountEnable) }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" :prop="item.key" :width="item.width || 120" v-else></el-table-column>
        </template>
      </el-table>

      <div class="flex justify-end">
        <pagination v-show="listTotal > 0" :page.sync="listQuery.page" :limit.sync="listQuery.size"
          :total="parseInt(listTotal)" @pagination="getList" />
      </div>
    </div>

    <el-drawer :title="dialogTitle[dialogType]" :visible.sync="drawerStatus" :wrapperClosable="false">
      <template v-if="dialogType == 1">
      </template>

      <template v-if="[1].indexOf(dialogType) > -1">
        <div style="height: 66px;"></div>
        <div class="p-15 mt-30 abs bfixed bg-white text-right l-t">
          <el-button size="medium" class="bg-body" @click="drawerStatus = false">{{ $t('public.cancel') }}</el-button>
          <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">{{ $t('public.confirm')
          }}</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import condition from '@/components/condition/'
import selectSearch from '@/components/condition/selectSearch'
import TableColumnSet from '@/components/TableColumnSet/index'
import {
  accSub,
  accAdd,
  formatSeconds,
  unixTime,
  arrayToObj
} from '@/utils/index'

export default {
  name: 'leaseOrder',
  components: {
    condition,
    selectSearch,
    TableColumnSet,
    Pagination
  },
  computed: {
    myDeviceName() {
      let myDeviceName = this.$store.state.user.myDeviceName || {
        '充电宝': 'PA'
      }
      return myDeviceName
    },
    myDeviceId() {
      return this.$store.state.user.myDeviceId || {}
    },
    agentInfo() {
      return this.$store.getters.agentInfo
    },
    device() {
      return this.$store.state.app.device
    },
    queryObj() {
      return {
        orderNo: {
          title: this.$t('public.orderNo'),
          type: 'input'
        },
        storeId: {
          title: this.$t('public.storeName'),
          type: 'selectSearch',
          name: 'name',
          sType: 3
        },
        // agentId: {
        //   title: this.$t('public.agentNickNames'),
        //   type: 'selectSearch',
        //   name: 'name',
        //   sType: 5
        // },
        refundInd: {
          title: this.$t('public.refundStatus'),
          type: 'select',
          selectArr: {
            0: this.$t('public.all'),
            1: this.$t('public.refunded'),
            2: this.$t('public.unreimbursed'),
          }
        },
      }
    },
    defaultColumn() {
      return [
        {
          key: 'orderNo',
          val: true,
          name: this.$t('public.orderNo'),
          width: 260
        },
        {
          key: 'chargeEndTime',
          val: true,
          name: this.$t('moeny.completionTime'),
          width: 170
        },
        {
          key: 'deviceType',
          val: true,
          name: this.$t('public.deviceType')
        },
        {
          key: 'userId',
          val: true,
          name: this.$t('public.userId')
        },
        {
          key: 'storeName',
          val: true,
          name: this.$t('public.rentalMerchants')
        },
        // {
        //   key: 'deductionCycle',
        //   val: true,
        //   name: '所属代理'
        // },
        {
          key: 'depositAmount',
          val: true,
          name: `${this.$t('public.deposit')}(${this.$t('moeny.advanceDeposit')})`
        },
        {
          key: 'amount',
          val: true,
          name: this.$t('public.orderMoeny')
        },
        {
          key: 'lAmount',
          val: true,
          name: this.$t('moeny.retainedAmount')
        },
        {
          key: 'rStatus',
          val: true,
          name: this.$t('public.refundStatus')
        },
        {
          key: 'rAmount',
          val: true,
          name: `${this.$t('public.refundAmount')}(${this.$t('public.element')})`
        }
      ]
    }
  },
  data() {
    return {
      accAdd: accAdd,
      formatSeconds: formatSeconds,
      unixTime: unixTime,
      accSub: accSub,
      clickSubmit: false,
      formKey: {
        sel1: 'orderNo',
        sel2: 'storeId'
      },
      form: {},
      tableMaxH: '250',
      list: [],
      listLoading: true,
      listTotal: 0,
      listQuery: {
        page: 1,
        size: 20
      },
      totalStat: {},
      pickerOptionsEnd: {
        disabledDate: (time) => {
          let timeOptionRange = this.timeOptionRange
          let secondNum = 60 * 60 * 24 * 31 * 1000
          if (timeOptionRange) {
            return (time.getTime() > timeOptionRange.getTime() + secondNum || time.getTime() < timeOptionRange
              .getTime() - secondNum) || time.getTime() > Date.now()
          }
          return time.getTime() > Date.now() + 86400000
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
      deductionTimeStart: {
        disabledDate: (time) => {
          return time.getTime() < Date.now()
        }
      },

      // 弹出相关
      dialogType: 1,
      dialogStatus: false,
      drawerStatus: false,
      dialogTitle: {
        1: '',
      },
      curRow: {},
      curIdx: 0,
      dform: {},
      showRow: {},

      /**
       * 列的配置化对象，存储配置信息
       */
      showColumn: [],
    }
  },
  mounted(options) {
    this.getTotalStat()
    this.toQuery()
  },
  methods: {
    /**
     * 获取统计
     */
    getTotalStat() {
      var params = Object.assign({}, this.form, this.listQuery)
      if (params.date && params.date.length > 0) {
        params.startTime = params.date[0] + ' 00:00:00'
        params.endTime = params.date[1] + ' 23:59:59'
        delete params.date
      }
      delete params.page
      delete params.size
      if (params.refundInd <= 0) delete params.refundInd
      if (params.deviceTypeCode == 0) delete params.deviceTypeCode
      if (params.storeId && params.storeId.indexOf('&') > -1) {
        let ids = params.storeId.split('&')
        params.storeId = ids[0]
        //params.agentId = ids[1]
        //params.brandId = ids[2]
      }
      this.$get(`iot-saas-order/admin/order/count/queryOrderDepositCount`, params).then(res => {
        this.totalStat = res || {}
      })
    },

    /**
     * 搜索查询
     */
    toQuery() {
      if (this.clickSubmit) return
      this.clickSubmit = true
      this.listQuery.page = 1
      this.listQuery.size = 20
      this.getList()
      this.getTotalStat()
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
      this.getTotalStat()
    },

    /**
     * 获取其他信息
     */
    getOtherData(url, params) {
      return new Promise((resolve) => {
        this.$post(url, params).then(res => {
          resolve(res)
        })
      })
    },

    /**
     * 获取列表
     */
    getList() {
      var params = Object.assign({}, this.form, this.listQuery, {
        page: this.listQuery.page - 1
      })
      if (params.date && params.date.length > 0) {
        params.startTime = params.date[0] + ' 00:00:00'
        params.endTime = params.date[1] + ' 23:59:59'
        delete params.date
      }
      if (params.refundInd <= 0) delete params.refundInd
      if (params.deviceTypeCode == 0) delete params.deviceTypeCode
      if (params.storeId && params.storeId.indexOf('&') > -1) {
        let ids = params.storeId.split('&')
        params.storeId = ids[0]
      }
      console.log(params)
      this.clickSubmit = false
      this.$get('iot-saas-order/api/order/deposit/list', params).then(async (res = {}) => {
        this.listLoading = false
        this.clickSubmit = false
        let list = res.rows || []
        this.list = list
        if (params.page == 0) {
          this.listTotal = res.total
          this.tableMaxH = window.innerHeight - this.$refs.table_box.$el.offsetTop - 65
        }
      }).catch(() => {
        this.clickSubmit = false
        this.listLoading = false
      })
    },

    /**
     * 操作商户
     * @param {Object} type 1 dialog类型 2  3 drawer类型
     * @param {Object} row 选择当前数据
     * @param {Object} dialogType dialog内容显示类型
     * @param {Object} idx 当前数据所在位置
     */
    setRows(type, row, dialogType, idx) {
      switch (type) {
        case 1:
          this.dialogType = dialogType
          this.curRow = row
          this.curIdx = idx
          this.dialogStatus = true
          break
        case 3:
          this.dialogType = dialogType
          this.curRow = row
          this.curIdx = idx
          this.drawerStatus = true
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
      switch (this.dialogType) {
        case 1:

          break
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.stat-box {
  text-shadow: 2px 2px 3px rgba(0, 0, 0, 0.10);

  .item-box .info {}

  .item-box .info {
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-image: url('../../assets/lease/corruga.svg');
      background-repeat: no-repeat;
      background-position: left bottom;
      background-size: 100%;
    }
  }

  .item-box:nth-child(1) .info {
    background: linear-gradient(92deg, #95B3FF 0%, #3A89FF 100%);
  }

  .item-box:nth-child(2) .info {
    background: linear-gradient(92deg, #E982FE 0%, #B353FF 100%);
  }

  .item-box:nth-child(3) .info {
    background: linear-gradient(92deg, #FDC879 0%, #FF985F 100%);
  }

  .img {
    width: 54px;
    height: 54px;
    padding-top: 5px;
    border-radius: 20px;
  }
}
</style>
