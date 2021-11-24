<template>
  <div class="p-5">
    <div class="bg-white">
      <el-table class="ptd-5" id="order_table"
      stripe
      :data="list"
      highlight-current-row>
      v-loading="listLoading"
      element-loading-text="Loading"
        <el-table-column label="ID">
          <template slot-scope="scope">
            {{ scope.row.id }}
          </template>
        </el-table-column>
        <el-table-column label="商户">
          <template slot-scope="scope">
            {{ scope.row.store_name }}
          </template>
        </el-table-column>
        <el-table-column label="联系人">
          <template slot-scope="scope">
            <div class="flex align-center">
              <el-avatar size="small" :src="scope.row.merchant_avatar"></el-avatar>
              <div class="flex1 ml-5">
                <div>{{ scope.row.merchant_name }}</div>
                <div>{{ scope.row.merchant_phone }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="上级代理">
          <template slot-scope="scope">
            <div class="flex align-center">
              <el-avatar size="small" :src="scope.row.agent_avatar"></el-avatar>
              <div class="flex1 ml-5">
                <div>{{ scope.row.agent_name }}</div>
                <div>{{ scope.row.agent_phone }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="返现时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.add_date, '{y}-{m}-{d} {h}:{i}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="总返现">
          <template slot-scope="scope">
            {{ scope.row.total_money }}
          </template>
        </el-table-column>
        <el-table-column label="返现金额">
          <template slot-scope="scope">
            <div class="text-blue">+{{ scope.row.fee_money }}</div>
          </template>
        </el-table-column>       
        <!-- <el-table-column label="备注">
          <template slot-scope="scope">{{ scope.row.fee_reason }}</template>
        </el-table-column> -->
      </el-table>
      <div class="flex justify-center" v-show="listQuery.page_num > 0">
        <pagination
          :page.sync="listQuery.start"
          :limit.sync="listQuery.limit"
          :page-count="listQuery.page_num"
          @pagination="getList"
        />
      </div>
    </div>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  export default {
    name: 'doorfee',
    components: {
      Pagination
    },
    data() {
      return {
        list: [],
        listLoading: true,
        listQuery: {
          start: 1,
          total: 10,
          page_num: 1
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
        }), url = 'agentapi/search/door_fee_record'
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
