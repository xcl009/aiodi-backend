<template>
  <div>
    <div class="bg-white">
      <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
        <template v-slot:defult>
          <el-select v-model="listQuery.lowerAgent" placeholder="订单来源" @change="toQuery()">
            <el-option label="我的订单" :value="false" />
            <el-option label="下级订单" :value="true" />
          </el-select>
          <el-input v-model="form.orderNo" placeholder="订单号" />
          <selectSearch v-model="form.userId" :type="1" name="mobile" placeholder="手机号" @change="toQuery()"></selectSearch>
          <selectSearch v-model="form.userId" :type="2" name="nickname" placeholder="用户昵称" @change="toQuery()"></selectSearch>
          <selectSearch v-model="form.storeId" :type="3" name="name" placeholder="商户名称" @change="toQuery()" :isStoreOrder="true"></selectSearch>
          <el-input v-model="form.deviceSn" placeholder="设备SN" />
          <el-input v-model="form.transactionNo" placeholder="交易单号" />
          <el-select v-model="form.orderStatus" placeholder="订单状态" @change="toQuery()">
            <el-option label="全部" value="" />
            <el-option :label="item" :value="key" v-for="(item, key) in {'PAYMENT': '已完成', 'REFUND': '已退款'}" />
          </el-select>
          <el-date-picker
            class="range-day flex align-center"
              v-model="form.date"
              type="daterange"
              range-separator="-"
              value-format="yyyy-MM-dd HH:mm:ss"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :picker-options="pickerOptionsEnd"
              @change="toQuery()">
            </el-date-picker>
        </template>
      </condition>

      <div class="pl-15 pr-15 pb-5">
        <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
          :max-height="tableMaxH" element-loading-text="Loading">
          <el-table-column label="订单号">
            <template slot-scope="scope">
              {{ scope.row.orderNo }}
            </template>
          </el-table-column>
          <el-table-column label="交易单号">
            <template slot-scope="scope">
              {{ scope.row.transactionNo }}
            </template>
          </el-table-column>
          <el-table-column label="类型">
            <template slot-scope="scope">
              {{ scope.row.deviceTypeName }}
            </template>
          </el-table-column>
          <el-table-column label="支付类型">
            <template slot-scope="scope">
              {{ scope.row.payTypeName }}
            </template>
          </el-table-column>
          <el-table-column label="用户" width="150">
            <template slot-scope="scope" v-if="scope.row.userInfo">
              <div>{{ dealPhone(scope.row.userInfo.mobile) }}</div>
              <div class="text-cut">{{ scope.row.userInfo.nikeName || "--" }}</div>
            </template>
          </el-table-column>
          <el-table-column label="商户">
            <template slot-scope="scope">
              {{ scope.row.storeName }}
            </template>
          </el-table-column>
          <el-table-column label="下单时间">
            <template slot-scope="scope">
              {{ scope.row.orderDatetime }}
            </template>
          </el-table-column>
          <el-table-column label="二维码SN">
            <template slot-scope="scope">
              {{ scope.row.deviceSn }}
            </template>
          </el-table-column>
          <el-table-column label="购买详情" width="150">
            <template slot-scope="scope">
              成本价:{{ scope.row.buyDetail.costPrice }}元，售价:{{ scope.row.buyDetail.retailPrice }}元，{{ scope.row.buyDetail.position }}号仓口
            </template>
          </el-table-column>
          <el-table-column label="收益(元)" width="75">
            <template slot-scope="scope">
              <el-link type="success">{{ scope.row.amount || '0.00' }}</el-link>
            </template>
          </el-table-column>
          <el-table-column label="退款(元)" width="75">
            <template slot-scope="scope">
              <el-link type="success">{{ scope.row.refundAmount || '0.00' }}</el-link>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="80">
            <template slot-scope="scope">
              {{ scope.row.statusName }}
            </template>
          </el-table-column>
          <el-table-column label="备注" min-width="150">
            <template slot-scope="scope">
              <div class="remark-box">
                <el-link type="danger" v-if="scope.row.remark">{{ scope.row.remark }}</el-link>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="getDetail(scope.row)">订单详情</el-button>
              <el-button type="info" size="mini" plain @click="setRows(1, scope.row, 2)" v-if="scope.row.statusName == '已支付'">订单退款</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="flex justify-center">
          <pagination
            v-show="listTotal > 0"
            :page.sync="listQuery.page"
            :limit.sync="listQuery.size"
            :total="parseInt(listTotal)"
            @pagination="getList"
          />
        </div>
      </div>
    </div>

    <el-dialog title="订单详情" :visible.sync="detailDialog">
      <el-row class="text-center">
        <el-col :xs="12" :sm="12" :md="4" class="rel pb-50 mb-15 timeline-item el-icon-" v-for="(item, index) in orderFlow">
          <div class="abs" style="width: 100%;">
            <div>{{ item.event }}</div>
            <div class="mt-10 fs-s2 text-gray">{{ parseTime(item.createTime) }}</div>
          </div>
        </el-col>
      </el-row>

      <template v-if="orderDivide.length > 0">
        <el-table border stripe :data="orderDivide" :span-method="fenRunSpanMethod" class="custom">
          <el-table-column label="订单金额" align="center">
            <template slot-scope="scope">
              {{ amountPaid }}元
            </template>
          </el-table-column>
          <el-table-column width="190" label="分成人" align="center">
            <template slot-scope="scope">
              {{ scope.row.dividerName }}
            </template>
          </el-table-column>
          <el-table-column label="分成名称" align="center">
            <template slot-scope="scope">
              {{ scope.row.dividerModeName }}
            </template>
          </el-table-column>
          <el-table-column label="分成比例" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.dividerModeName.indexOf('成本价') > -1 || scope.row.dividerModeName.indexOf('管理费') > -1">--</span>
              <span v-else>{{ scope.row.percent }}%</span>
            </template>
          </el-table-column>
          <el-table-column label="分成金额(元)" align="center">
            <template slot-scope="scope">
              {{ scope.row.amount }}
            </template>
          </el-table-column>
          <el-table-column label="退款金额(元)" align="center">
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
          <el-form-item label="退回方式">
            <el-radio-group v-model="dform.refundType">
              <el-radio :label="key" v-for="(item, key) in Constant.RefundType" v-if="(key == 2 && curRow.feeType == 2 && curRow.payType < 3) || (key != 2)">{{ item }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="退款金额">
            <el-input v-model="dform.amount" :placeholder="`最多${curRow.amount}元`">
               <span slot="append">元</span>
            </el-input>
          </el-form-item>
          <el-form-item label="退款原因">
            <el-input v-model="dform.reason" placeholder="非必填，若填写将展示在用户退款信息中"></el-input>
          </el-form-item>
        </el-form>
      </template>
      <div class="pb-20 mt-30 text-center">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">取消</el-button>
        <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import condition from '@/components/condition/'
  import selectSearch from '@/components/condition/selectSearch'
  import Pagination from '@/components/Pagination'
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
        dialogTitle: {
          1: '',
          2: '订单退款',
        },
        curRow: {},
        curIdx: 0,
        dform: {}
      }
    },
    computed: {
      Constant() {
        return this.$store.getters.Constant
      }
    },
    mounted() {
      this.toQuery(1)
    },
    methods: {
      /**
       * 搜索查询
       */
      toQuery() {
        if(this.clickSubmit) return
        this.clickSubmit = true
        this.listQuery.page = 1
        this.listQuery.size = 20
        this.getList()
      },

      /**
       * 重置查询
       */
      reset(){
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
        if(params.date && params.date.length > 0){
          params.startDate = params.date[0]
          params.endDate = params.date[1]
          delete params.date
        }
        this.$get('iot-saas-order/admin/goods/', params).then((res = {}) => {
          this.list = res.rows || []
          if(params.page == 0){
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
        let curRow = this.curRow,
          curIdx = this.curIdx,
          params = JSON.parse(JSON.stringify(this.dform))
        if(this.clickSubmit) return
        this.clickSubmit = true
        switch (this.dialogType) {
          case 1:

            break
          case 2:
            if(!params.amount){
              this.$message({
                message: '请输入退款金额',
                type: 'error'
              })
              return
            }
            params.orderId = this.curRow.id
            this.$post('iot-saas-order/admin/goods/refund', params).then(res => {
              this.$message({
                message: '订单退款成功',
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

  .timeline-item{
    height: 100px;
    &::after,&::before{
      content: '';
      position: absolute;
    }
    &::before{
      width: 60px;
      height: 14px;
      top: 45px;
      margin-left: -30px;
      content: "";
      background-color: var(--white);
      color: var(--olive);
      z-index: 99;
    }
    &::after{
      top: 51px;
      margin-left: 20px;
      width: 100%;
      height: 1px;
      background: var(--olive);
    }
    &:nth-child(2n){
      padding-top: 70px;
    }

    &.err{
      &::before{
        content: "";
        color: "#FF5353";
      }
    }
    @media only screen and (max-width: 991px) {
      &:last-child, &:nth-child(2n){
        &::after{
          width: 0;
        }
      }
    }
    @media only screen and (min-width: 992px) {
      &:last-child, &:nth-child(6n){
        &::after{
          width: 0;
        }
      }
    }
  }
</style>
