<template>
  <div>
    <div class="p-10 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="[{},{}]"
        :max-height="tableMaxH" element-loading-text="Loading">
        <el-table-column label="订单号">
          <template slot-scope="scope">
            ----
          </template>
        </el-table-column>
        <el-table-column label="交易单号">
          <template slot-scope="scope">
            -------
          </template>
        </el-table-column>
        <el-table-column label="类型">
          <template slot-scope="scope">
            3口售货机
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
        <el-table-column label="设备">
          <template slot-scope="scope">
            <div>二维码：--</div>
            <div>设备SN：--</div>
          </template>
        </el-table-column>
        <el-table-column label="下单时间">
          <template slot-scope="scope">
            --
          </template>
        </el-table-column>
        <el-table-column label="购买详情" width="150">
          <template slot-scope="scope">
            成本价:0.1元，售价:0.2元，6号仓口
          </template>
        </el-table-column>
        <el-table-column label="收益(元)" width="75">
          <template slot-scope="scope">
            <el-link type="success">{{ scope.row.amount || '0.00' }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="退款(元)" width="75">
          <template slot-scope="scope">
            <el-link type="success">{{ scope.row.amountRefund || '0.00' }}</el-link>
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
        <el-button size="medium" type="primary" @click="dialogConfim()" :disabled="clickSubmit">确定</el-button>
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
      // if (this.type == 2) {
      //   this.getShop()
      // } else {
      //   this.getInfo()
      // }
      // this.getGoods()
    },
    methods: {
      /**
       * 获取信息
       */
      getInfo() {
        this.$get('agentapi/product/get_business_samples', {
          store_id: this.id
        }).then(res => {
          this.save_plan = res.list ? Object.values(res.list) : []
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
      dialogConfim() {
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
