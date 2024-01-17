<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:defult>
        <el-form-item :label="$t('goods.productStatus')">
          <el-select v-model="form.status" :label="$t('goods.productStatus')" @change="toQuery()">
            <el-option :label="$t('public.all')" value="" />
            <el-option :label="$t('public.grounding')" value="ENABLE" />
            <el-option :label="$t('public.offShelf')" value="CLOSE" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('shopping.productName')">
          <el-input v-model="form.title" :placeholder="$t('shopping.productName')" />
        </el-form-item>
      </template>
      <template v-slot:endButton>
        <el-button type="primary" size="small" @click="$router.push({ path: `/goods/addGoods` })">{{ $t('system.addGoods')
        }}</el-button>
      </template>
    </condition>

    <div class="pl-15 pr-15 pb-5 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
        element-loading-text="Loading" highlight-current-row :max-height="tableMaxH">
        <el-table-column :label="$('public.image')" width="120">
          <template slot-scope="scope">
            <el-avatar shape="square" :size="60" :src="scope.row.picture" fit="fill"
              icon="el-icon-picture-outline"></el-avatar>
          </template>
        </el-table-column>
        <el-table-column :label="$('goods.productTitle')" width="250">
          <template slot-scope="scope">
            {{ scope.row.title }}
          </template>
        </el-table-column>
        <el-table-column :label="$('goods.subtitle')">
          <template slot-scope="scope">
            {{ scope.row.subhead }}
          </template>
        </el-table-column>
        <el-table-column :label="$('goods.costPrice')" width="120">
          <template slot-scope="scope">
            {{ scope.row.costPrice }}
          </template>
        </el-table-column>
        <el-table-column :label="$('goods.retailPrice')" width="120">
          <template slot-scope="scope">
            {{ scope.row.retailPrice }}
          </template>
        </el-table-column>
        <el-table-column :label="$('public.inventory')" width="120">
          <template slot-scope="scope">
            {{ scope.row.stock }}
          </template>
        </el-table-column>
        <el-table-column :label="$('goods.saleNum')" width="120">
          <template slot-scope="scope">
            {{ scope.row.saleNum }}
          </template>
        </el-table-column>
        <el-table-column :label="$('public.status')" width="120">
          <template slot-scope="scope">
            <el-link :type="scope.row.status == 'CLOSE' ? 'danger' : 'primary'"> {{ scope.row.statusName }}</el-link>
          </template>
        </el-table-column>
        <el-table-column :label="$('public.operate')" width="120">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" class="ml-0"
              @click="$router.push({ path: `/goods/addGoods?id=${scope.row.id}` })">{{ $('goods.editShopping')
              }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-center">
        <pagination v-show="listTotal > 0" :page.sync="listQuery.page" :limit.sync="listQuery.size"
          :total="parseInt(listTotal)" @pagination="getList" />
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
      if (this.clickSubmit) return
      this.clickSubmit = true
      this.listQuery.page = 1
      this.listQuery.size = 20
      this.getList()
    },

    /**
     * 重置查询
     */
    reset() {
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
        if (params.page == 0) {
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

<style lang="scss" scoped></style>
