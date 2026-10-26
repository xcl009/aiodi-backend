<template>
  <div>
    <div class="bg-white">
      <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
        <template v-slot:defult>
          <el-form-item :label="$t('order.orderSource')">
            <el-select v-model="listQuery.lowerAgent" :placeholder="$t('order.orderSource')" @change="toQuery()">
              <el-option :label="$t('system.myOder')" :value="false" />
              <el-option :label="$t('goods.SubordinateOrders')" :value="true" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('public.orderNo')">
            <el-input v-model="form.orderNo" :placeholder="$t('public.orderNo')" />
          </el-form-item>
          <el-form-item :label="$t('public.phone')">
            <selectSearch v-model="form.userId" :type="1" name="mobile" :placeholder="$t('public.phone')"
              @change="toQuery()"></selectSearch>
          </el-form-item>
          <el-form-item :label="$t('public.userNickName')">
            <selectSearch v-model="form.userId" :type="2" name="nickname" :placeholder="$t('public.userNickName')"
              @change="toQuery()"></selectSearch>
          </el-form-item>
          <el-form-item :label="$t('public.storeName')">
            <selectSearch v-model="form.storeId" :type="3" name="name" :placeholder="$t('public.storeName')"
              @change="toQuery()" :isStoreOrder="true"></selectSearch>
          </el-form-item>
          <el-form-item :label="$t('public.deviceSn')">
            <el-input v-model="form.deviceSn" :placeholder="$t('public.deviceSn')" />
          </el-form-item>
          <el-form-item :label="$t('public.transactionNum')">
            <el-input v-model="form.transactionNo" :placeholder="$t('public.transactionNum')" />
          </el-form-item>
          <el-form-item :label="$t('public.orderType')">
            <el-select v-model="form.orderStatus" :placeholder="$t('public.orderType')" @change="toQuery()">
              <el-option :label="$t('public.all')" value="" />
              <el-option :label="item" :value="key"
                v-for="(item, key) in { 'PAYMENT': $t('public.completed'), 'REFUND': $t('public.refunded') }" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('public.selectDate')">
            <el-date-picker class="range-day flex align-center" v-model="form.date" type="daterange" range-separator="-"
              value-format="yyyy-MM-dd HH:mm:ss" :start-placeholder="$t('public.statrtDate')"
              :end-placeholder="$t('public.endDate')" :picker-options="pickerOptionsEnd" @change="toQuery()">
            </el-date-picker>
          </el-form-item>
        </template>
      </condition>

      <div class="pl-15 pr-15 pb-5">
        <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
          :max-height="tableMaxH" element-loading-text="Loading">
          <el-table-column :label="$t('public.orderNo')">
            <template slot-scope="scope">
              {{ scope.row.orderNo }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('public.transactionNum')">
            <template slot-scope="scope">
              {{ scope.row.transactionNo }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('public.type')">
            <template slot-scope="scope">
              {{ scope.row.deviceTypeName }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('public.payType')">
            <template slot-scope="scope">
              {{ scope.row.payTypeName }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('public.user')" width="150">
            <template slot-scope="scope" v-if="scope.row.userInfo">
              <div>{{ dealPhone(scope.row.userInfo.mobile) }}</div>
              <div class="text-cut">{{ scope.row.userInfo.nikeName || "--" }}</div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('public.store')">
            <template slot-scope="scope">
              {{ scope.row.storeName }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('public.orderTime')">
            <template slot-scope="scope">
              {{ scope.row.orderDatetime }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('goods.ewcCode')">
            <template slot-scope="scope">
              {{ scope.row.deviceSn }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('goods.buyDetails')" width="150">
            <template slot-scope="scope">
              {{ $t('goods.costPrice') }}:{{currencySymbolpositionType ? siteInfo.currencySymbol:'' }} {{ scope.row.buyDetail.costPrice }}{{currencySymbolpositionType ? '': siteInfo.currencySymbol }}，{{
                $t('goods.retailPrice') }}:{{currencySymbolpositionType ? siteInfo.currencySymbol:'' }}{{ scope.row.buyDetail.retailPrice }}{{currencySymbolpositionType ? '': siteInfo.currencySymbol }}，{{
    scope.row.buyDetail.position }}{{ $t('public.numCard') }}
            </template>
          </el-table-column>
          <el-table-column :label="`${$t('public.income')}`" width="75">
            <template slot-scope="scope">
              <el-link type="success">{{ scope.row.amount || '0.00' }}</el-link>
            </template>
          </el-table-column>
          <el-table-column :label="`${$t('public.refund')}`" width="75">
            <template slot-scope="scope">
              <el-link type="success">{{ scope.row.refundAmount || '0.00' }}</el-link>
            </template>
          </el-table-column>
          <el-table-column :label="$t('public.status')" width="80">
            <template slot-scope="scope">
              {{ scope.row.statusName }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('public.remark')" min-width="150">
            <template slot-scope="scope">
              <div class="remark-box">
                <el-link type="danger" v-if="scope.row.remark">{{ scope.row.remark }}</el-link>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('public.actions')" min-width="120" :fixed="device == 'desktop' ? 'right' : false">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="getDetail(scope.row)">{{ $t('public.orderDetail')
              }}</el-button>
              <el-button type="info" size="mini" plain @click="setRows(1, scope.row, 2)"
                v-if="Ability['orderRefund'] && scope.row.statusName == '已支付'">{{ $t('public.orderRefund') }}</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="flex justify-center">
          <pagination v-show="listTotal > 0" :page.sync="listQuery.page" :limit.sync="listQuery.size"
            :total="parseInt(listTotal)" @pagination="getList" />
        </div>
      </div>
    </div>

    <el-dialog :title="$t('public.orderDetail')" :visible.sync="detailDialog">
      <el-row class="text-center">
        <el-col :xs="12" :sm="12" :md="4" class="rel pb-50 mb-15 timeline-item el-icon-"
          v-for="(item, index) in orderFlow">
          <div class="abs" style="width: 100%;">
            <div>{{ item.event }}</div>
            <div class="mt-10 fs-s2 text-gray">{{ parseTime(item.createTime) }}</div>
          </div>
        </el-col>
      </el-row>

      <template v-if="orderDivide.length > 0">
        <el-table border :data="orderDivide" :span-method="fenRunSpanMethod" class="custom">
          <el-table-column :label="$t('public.orderMoney')" align="center">
            <template slot-scope="scope">
              {{ amountPaid }}
            </template>
          </el-table-column>
          <el-table-column width="190" :label="$t('order.divideIntoAdults')" align="center">
            <template slot-scope="scope">
              {{ scope.row.dividerName }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('goods.dividedIntoNames')" align="center">
            <template slot-scope="scope">
              {{ scope.row.dividerModeName }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('public.shareRatio')" align="center">
            <template slot-scope="scope">
              <span
                v-if="scope.row.dividerModeName.indexOf('成本价') > -1 || scope.row.dividerModeName.indexOf('管理费') > -1">--</span>
              <span v-else>{{ scope.row.percent }}%</span>
            </template>
          </el-table-column>
          <el-table-column :label="`${$t('public.dividedAmount')}`" align="center">
            <template slot-scope="scope">
              {{ scope.row.amount }}
            </template>
          </el-table-column>
          <el-table-column :label="`${$t('public.refundAmount')}`" align="center">
            <template slot-scope="scope">
              {{ scope.row.refund }}
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-dialog>

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" width="560px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 2">
        <el-form class="custom-form pl-20 pr-20" label-width="auto">
          <el-form-item :label="$t('public.returnType')">
            <el-radio-group v-model="dform.refundType">
              <el-radio :label="key" v-for="(item, key) in Constant.RefundType"
                v-if="(key == 2 && curRow.feeType == 2 && curRow.payType < 3) || (key != 2)">{{ item }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="$t('public.refundAmount')">
            <el-input v-model="dform.amount" :placeholder="`${$t('public.max')}${curRow.amount}`">
              <span :slot="currencySymbolpositionType ? 'prepend':'append'">{{ siteInfo.currencySymbol }}</span>
            </el-input>
          </el-form-item>
          <el-form-item :label="$t('order.reasonForRefund')">
            <el-input v-model="dform.reason" :placeholder="$t('order.reasonForRefundText')"></el-input>
          </el-form-item>
        </el-form>
      </template>
      <div class="pb-20 mt-30 text-center">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">{{ $t('public.cancel') }}</el-button>
        <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">{{ $t('public.confirm')
        }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import condition from '@/components/condition/'
import selectSearch from '@/components/condition/selectSearch'
import Pagination from '@/components/Pagination'
import {
  currencySymbolposition
} from '@/utils/index'
export default {
  components: {
    condition,
    selectSearch,
    Pagination
  },
  props: {
    type: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      clickSubmit: false,
      tableMaxH: '250',
      listLoading: false,
      listTotal: 0,
      list: [],
      listQuery: {
        status: '',
        page: 1,
        size: 20,
        lowerAgent: false
      },
      form: {},
      pickerOptionsEnd: {
        disabledDate: (time) => {
          let timeOptionRange = this.timeOptionRange
          let secondNum = 60 * 60 * 24 * 31 * 1000
          if (timeOptionRange) {
            return (time.getTime() > timeOptionRange.getTime() + secondNum || time.getTime() < timeOptionRange.getTime() - secondNum) || time.getTime() > Date.now()
          }
          return time.getTime() > Date.now()
        }, onPick: (time) => {
          //当第一时间选中才设置禁用
          if (time.minDate && !time.maxDate) {
            this.timeOptionRange = time.minDate
          }
          if (time.maxDate) {
            this.timeOptionRange = null
          }
        }
      },
      // 订单详情
      detailDialog: false,
      orderFlow: [],
      orderDivide: [],
      amountPaid: '',

      // 弹出相关
      dialogType: 1,
      dialogStatus: false,
      curRow: {},
      curIdx: 0,
      dform: {},
      currencySymbolpositionType:false
    }
  },
  computed: {
    device() {
      return this.$store.state.app.device
    },
    Constant() {
      return this.$store.getters.Constant
    },
    Ability() {
      return this.$store.getters.Ability
    },
    siteInfo() {
      return this.$store.getters.siteInfo
    },
    dialogTitle(){
      return {
        1: '',
        2: this.$t('public.orderRefund'),
      }
    }
  },
  mounted() {
    this.currencySymbolpositionType =  currencySymbolposition();
    this.toQuery(1)
  },
  methods: {
    /**
     * 搜索查询
     */
    toQuery() {
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
      this.form = {
        activated_status: 1
      }
      this.listQuery.page = 1
      this.listQuery.size = 20
      this.getList()
    },

    /**
     * h获取列表
     */
    getList() {
      let params = Object.assign({}, this.form, this.listQuery, {
        page: this.listQuery.page - 1
      })
      if (params.date && params.date.length > 0) {
        params.startDate = params.date[0]
        params.endDate = params.date[1]
        delete params.date
      }
      this.$get('iot-saas-order/admin/goods/', params).then((res = {}) => {
        this.list = res.rows || []
        if (params.page == 0) {
          this.listTotal = res.total
          this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 120
        }
        this.listLoading = false
        this.clickSubmit = false
      }).catch(() => {
        this.clickSubmit = false
        this.listLoading = false
      })
    },

    /**
     * 订单详情分润合并单元格
     */
    fenRunSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        if (rowIndex % 8 === 0) {
          return {
            rowspan: 8,
            colspan: 1
          }
        } else {
          return {
            rowspan: 0,
            colspan: 0
          }
        }
      }
    },

    /**
     * 操作数据
     * @param {Object} type 1 dialog类型
     * @param {Object} row 选择当前数据
     * @param {Object} dialogType dialog内容显示类型 1: ''
     * @param {Object} idx 当前数据所在位置
     */
    setRows(type, row, dialogType, idx) {
      switch (type) {
        case 1:
          this.dialogType = dialogType
          this.curRow = row
          this.curIdx = idx
          this.dialogStatus = true
          this.dform = {
            refundType: '0'
          }
          break
      }
    },

    /**
     * 弹窗确认
     */
    dialogConfirm() {
      let that = this;
      let curRow = this.curRow,
        curIdx = this.curIdx,
        params = JSON.parse(JSON.stringify(this.dform))
      if (this.clickSubmit) return
      this.clickSubmit = true
      switch (this.dialogType) {
        case 1:

          break
        case 2:
          if (!params.amount) {
            this.$message({
              message: that.$t('goods.message3'),
              type: 'error'
            })
            return
          }
          params.orderId = this.curRow.id
          this.$post('iot-saas-order/admin/goods/refund', params).then(res => {
            this.$message({
              message: that.$t('order.orderRefundSuccess'),
              type: 'success'
            })
            curRow.statusName = '已退款'
            curRow.refundAmount = params.amount
            this.dialogStatus = false
            this.clickSubmit = false
          }).catch(err => {
            this.clickSubmit = false
          })
          break
      }
    },

    /**
     * 查询订单详情
     */
    getDetail(row) {
      this.$get(`iot-saas-order/admin/goods/${row.orderNo}`).then(res => {
        this.orderFlow = res.orderFlows
        this.orderDivide = res.orderDivides
        this.amountPaid = res.amount
        this.detailDialog = true
      })
    },
  }
}
</script>

<style scoped lang="scss">
/deep/ .el-dialog__body {
  padding: 10px;
}

.timeline-item {
  height: 100px;

  &::after,
  &::before {
    content: '';
    position: absolute;
  }

  &::before {
    width: 60px;
    height: 14px;
    top: 45px;
    margin-left: -30px;
    content: "";
    background-color: var(--white);
    color: var(--olive);
    z-index: 99;
  }

  &::after {
    top: 51px;
    margin-left: 20px;
    width: 100%;
    height: 1px;
    background: var(--olive);
  }

  &:nth-child(2n) {
    padding-top: 70px;
  }

  &.err {
    &::before {
      content: "";
      color: "#FF5353";
    }
  }

  @media only screen and (max-width: 991px) {

    &:last-child,
    &:nth-child(2n) {
      &::after {
        width: 0;
      }
    }
  }

  @media only screen and (min-width: 992px) {

    &:last-child,
    &:nth-child(6n) {
      &::after {
        width: 0;
      }
    }
  }
}</style>
