<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:defult>
        <el-form-item label="商品状态">
          <el-select v-model="form.status" placeholder="商品状态" @change="toQuery()">
            <el-option label="全部" value="" />
            <el-option label="上架" value="ENABLE" />
            <el-option label="下架" value="CLOSE" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品名称">
          <el-input v-model="form.title" placeholder="商品名称" />
        </el-form-item>
      </template>
      <template v-slot:endButton>
        <el-button type="primary" size="small" @click="$router.push({path: `/goods/addGoods`})">添加商品</el-button>
      </template>
    </condition>

    <div class="pl-15 pr-15 pb-5 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading"
        highlight-current-row :max-height="tableMaxH">
        <el-table-column label="图片" width="120">
          <template slot-scope="scope">
            <el-avatar shape="square" :size="60" :src="scope.row.picture" fit="fill" icon="el-icon-picture-outline"></el-avatar>
          </template>
        </el-table-column>
        <el-table-column label="商品标题" width="250">
          <template slot-scope="scope">
            {{ scope.row.title }}
          </template>
        </el-table-column>
        <el-table-column label="副标题">
          <template slot-scope="scope">
            {{ scope.row.subhead }}
          </template>
        </el-table-column>
        <el-table-column label="成本价" width="120">
          <template slot-scope="scope">
            {{ scope.row.costPrice }}
          </template>
        </el-table-column>
        <el-table-column label="零售价" width="120">
          <template slot-scope="scope">
            {{ scope.row.retailPrice }}
          </template>
        </el-table-column>
        <el-table-column label="库存" width="120">
          <template slot-scope="scope">
            {{ scope.row.stock }}
          </template>
        </el-table-column>
        <el-table-column label="已售" width="120">
          <template slot-scope="scope">
            {{ scope.row.saleNum }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template slot-scope="scope">
            <el-link :type="scope.row.status == 'CLOSE' ? 'danger' : 'primary'"> {{ scope.row.statusName }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" class="ml-0" @click="$router.push({path: `/goods/addGoods?id=${scope.row.id}`})">编辑商品</el-button>
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
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import condition from '@/components/condition/'
  export default {
    name: 'condomGoods',
    components: {
      Pagination,
      condition
    },
    data() {
      return {
        clickSubmit: false,
        tableMaxH: '250',
        list: [],
        listLoading: false,
        listTotal: 0,
        listQuery: {},
        form: {}
      }
    },
    beforeRouteEnter(to, from, next) {
      if (from.name == 'addGoods') {
        to.meta.isBack = true
      } else {
        to.meta.isBack = false
      }
      next()
    },
    activated() {
      if (this.$route.meta.isBack || this.list.length == 0) {
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

      getList() {
        let params = Object.assign({}, this.form, this.listQuery, {
          page: this.listQuery.page - 1
        })
        this.$get('iot-saas-device/admin/merchandise/findPage', params).then(res => {
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
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
