<template>
  <div>
    <drawer ref="filterDrawer" :filter_form="false">
      <template v-slot:tabs>
        <el-tabs class="bg-white" v-model="listQuery.search_user_type" @tab-click="toQuery()">
          <el-tab-pane label="我的" :name="0" />
          <el-tab-pane label="下级" :name="1" />
        </el-tabs>
      </template>
    </drawer>

    <div class="p-5">
      <div class="bg-white">
        <el-table
          id="equip_table"
          ref="equip_table"
          v-loading="listLoading"
          :data="list"
          element-loading-text="Loading"
          stripe
          highlight-current-row
          :max-height="tableMaxH"
        >
          <el-table-column label="订单号" width="115">
            <template slot-scope="scope">
            <div class="dnone">【AGENT：{{ scope.row.agent_id}}】【APPID：{{ scope.row.appid }}】</div>
            {{ scope.row.order_sn }}
            </template>
          </el-table-column>
          <el-table-column label="交易单号" width="142">
            <template slot-scope="scope">
            {{ scope.row.transaction_id }}
            </template>
          </el-table-column>
          <el-table-column label="商户名称">
            <template slot-scope="scope">
              {{ scope.row.store_name }}
            </template>
          </el-table-column>
          <el-table-column label="下单时间">
            <template slot-scope="scope">
              {{ parseTime(scope.row.add_date, '{y}-{m}-{d} {h}:{i}:{s}') }}
            </template>
          </el-table-column>
          <el-table-column label="设备名称">
            <template slot-scope="scope">
              {{ scope.row.goods_name }}
            </template>
          </el-table-column>
          <el-table-column label="设备编号">
            <template slot-scope="scope">
              {{ scope.row.goods_sn }}
            </template>
          </el-table-column>
          <el-table-column label="成本价(元)">
            <template slot-scope="scope">
              {{ scope.row.cost_price }}
            </template>
          </el-table-column>
          <el-table-column label="售价(元)">
            <template slot-scope="scope">
              {{ scope.row.market_price }}
            </template>
          </el-table-column>
          <el-table-column label="用户">
            <template slot-scope="scope">
              <div class="flex align-center">
                <el-avatar class="mr-5" :size="25" :src="scope.row.user_avatar" />
                <div class="flex1">
                  <div v-if="config.system_other.order_amount_show || checkRoles(config.system_other.have_role)">
                    {{ scope.row.user_mobile }}
                  </div>
                  <div v-else="config.system_other.order_amount_show">{{ dealPhone(scope.row.user_mobile) }}</div>
                  <div class="text-cut">{{ scope.row.user_nick_name || "--" }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="110" :fixed="device == 'desktop' ? 'right' : false">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" plain round @click="getOrderDetail(scope.row)" class="ml-10">订单详情</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="flex justify-center">
          <pagination
            v-show="listQuery.page_num > 0"
            :page.sync="listQuery.start"
            :page-count="listQuery.page_num"
            :limit.sync="listQuery.limit"
            @pagination="getList"
          />
        </div>
      </div>
    </div>

    <el-dialog title="订单详情" :visible.sync="detailDialog">
      <template v-if="siteInfo.order_profits_detail_show == 1 || checkRoles(config.system_other.have_role)">
        <div class="mt-10 mb-15 text-center">分成明细：{{ order.profit_yuan }}</div>
        <div class="flex mb-10 text-center">
          <div class="flex1">分成人</div>
          <div class="flex1">分成比例</div>
          <div class="flex1">分成金额</div>
          <div class="flex1">退款金额</div>
        </div>
        <template v-for="item in order.agents_profit">
          <div class="flex mb-10 text-center" v-if="item.agent_level >= agentInfo.agent_level">
            <div class="flex1">{{ item.agent_name }}：{{ item.parent_name }}</div>
            <div class="flex1">{{ item.profit_percent }}</div>
            <div class="flex1">{{ item.get_profit }}元</div>
            <div class="flex1">{{ item.drawback_profit }}元</div>
          </div>
        </template>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import drawer from '@/components/filterDrawer/filter'
export default {
  name: 'deviceOrder',
  components: {
    Pagination,
    drawer
  },
  data() {
    return {
      form: {

      },
      tableMaxH: '250',
      list: [],
      listLoading: true,
      listQuery: {
        page_num: 1,
        limit: 20,
        search_user_type: 0
      },
      // 订单详情
      order: {},
      detailDialog: false,
    }
  },
  computed: {
    agentInfo() {
      return this.$store.getters.agentInfo
    },

    device() {
      return this.$store.state.app.device
    },

    siteInfo() {
      return this.$store.getters.siteInfo
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    /**
     * 搜索查询
     */
    toQuery(type = 0) {
      if (type == 1) {
        this.form = {}
        this.listQuery.start = 1
      } else {
        this.listQuery.start = 1
      }
      this.getList()
    },

    /**
     * 获取列表数据
     */
    getList() {
      const listQuery = Object.assign({}, this.listQuery, this.form, {
        start: this.listQuery.start - 1
      })
      this.$get('agentapi/goods/query_orders', listQuery).then(res => {
        this.listLoading = false
        this.list = res.list
        this.listQuery.page_num = res.page_num
        if(listQuery.start == 0) this.tableMaxH = window.innerHeight - this.$refs.equip_table.$el.offsetTop - 85
      }).catch(() => {
        this.listLoading = false
      })
    },

    /**
     * 查询订单详情
     */
    getOrderDetail(row) {
      this.$get('wxapi/cart/order_detail', {
        buy_id: row.id
      }).then(res => {
        this.order = res
        this.detailDialog = true
      })
    },
  }
}
</script>

<style lang="scss" scoped></style>
