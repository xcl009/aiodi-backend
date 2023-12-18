<template>
  <div>
    <div class="p-20 bg-white">
      <div class="fs-c1 text-black">{{ $t('moeny.khbNum') }}</div>
      <div class="mt-10 mb-10 cursor">
        <span class="text-primary khcoin">{{ money.happyCurrencyNum || 0 }}</span>
        <span class="ml-10 fs-s3 text-gray" @click="khyCoinIntroDialog = true">{{ $t('moeny.whyKhb') }}</span>
      </div>
      <div>
        <el-button type="primary" size="small" class="fs-s3" @click="$refs.rechargeCoin.show()">{{ $t('public.recharge')
        }}</el-button>
      </div>
    </div>

    <div class="pt-10 pl-10 pr-10 bg-white">
      <div class="mt-10 pb-10 pl-10 fs-c1 text-black">{{ $t('moeny.overview') }}</div>
    </div>

    <div class="pt-10 pl-20 pr-20 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
        :max-height="tableMaxH" element-loading-text="Loading">
        <el-table-column :label="$t('public.name')">
          <template slot-scope="scope">
            {{ scope.row.tradeName }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.time')">
          <template slot-scope="scope">
            <span>{{ scope.row.tradeTime }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('payType.khb')">
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

    <el-dialog :visible.sync="khyCoinIntroDialog" width="600px">
      <div class="fs-c1 text-black" slot="title">
        {{ $t('payType.khb') }}
      </div>
      <div class="renewal-box">
        <div class="mb-20 flex">
          <div class="fs-c1">1、</div>
          <div>
            <div class="mb-10 text-black">{{ $t('moeny.khbWhy') }}</div>
            <div>{{ $t('moeny.khbWhyText') }}</div>
          </div>
        </div>
        <div class="mb-20 flex">
          <div class="fs-c1">2、</div>
          <div>
            <div class="mb-10 text-black">{{ $t('moeny.khbHowToAarn') }}</div>
            <div>{{ $t('moeny.khbHowToAarnText') }}</div>
          </div>
        </div>
        <div class="mb-20 flex">
          <div class="fs-c1">3、</div>
          <div v-if="checkRoles(['factory'])">
            <div class="mb-10 text-black">{{ $t('moeny.khbHowToUseIt') }}</div>
            <div>{{ $t('moeny.text') }}</div>
          </div>
          <div v-else>
            <div class="mb-10 text-black">{{ $t('moeny.khbHowToUseIt') }}</div>
            <div>{{ $t('moeny.khbHowToUseItText') }}</div>
          </div>
        </div>
        <div>
          <el-button type="primary" @click="khyCoinIntroDialog = false" style="margin-left: 25px;">{{
            $t('moeny.understood') }}</el-button>
        </div>
      </div>
    </el-dialog>

    <recharge-khy-coin ref="rechargeCoin"></recharge-khy-coin>
  </div>
</template>

<script>
import QRCode from 'qrcodejs2'
import Pagination from '@/components/Pagination'
import condition from '@/components/condition/'
import RechargeKhyCoin from '@/components/RechargeKhyCoin/'
export default {
  name: 'income',
  components: {
    Pagination,
    condition,
    RechargeKhyCoin
  },
  computed: {
    agentInfo() {
      return this.$store.getters.agentInfo
    }
  },
  data() {
    return {
      clickSubmit: false,
      form: {},
      tableMaxH: '250',
      list: [],
      listLoading: false,
      listTotal: 0,
      listQuery: {
        page: 1,
        size: 20
      },

      money: {},
      khyCoinIntroDialog: false
    }
  },
  mounted(options) {
    this.getBalance()
    this.toQuery()
  },
  methods: {
    /**
     * 获取可提现金额
     */
    getBalance() {
      let params = {}
      if (this.isStore()) {
        params.storeId = this.agentInfo.storeIds[0]
      }
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
        capitalType: 'KHB'
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
.khcoin {
  font-size: 36px;
}
</style>
