<template>
  <div class="p-10">
    <div class="pl-10 pr-10 bg-white">
      <div class="pt-10 flex align-center ">
        <div class="flex1">

        </div>
        <el-button size="small" type="primary" plain @click="outTab('list_table')">导出<i class="el-icon-male el-icon--right"></i></el-button>
      </div>
      <el-table id="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading" stripe highlight-current-row>
        <el-table-column label="订单号">
          <template slot-scope="scope">
            {{ scope.row.id}}
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
        <el-table-column label="提现时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.add_date, '{y}-{m}-{d} {h}:{i}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="提现金额">
          <template slot-scope="scope">
            <div class="el-link">+{{ scope.row.withdraw_money }}</div>
          </template>
        </el-table-column>
        <el-table-column label="手续费">
          <template slot-scope="scope">
            <div class="el-link">+{{ scope.row.withdraw_service_fee }}</div>
          </template>
        </el-table-column>
        <el-table-column label="到账金额">
          <template slot-scope="scope">
            <div class="el-link el-link--success">+{{ scope.row.withdraw_money_get}}</div>
          </template>
        </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <div class="el-link el-link--success">{{ statusObj[scope.row.withdraw_status] }}</div>
          </template>
        </el-table-column>
        <el-table-column label="备注">
          <template slot-scope="scope">{{ scope.row.withdraw_reason }}</template>
        </el-table-column>
      </el-table>
      <div class="flex justify-center">
        <pagination v-show="listQuery.page_num > 0" :page.sync="listQuery.start" :limit.sync="listQuery.limit" :page-count="listQuery.page_num"
@pagination="getList"/>
      </div>
    </div>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  export default {
    name: 'income',
    components: {
      Pagination
    },
    data() {
      return {
        son_id: this.$route.query.son_id || '',
        list: [],
        listLoading: true,
        listQuery: {
          start: 1,
          total: 10,
          page_num: 1
        },
        statusObj: {
              0: '发起提现申请',
              1: '等待上级审核',
              2: '上级审核不通过',
              3: '等待最终审核',
              4: '最终审核不通过',
              5: '审核完毕, 返现中',
              6: '返现已到账并确认'
            }
      }
    },
    mounted(options) {
      this.getList()
    },
    methods: {
      getList() {
        let listQuery = Object.assign({}, this.listQuery, {
          start: this.listQuery.start - 1
        }), url = 'agentapi/my_withdraw_apply'
        this.$get(url, listQuery).then(res => {
          this.listLoading = false
          this.list = res.list
          this.listQuery.page_num = res.page_num
        }).catch(() => {
          this.listLoading = false
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
