<template>
  <div>
    <div class="p-10 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
        :max-height="tableMaxH" element-loading-text="Loading">
        <el-table-column label="订单号">
          <template slot-scope="scope">
            {{ scope.row.orderNo }}
          </template>
        </el-table-column>
        <el-table-column label="交易单号">
          <template slot-scope="scope">
            {{ scope.row.orderNo }}
          </template>
        </el-table-column>
        <el-table-column label="类型">
          <template slot-scope="scope">
            {{ scope.row.orderNo }}
          </template>
        </el-table-column>
        <el-table-column label="支付类型">
          <template slot-scope="scope">
            微信支付
          </template>
        </el-table-column>
        <el-table-column label="用户">
          <template slot-scope="scope">
            昵称、手机号、头像
          </template>
        </el-table-column>
        <el-table-column label="商户">
          <template slot-scope="scope">
            商户名称
          </template>
        </el-table-column>
        <el-table-column label="下单时间">
          <template slot-scope="scope">
            --
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
            已完成
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
            <el-button type="info" size="mini" plain @click="setRows(1, scope.row, 2)">订单退款</el-button>
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
        <el-form class="custom-form pl-20 pr-20" label-width="auto">
          <el-form-item label="模板名称">
            <el-input v-model="dform.amount"></el-input>
          </el-form-item>
          <el-form-item label="仓口数量">
            <el-input v-model="dform.amount"></el-input>
          </el-form-item>
          <el-form-item label="单仓口商品数">
            <el-input v-model="dform.amount"></el-input>
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
  import Pagination from '@/components/Pagination'
  export default {
    components: {
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
          size: 20
        },
        form: {},

        // 弹出相关
        dialogType: 1,
        dialogStatus: false,
        dialogTitle: {
          1: '添加模板'
        },
        curRow: {},
        curIdx: 0,
        dform: {}
      }
    },
    computed: {

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
        this.$get('iot-saas-order/admin/goods/', params).then(res => {
          this.list = res.rows || []
          if(params.page == 0){
            this.listTotal = res.total
            this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 80
          }
          this.listLoading = false
          this.clickSubmit = false
        }).catch(() => {
          this.clickSubmit = false
          this.listLoading = false
        })
      },

      /**
       * 操作数据
       * @param {Object} type 1 dialog类型
       * @param {Object} row 选择当前数据
       * @param {Object} dialogType dialog内容显示类型 1: '添加模板'
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
        if(this.clickSubmit) return
        this.clickSubmit = true
        switch (this.dialogType) {
          case 1:

            break
        }
      }
    }
  }
</script>

<style scoped lang="scss">
  /deep/ .el-dialog__body {
    padding: 10px;
  }
</style>
