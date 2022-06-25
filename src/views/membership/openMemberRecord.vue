<template>
  <div>
    <condition ref="condition" @reset="reset" @query="toQuery">
      <template v-slot:defult>
        <el-select v-model="form.state" placeholder="状态" @change="toQuery()">
           <el-option :label="item.title" :value="item.val" v-for="(item, key) in [{val: '', title: '全部'}, {val: 'O', title: '已付款'}, {val: 'U', title: '待付款'}]" />
        </el-select>
        <el-input v-model="form.serviceName" placeholder="卡名称"/>
        <selectSearch v-model="form.userId" :type="1" name="mobile" placeholder="手机号" @change="toQuery()"></selectSearch>
        <selectSearch v-model="form.userId" :type="2" name="nickname" placeholder="用户昵称" @change="toQuery()"></selectSearch>
      </template>
    </condition>

    <div class="pl-15 pr-15 pb-5 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading" :max-height="tableMaxH">
        <el-table-column label="单号">
          <template slot-scope="scope">
            <div>{{ scope.row.orderNo || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="开卡用户">
          <template slot-scope="scope">
            <div class="flex align-center">
              <el-avatar :size="30" :src="scope.row.avatar" fit="fill" icon="el-icon-picture-outline"></el-avatar>
              <div class="pl-10">
                <div>{{ scope.row.nickname }}</div>
                <div v-if="scope.row.mobile">{{ dealPhone(scope.row.mobile) }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="开卡时间">
          <template slot-scope="scope">
            {{ scope.row.createTime }}
          </template>
        </el-table-column>
        <el-table-column label="卡名称">
          <template slot-scope="scope">
            <div>{{ scope.row.serviceName || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="支付金额">
          <template slot-scope="scope">
            <div class="mb-5">{{ scope.row.orderAmount || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="卡押金">
          <template slot-scope="scope">
            <div class="mb-5">{{ scope.row.depositAmount || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="卡商户">
          <template slot-scope="scope">
            {{ scope.row.storeName || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="订单状态">
          <template slot-scope="scope">
            <el-tag class="normal fs-s4">{{ Constant.OrderStatus[scope.row.state] || "--" }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="info" size="mini" plain @click="setRows(1, scope.row, 1)" v-if="scope.row.state == 'O' && scope.row.depositAmount > 0 && scope.row.amountRefund == 0">押金退款</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-center">
        <pagination
          :page.sync="listQuery.page"
          :limit.sync="listQuery.size"
          :total="parseInt(listTotal)"
          @pagination="getList"
        />
      </div>
    </div>

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" width="454px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 1">
        <div class="text-center">
          <div class="text-black">确定退还卡押金吗？</div>
          <div class="mt-10 pl-40 pr-40 text-gray">注：押金将退还用户小程序钱包中。</div>
        </div>
      </template>
      <div class="mt-30 text-center">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">取消</el-button>
        <el-button size="medium" type="primary" @click="dialogConfim()" :disabled="clickSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import condition from '@/components/condition/'
  import selectSearch from '@/components/condition/selectSearch'
  export default {
    name: 'openMemberRecord',
    components: {
      Pagination,
      condition,
      selectSearch
    },
    props: {

    },
    data() {
      return {
        clickSubmit: false,
        tabs: [],
        form: {
          state: 'O'
        },
        tableMaxH: '250',
        list: [],
        listLoading: true,
        listTotal: 0,
        listQuery: {
          page: 1,
          size: 20
        },

        // 弹出相关
        dialogType: 1,
        dialogStatus: false,
        dialogTitle: {
          1: ''
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
      this.toQuery()
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
       * 获取列表
       */
      getList() {
        var params = Object.assign({}, this.form, this.listQuery, {
          page: this.listQuery.page - 1
        })
        this.$get('iot-saas-order/api/brand/goods/order/admin/list', params).then(res => {
          this.list = res ? res.rows : []
          this.listLoading = false
          this.clickSubmit = false
          if(params.page == 0){
            this.listTotal = res ? res.total : 0
            this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 80
          }
        }).catch(() => {
          this.listLoading = false
          this.clickSubmit = false
        })
      },

      /**
       * 操作商户
       * @param {Object} type 1 dialog类型
       * @param {Object} row 选择当前数据
       * @param {Object} dialogType dialog内容显示类型 1: '押金退款'
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
        switch (this.dialogType) {
          case 1:
            if(this.clickSubmit) return
            this.clickSubmit = true
            this.$post('iot-saas-order/api/brand/goods/order/refundDeposit', {
              orderNo: curRow.orderNo
            }).then(res => {
              this.$message({
                type: 'success',
                message: '退还成功'
              })
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
  .el-tag{
    height: 24px;
    line-height: 24px;
    border: none;
    border-radius: 2px;
    &.normal{
      background-color: rgba(7, 193, 96, 0.1);
      color: #07C160;
    }
    &.is-expired{
      background-color: rgba(255, 163, 44, 0.1);
      color: #FFA32C;
    }
    &.expired{
      background-color: #F2F3F5;
      color: #86909C;
    }
  }

</style>
