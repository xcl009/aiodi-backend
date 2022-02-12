<template>
  <div>
    <div class="pl-10 pr-10 bg-white">
      <el-table id="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading" stripe highlight-current-row>
        <el-table-column label="订单号">
          <template slot-scope="scope">
            {{ scope.row.id}}
          </template>
        </el-table-column>
        <el-table-column label="提现时间">
          <template slot-scope="scope">
            <span>{{ scope.row.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="提现金额">
          <template slot-scope="scope">
            <div class="el-link">{{ scope.row.amount }}</div>
          </template>
        </el-table-column>
        <el-table-column label="手续费">
          <template slot-scope="scope">
            <div class="el-link">{{ scope.row.fee }}</div>
          </template>
        </el-table-column>
        <el-table-column label="到账金额">
          <template slot-scope="scope">
            <div class="el-link el-link--primary">{{ scope.row.amountReceived}}</div>
          </template>
        </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <div class="el-link">{{ statusObj[scope.row.status] }}</div>
          </template>
        </el-table-column>
        <!-- <el-table-column label="备注">
          <template slot-scope="scope">{{ scope.row.withdraw_reason }}</template>
        </el-table-column> -->
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
</template>

<script>
  import Pagination from '@/components/Pagination'
  export default {
    name: 'withdrawRecord',
    components: {
      Pagination
    },
    computed: {
      Constant() {
        return this.$store.getters.Constant
      },
    },
    data() {
      return {
        son_id: this.$route.query.son_id || '',
        list: [],
        listLoading: true,
        listTotal: 0,
        listQuery: {
          page: 0,
          size: 20
        },
        statusObj: {
          0: '审核中',
          1: '审核不通过 ',
          2: '审核通过,到账中 ',
          3: '审核通过,已到账'
        }
      }
    },
    mounted(options) {
      this.getList()
    },
    methods: {
      getList() {
        let params = Object.assign({}, this.listQuery, {
            page: this.listQuery.page - 1
          }),
          url = 'iot-saas-pay/api/pay/withdraw/list'
        this.$get(url, params).then(res => {
          this.listLoading = false
          this.list = res.rows
          this.listTotal = res.total
        }).catch(() => {
          this.listLoading = false
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
