<template>
  <div>
    <drawer ref="filterDrawer">
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
    </drawer>

    <div class="p-5">
      <div class="bg-white">
        <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading"
          stripe highlight-current-row :max-height="tableMaxH">
          <el-table-column label="图片" width="120">
            <template slot-scope="scope">
              <el-avatar shape="square" :size="60" :src="scope.row.img_url" fit="fill" icon="el-icon-picture-outline"></el-avatar>
            </template>
          </el-table-column>
          <el-table-column label="商品标题" width="250">
            <template slot-scope="scope">
              {{ scope.row.product_name }}
            </template>
          </el-table-column>
          <el-table-column label="副标题">
            <template slot-scope="scope">
              {{ scope.row.product_title }}
            </template>
          </el-table-column>
          <el-table-column label="成本价" width="120">
            <template slot-scope="scope">
              {{ scope.row.cost_price }}
            </template>
          </el-table-column>
          <el-table-column label="零售价" width="120">
            <template slot-scope="scope">
              {{ scope.row.market_price }}
            </template>
          </el-table-column>
          <el-table-column label="库存" width="120">
            <template slot-scope="scope">
              {{ scope.row.stock_count }}
            </template>
          </el-table-column>
          <el-table-column label="已售" width="120">
            <template slot-scope="scope">
              {{ scope.row.fact_sold_count }}
            </template>
          </el-table-column>
          <el-table-column label="状态" width="120">
            <template slot-scope="scope">
              <el-link :type="scope.row.status == 0 ? 'danger' : 'primary'"> {{ scope.row.status == 0 ? '已下架' : '已上架' }}</el-link>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="360">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" round plain class="ml-0" @click="$router.push({path: `/condom/goodsEdit?id=${scope.row.id}`})">编辑商品</el-button>
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
    name: 'agent',
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
          page_num: 1
        }
      }
    },
    beforeRouteEnter(to, from, next) {
      if (from.name == "agentEdit") {
        to.meta.isBack = true
      } else {
        to.meta.isBack = false
      }
      next()
    },
    activated() {
      if (!this.$route.meta.isBack || !this.list) {
        this.toQuery(1)
      }
    },
    computed: {
      siteInfo() {
        return this.$store.getters.siteInfo
      }
    },
    mounted() {

    },
    methods: {
      /**
       * 搜索查询
       */
      toQuery(type = 0) {
        this.$refs.filterDrawer.hide()
        if (type == 1) this.form = {}
        this.listQuery.page = 1
        this.getList()
      },

      getList() {
        let url = 'agentapi/product/sample_list'
        let listQuery = Object.assign(this.form, this.listQuery, {
          start: this.listQuery.page - 1
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
