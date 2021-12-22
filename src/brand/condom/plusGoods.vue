<template>
  <div>
    <!-- <drawer ref="filterDrawer">
      <template v-slot:defult>
        <el-form-item label="商品名称:" class="hidden-sm-and-down">
          <el-input v-model="form.search_name" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit">查询<i class="el-icon-search el-icon--right" /></el-button>
          <el-button type="warning" plain @click="toQuery(1)">重置<i class="el-icon-refresh el-icon--right" /></el-button>
          <el-button type="primary" plain @click="outTab('list_table', '代理记录')">导出<i class="el-icon-male el-icon--right" /></el-button>
        </el-form-item>
      </template>
    </drawer> -->

    <div class="p-5">
      <div class="bg-white">
        <el-table id="list_table" ref="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading"
          stripe highlight-current-row :max-height="tableMaxH">
          <el-table-column label="设备sn">
            <template slot-scope="scope">
              {{ scope.row.goods_sn }}
            </template>
          </el-table-column>
          <el-table-column label="商户名称">
            <template slot-scope="scope">
              {{ scope.row.store_name }}
            </template>
          </el-table-column>
          <el-table-column label="补货前已售">
            <template slot-scope="scope">
              {{ scope.row.eject_num_cang }}
            </template>
          </el-table-column>
          <el-table-column label="此次补货">
            <template slot-scope="scope">
              {{ scope.row.stock_num_cang - scope.row.eject_num_cang }}
            </template>
          </el-table-column>
          <el-table-column label="补货时间">
            <template slot-scope="scope">
              {{ parseTime(scope.row.add_date, '{y}-{m}-{d} {h}:{i}') }}
            </template>
          </el-table-column>
          <el-table-column label="补货人">
            <template slot-scope="scope">
              {{ scope.row.name }}
            </template>
          </el-table-column>
        </el-table>
        <div class="flex justify-center">
          <pagination v-show="listQuery.page_num > 0" :page.sync="listQuery.start" :limit.sync="listQuery.limit"
            :page-count="listQuery.page_num" @pagination="getList" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import drawer from '@/components/filterDrawer/filter'
  export default {
    name: 'plusGoods',
    components: {
      Pagination,
      drawer
    },
    data() {
      return {
        form: {},
        tableMaxH: '250',
        list: [],
        listLoading: true,
        listQuery: {
          start: 1,
          limit: 20,
          page_num: 1,
          replenish_aid: this.$route.query.son_id || ''
        }
      }
    },
    computed: {
      siteInfo() {
        return this.$store.getters.siteInfo
      }
    },
    mounted() {
      this.toQuery(1)
    },
    methods: {
      /**
       * 搜索查询
       */
      toQuery(type = 0) {
        // this.$refs.filterDrawer.hide()
        if (type == 1) this.form = {}
        this.listQuery.start = 1
        this.getList()
      },

      getList() {
        let url = 'agentapi/product/replenish_records'
        let listQuery = Object.assign(this.form, this.listQuery, {
          start: this.listQuery.start - 1
        })
        this.$get(url, listQuery).then(res => {
          this.listLoading = false
          this.list = res.list
          this.listQuery.page_num = res.page_num
          if(listQuery.start == 0) this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 80
        }).catch(() => {
          this.listLoading = false
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
