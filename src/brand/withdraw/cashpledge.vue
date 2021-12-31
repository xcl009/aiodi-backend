<template>
  <div class="p-5">
    <div class="flex bg-white">
      <div class="pl-15 flex1 tabs-right fs-s3">
        <span class="mr-15">总押金：{{ stat_data.total_consume_amount || 0 }}元</span>
        <span class="mr-15">已退押金：{{ stat_data.has_deposited_amount || 0 }}元</span>
        <span class="mr-15">未退押金：{{ stat_data.not_deposited_amount || 0 }}元</span>
      </div>
      <el-button size="small" type="primary" plain @click="outTab('list_table')">导出<i class="el-icon-male el-icon--right"></i></el-button>
    </div>
    <div class="bg-white">
      <el-table class="ptd-5" id="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading" stripe highlight-current-row>
        <el-table-column label="订单号" width="150">
          <template slot-scope="scope">
            {{ scope.row.order_sn}}
          </template>
        </el-table-column>
        <el-table-column label="用户" width="150">
          <template slot-scope="scope">
            <div class="flex align-center">
              <el-avatar size="small" :src="scope.row.avatar"></el-avatar>
              <div class="flex1 ml-5">{{ scope.row.nick_name }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="来源" width="80">
          <template slot-scope="scope">
            {{ scope.row.mini_type == 1 ? "微信" : "支付宝" }}
          </template>
        </el-table-column>
        <el-table-column label="设备类型" width="80">
          <template slot-scope="scope">
            {{ myDeviceId[scope.row.depend_type] || '--'}}
          </template>
        </el-table-column>
        <el-table-column label="押金金额" width="80">
          <template slot-scope="scope">
            {{ scope.row.deposit_amount }}
          </template>
        </el-table-column>
        <el-table-column label="消费金额" width="80">
          <template slot-scope="scope">
            <span>{{ scope.row.money_paid || "--" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="退还金额" width="80">
          <template slot-scope="scope">
            <span>{{ scope.row.should_deposit || "--" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="申请时间">
          <template slot-scope="scope">
            <div>{{ parseTime(scope.row.apply_date) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="退款时间">
          <template slot-scope="scope">
            <div>{{ scope.row.drawbacke_expect || "--" }}</div>
          </template>
        </el-table-column>
        <el-table-column label="退款时间">
          <template slot-scope="scope">
            <div>{{ scope.row.drawbacke_expect || "--" }}</div>
          </template>
        </el-table-column>
        <el-table-column label="退款类型">
          <template slot-scope="scope">
            {{ scope.row.drawback_type == 0 ? '原路退回' : '退回到钱包' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template slot-scope="scope">
            <el-button type="primary" plain round size="small" @click="refundDeposit(scope.row)" v-if="scope.row.deposit_status == 0">立即退还</el-button>
            <el-link type="primary" v-else>已退还</el-link>
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-center">
        <pagination v-show="listQuery.page_num > 0" :page.sync="listQuery.start" :page-count="listQuery.page_num" :limit.sync="listQuery.limit"
          @pagination="getList"/>
      </div>
    </div>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  export default {
    name: 'cashpledge',
    components: {
      Pagination
    },
    data() {
      return {
        stat_data: {},
        list: [],
        listLoading: true,
        listQuery: {
          type: 1,
          start: 1,
          total: 10,
          page_num: 1,
          limit: 20
        }
      }
    },
    computed: {
      myDeviceId(){
        return this.$store.state.user.myDeviceId
      }
    },
    mounted(options) {
      this.getList()
    },
    methods: {
      getList() {
        let listQuery = Object.assign({}, this.listQuery, {
          start: this.listQuery.page - 1
        })
        this.$get('agentapi/withdaw_deposit_orders', listQuery).then(res => {
          this.listLoading = false
          this.list = res.list
          this.stat_data = res.stat_data
          this.listQuery.page_num = res.page_num
        }).catch(() => {
          this.listLoading = false
        })
      },

      /**
       * 点击退押金
       */
      refundDeposit(row){
        this.$alert('确定退还该订单押金吗？', '押金退还', {
          confirmButtonText: '确定',
          callback: action => {
            if (action == 'confirm') {
              let url = 'agentapi/agent_back_wxuser_deposit'
              if(row.mini_type == 2) url = 'agentapi/agent_back_zfbuser_deposit'
              this.$post(url, {
                order_id: row.id,
                task_id: row.task_id
              }).then(res => {
                this.$message({
                  message: '退还成功',
                  type: 'success'
                })
                row.deposit_status = 1
              })
            }
          }
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
