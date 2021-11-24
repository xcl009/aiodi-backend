<template>
  <div class="p-10">
    <div class="p-20 bg-white">
      <el-table v-loading="listLoading" :data="list" element-loading-text="Loading" stripe highlight-current-row>
        <el-table-column label="姓名" width="180">
          <template slot-scope="scope">
            {{ scope.row.name }}
          </template>
        </el-table-column>
        <el-table-column label="手机号码">
          <template slot-scope="scope">
            {{ scope.row.phone }}
          </template>
        </el-table-column>
        <el-table-column label="申请时间">
          <template slot-scope="scope">
            {{ parseTime(scope.row.add_date) }}
          </template>
        </el-table-column>
        <el-table-column label="备注" width="180">
          <template slot-scope="scope">
            {{ scope.row.remark }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" round plain>处理</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="p-20 flex justify-center">
        <pagination v-show="listQuery.page_num > 0" :page.sync="listQuery.start" :page-count="listQuery.page_num"
@pagination="getList"/>
      </div>
    </div>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  export default {
    name: 'signIn',
    components: {
      Pagination
    },
    data() {
      return {
        list: [],
        listLoading: true,
        listQuery: {
          type: 1,
          start: 1,
          total: 10,
          page_num: 1,
          info_id: this.$route.query.id
        }
      }
    },
    mounted() {
      this.getList()
    },
    methods: {
      /**
       * 获取列表
       */
      getList() {
        let listQuery = Object.assign({}, this.listQuery, {
          start: this.listQuery.start - 1
        }), url = 'signin/recordList'
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
