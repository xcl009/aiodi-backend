<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:defult>
        <el-form-item label="设备类型">
          <el-select v-model="form.deviceTypeCode" @change="toQuery()" placeholder="设备类型">
            <el-option :label="index" :value="''+item+''" v-for="(item, index) in myDeviceName" />
          </el-select>
        </el-form-item>
        <el-form-item label="扣款状态">
          <el-select v-model="form.status" @change="toQuery()" placeholder="扣款状态">
            <el-option label="未开始" value="0"/>
            <el-option label="进行中" value="1"/>
            <el-option label="已完成" value="2"/>
            <el-option label="已取消" value="9"/>
          </el-select>
        </el-form-item>
        <el-form-item label="创建日期">
          <el-date-picker
            class="range-day flex align-center"
              @change="toQuery()"
              :picker-options="pickerOptionsEnd"
              v-model="form.date"
              type="daterange"
              value-format="yyyy-MM-dd HH:mm:ss"
              range-separator="-"
              start-placeholder="开始"
              end-placeholder="结束">
            </el-date-picker>
        </el-form-item>
      </template>
      <template v-slot:endButton>
        <el-button size="small" type="primary" @click="$router.push({path: `/leaseOrder/edit?createType=${createType}&deductionId=${deductionId}`})">创建订单</el-button>
      </template>
    </condition>

    <div class="pl-10 pr-10 bg-white">
      <el-table id="table_box" ref="table_box" v-loading="listLoading" :data="list" element-loading-text="Loading" highlight-current-row :max-height="tableMaxH">
        <el-table-column type="selection" width="50"></el-table-column>
        <el-table-column label="订单号" min-width="140">
          <template slot-scope="scope">
            {{ scope.row.orderNo }}
          </template>
        </el-table-column>
        <el-table-column label="设备类型" width="90">
          <template slot-scope="scope">
            {{ myDeviceId[scope.row.deviceTypeCode] }}
          </template>
        </el-table-column>
        <el-table-column label="设备数量" width="120">
          <template slot-scope="scope">
            {{ scope.row.deviceNum }}
          </template>
        </el-table-column>
        <el-table-column label="总扣款金额(元)" width="120">
          <template slot-scope="scope">
            {{ scope.row.amountTotal }}
          </template>
        </el-table-column>
        <el-table-column label="已扣款金额(元)" width="120">
          <template slot-scope="scope">
            {{ scope.row.payAmount }}
          </template>
        </el-table-column>
        <el-table-column label="扣款周期(天)" width="120">
          <template slot-scope="scope">
            {{ scope.row.deductionCycle }}
          </template>
        </el-table-column>
        <el-table-column label="单次扣款金额" width="120">
          <template slot-scope="scope">
            {{ scope.row.deductionAmount || 0.00 }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template slot-scope="scope">
            {{ scope.row.statusStr }}
          </template>
        </el-table-column>
        <el-table-column label="扣款开始" width="150">
          <template slot-scope="scope">
            {{ parseTime(scope.row.deductionTime) }}
          </template>
        </el-table-column>
        <el-table-column label="预计完成" width="150">
          <template slot-scope="scope">
            {{ parseTime(scope.row.closeTime) }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="150">
          <template slot-scope="scope">
            {{ parseTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="245">
          <template slot-scope="scope">
            <div class="flex flex-wrap">
              <el-button type="primary" size="mini" @click="$router.push({path: `/leaseOrder/edit?createType=${createType}&deductionId=${deductionId}&orderId=${scope.row.id}`})" v-if="[0,1].indexOf(scope.row.status) > -1">修改</el-button>
              <el-button type="info" size="mini" @click="setRows(1, scope.row, 1)" v-if="[0,1].indexOf(scope.row.status) > -1">取消</el-button>
            </div>
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

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" width="560px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 1">
        <div class="text-center">
          <div class="text-black">确定取消此订单吗？</div>
          <div class="mt-10 pl-40 pr-40 text-danger">注：取消后不可恢复。</div>
        </div>
      </template>
      <div class="mt-30 text-center">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">取消</el-button>
        <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import condition from '@/components/condition/'
  export default {
    name: 'leaseOrder',
    components: {
      condition,
      Pagination
    },
    computed: {
      myDeviceName(){
        return this.$store.state.user.myDeviceName
      },
      myDeviceId() {
        return this.$store.state.user.myDeviceId
      },
      agentInfo(){
        return this.$store.getters.agentInfo
      }
    },
    data() {
      return {
        createType: this.$route.query.createType || 0,
        deductionId: this.$route.query.deductionId,

        clickSubmit: false,
        form: {},
        tableMaxH: '250',
        list: [],
        listLoading: true,
        listTotal: 0,
        listQuery: {
          page: 1,
          size: 20
        },
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

        // 弹出相关
        dialogType: 1,
        dialogStatus: false,
        dialogTitle: {
          1: '取消订单'
        },
        curRow: {},
        curIdx: 0,
        dform: {}
      }
    },
    mounted(options) {
      this.getList()
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
        if(this.clickSubmit) return
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
        var params = Object.assign({}, this.form, this.listQuery, {
          page: this.listQuery.page - 1
        })
        if(params.date && params.date.length > 0){
          params.startTime = params.date[0]
          params.endTime = params.date[1]
          delete params.date
        }
        if(this.createType >= 0) params.createType = this.createType
        if(this.deductionId) params.deductionId = this.deductionId
        this.$get('iot-saas-order/admin/order/device/rent/findPage', params).then(res => {
          this.listLoading = false
          this.clickSubmit = false
          this.list = res.rows
          if(params.page == 0){
            this.listTotal = res.total
            this.tableMaxH = window.innerHeight - this.$refs.table_box.$el.offsetTop - 85
          }
        }).catch(() => {
          this.clickSubmit = false
          this.listLoading = false
        })
      },

      /**
       * 操作商户
       * @param {Object} type 1 dialog类型
       * @param {Object} row 选择当前数据
       * @param {Object} dialogType dialog内容显示类型 1: '取消订单'
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
            this.$post(`iot-saas-order/admin/order/device/rent/close/${curRow.id}`).then(res => {
              this.$message({
                message: '取消成功',
                type: 'success'
              })
              curRow.status = 9
              curRow.statusStr = '已取消'
              this.dialogStatus = false
              this.clickSubmit = false
            }).catch(err => {
              this.clickSubmit = false
            })
            break
        }
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
