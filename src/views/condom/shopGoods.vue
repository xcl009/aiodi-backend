<template>
  <div class="p-5">
    <div class="pl-20 pr-20 pb-10 bg-white">
      <el-button class="mb-20 mt-20" type="success" @click="save_plan.push({
        img_url: '',
        product_name: '',
        product_id: '',
        cost_price: '',
        market_price: ''
      })">添加仓口</el-button>
      <el-form ref="form" label-width="auto">
        <el-table
          :data="save_plan"
          border
          style="width: 100%">
          <el-table-column
            label="仓口" width="150">
            <template slot-scope="scope">
              {{ scope.$index + 1}}
            </template>
          </el-table-column>
          <el-table-column label="选择商品">
            <template slot-scope="scope">
              <div class="flex align-center">
                <el-avatar shape="square" :size="50" :src="scope.row.img_url" fit="fill" icon="el-icon-picture-outline"  v-if="scope.row.img_url"></el-avatar>
                <div class="pl-10 pr-10 flex1">{{ scope.row.product_name }}</div>
                <el-button size="mini" type="primary" round @click="selCang = scope.row; selGoodsDialog = true">选择商品</el-button>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="成本价" width="200">
            <template slot-scope="scope">
              <el-input v-model="scope.row.cost_price" placeholder="成本价" disabled>
                <template slot="append">元</template>
              </el-input>
            </template>
          </el-table-column>

          <el-table-column label="零售价" width="200">
            <template slot-scope="scope">
              <el-input v-model="scope.row.market_price" placeholder="零售价">
                <template slot="append">元</template>
              </el-input>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="100">
            <template slot-scope="scope">
              <el-button size="mini" type="danger" round @click="save_plan.splice(scope.$index, 1)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-form-item class="mt-30">
          <el-button type="primary" @click="onSubmit">立即提交</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-dialog title="选择商品" :visible.sync="selGoodsDialog" body-style="padding: 0">
      <el-table class="ptd-5" :data="goodsList" border>
        <el-table-column label="图片" width="80">
          <template slot-scope="scope">
            <el-avatar shape="square" :size="50" :src="scope.row.img_url" fit="fill" icon="el-icon-picture-outline"></el-avatar>
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
        <el-table-column label="价格">
          <template slot-scope="scope">
            <div>成本价：{{ scope.row.cost_price }}</div>
            <div>零售价：{{ scope.row.market_price }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" round @click="selGoods(scope.row)">选择此商品</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt-10 flex justify-center">
        <pagination v-show="listQuery.page_num > 0" :page.sync="listQuery.start" :limit.sync="listQuery.limit"
          :page-count="listQuery.page_num" @pagination="getGoods" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  export default {
    components: {
      Pagination
    },
    props: {
      type: {
        type: Number,
        default: 1
      }
    },
    data() {
      return {
        id: this.$route.params.id,
        save_plan: [],

        selCang: {},
        selGoodsDialog: false,
        goodsList: [],
        form: {},
        listQuery: {
          start: 1,
          limit: 20,
          page_num: 1
        },
      }
    },
    computed: {
      myDeviceName() {
        return this.$store.getters.myDeviceName
      }
    },
    mounted() {
      if(this.type == 2){
        this.getShop()
      }else{
        this.getInfo()
      }
      this.getGoods()
    },
    methods: {
      /**
       * 选择商品
       * @param {Object} row
       */
      selGoods(row){
        this.selCang.product_name = row.product_name
        this.selCang.img_url = row.img_url
        this.selCang.product_id = row.id
        this.selCang.cost_price = row.cost_price
        this.selCang.market_price = row.market_price
        this.selGoodsDialog = false
      },

      /**
       * 获取商户信息
       */
      getShop(){
        this.$get('agentapi/store/merchant_store_detail').then(res => {
          this.id = res.store_id
          this.getInfo()
        })
      },

      /**
       * 获取信息
       */
      getInfo() {
        this.$get('agentapi/product/get_business_samples', {
          store_id: this.id
        }).then(res => {
          this.save_plan = res.list ? Object.values(res.list) : []
        })
      },

      /**
       * 搜索查询
       */
      toQuery(type = 0) {
        this.$refs.filterDrawer.hide()
        if (type == 1) this.form = {}
        this.listQuery.start = 1
        this.getList()
      },

      /**
       * 获取商品
       */
      getGoods() {
        let url = 'agentapi/product/sample_list'
        let listQuery = Object.assign(this.form, this.listQuery, {
          start: this.listQuery.start - 1
        })
        this.$get(url, listQuery).then(res => {
          this.listLoading = false
          this.goodsList = res.list
          this.listQuery.page_num = res.page_num
        }).catch(() => {
          this.listLoading = false
        })
      },

      onSubmit() {
        let params = {}
        params.plan = this.save_plan
        params.store_id = this.id
        console.log(params)
        this.$post('agentapi/product/save_business_samples', params).then(res => {
          this.$message({
            message: '提交成功',
            type: 'success'
          })
        })
      }
    }
  }
</script>

<style scoped lang="scss">
  /deep/ .el-dialog__body{
    padding: 10px;
  }
</style>
