<template>
  <div>
    <div class="p-20 bg-white">
      <div class="fs-c1 text-black">可提现金额</div>
      <div class="mt-10 mb-10 cursor">
        <span class="text-primary khcoin">￥{{ money.balance || 0.00 }}</span>
      </div>
      <div v-if="!isBrand()">
        <el-button type="primary" size="small" class="fs-s3" @click="$router.push({path: `/money/cash`})">去提现</el-button>
      </div>
    </div>

    <div class="pt-10 pl-10 pr-10 bg-white">
      <div class="mt-10 pb-10 pl-10 fs-c1 text-black">收支概况</div>
    </div>
    <div class="pt-10 pl-20 pr-20 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
        :max-height="tableMaxH" element-loading-text="Loading">
        <el-table-column label="名称">
          <template slot-scope="scope">
            {{ scope.row.tradeName}}
          </template>
        </el-table-column>
        <el-table-column label="时间">
          <template slot-scope="scope">
            <span>{{ scope.row.tradeTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="金额">
          <template slot-scope="scope">
            <el-link :type="scope.row.amount > 0 ? 'primary' : 'danger'">{{ scope.row.amount || "0.00" }}</el-link>
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
    name: 'income',
    components: {
      Pagination,
      condition
    },
    computed: {
      agentInfo() {
        return this.$store.getters.agentInfo
      }
    },
    data() {
      return {
        money: {},
        clickSubmit: false,
        form: {},
        tableMaxH: '250',
        list: [],
        listLoading: false,
        listTotal: 0,
        listQuery: {
          page: 1,
          size: 20
        }
      }
    },
    mounted(options) {
      if(this.isStore()){
        this.getMyStore()
      }else{
        this.getBalance()
      }
      this.toQuery()
    },
    methods: {
      /**
       * 获取我的商户
       */
      getMyStore(){
      	let url = 'iot-saas-basic/admin/store/findMyStore'
      	this.$get(url).then(res => {
      		this.cutStoreId = Object.values(res)[0].id
          this.getBalance()
      	})
      },

      /**
       * 获取可提现金额
       */
      getBalance(){
        let params = {}
        if(this.cutStoreId) params.storeId = this.cutStoreId
        this.$get('iot-saas-pay/api/pay/withdraw/balance', params).then(res => {
          this.money = res || {}
        })
      },

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
        if (this.clickSubmit) return
        this.clickSubmit = true
        this.form = {}
        this.listQuery.page = 1
        this.listQuery.size = 20
        this.getList()
      },

      /**
       * 获取列表
       */
      getList() {
        var params = Object.assign({}, this.form, this.listQuery, {
          page: this.listQuery.page - 1,
          queryType: 'all',
          capitalType: 'RMB'
        })
        this.$get('iot-saas-pay/api/pay/tradeLog/list', params).then(res => {
          this.list = res.rows
          this.listLoading = false
          this.clickSubmit = false
          if (params.page == 0) {
            this.listTotal = res.total
            this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 120
          }
        }).catch(() => {
          this.clickSubmit = false
          this.listLoading = false
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  .khcoin{
    font-size: 36px;
  }
</style>
