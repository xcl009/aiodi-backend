<template>
  <div>
    <drawer>
      <div class="pl-10 pt-10 pr-10 bg-white l-t shadow-light">
        <el-form ref="form" class="filter-from" :model="form" :inline="true" size="small">
          <div class="el-form-item--small">
            <label class="mb-10 el-form-item__label" style="float: none;" v-if="!checkRoles(['salesman', 'merchants'])">用户类别：</label>
            <el-radio-group class="mr-30" v-model="listQuery.search_user_type" size="medium" @change="toQuery(2)" v-if="!checkRoles(['salesman', 'merchants'])">
              <el-radio class="mb-10" :label="0">本人</el-radio>
              <el-radio class="mb-10" :label="1">下级</el-radio>
            </el-radio-group>
            <label class="mb-10 el-form-item__label" style="float: none;">设备类别：</label>
            <el-radio-group v-model="listQuery.search_goods_type" size="medium" @change="toQuery(2)">
              <el-radio class="mb-10" v-for="(item, index) in deviceNameObj" :label="item">{{ index }}</el-radio>
            </el-radio-group>
          </div>
          <!-- <el-form-item>
            <el-button type="primary" @click="toQuery()">查询<i class="el-icon-search el-icon--right" /></el-button>
            <el-button type="warning" plain @click="toQuery(1)">重置<i class="el-icon-refresh el-icon--right" /></el-button>
            <el-button type="primary" plain @click="outTab('equip_table', '设备记录')">导出<i class="el-icon-male el-icon--right" /></el-button>
          </el-form-item> -->
        </el-form>
      </div>
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
          @sort-change="sortChange"
        >
          <el-table-column label="设备码">
            <template slot-scope="scope">
              {{ scope.row.goods_sn || '--' }}<br>
              {{ scope.row.device_id || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="归属代理">
            <template slot-scope="scope">
              {{ scope.row.manage_agent_name || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="商户名称">
            <template slot-scope="scope">
              {{ scope.row.store_name }}
            </template>
          </el-table-column>
          <el-table-column label="分成比例">
            <template slot-scope="scope">
              {{ scope.row.my_take_divide_percnet }}
            </template>
          </el-table-column>
          <el-table-column label="总交易额" sortable="custom" prop="1" v-if="agentInfo.business_type != 1">
            <template slot-scope="scope">
              {{ scope.row.order_total_amount }}
            </template>
          </el-table-column>
          <el-table-column label="今日交易额" v-if="agentInfo.business_type != 1">
            <template slot-scope="scope">
              {{ scope.row.order_today_amount }}
            </template>
          </el-table-column>
          <el-table-column label="昨日交易额" v-if="agentInfo.business_type != 1">
            <template slot-scope="scope">
              {{ scope.row.order_yesterday_amount }}
            </template>
          </el-table-column>
          <el-table-column label="总订单数" sortable="custom" prop="2">
            <template slot-scope="scope">
              {{ scope.row.order_total_num }}
            </template>
          </el-table-column>
          <el-table-column label="今日订单">
            <template slot-scope="scope">
              {{ scope.row.order_today_num }}
            </template>
          </el-table-column>
          <el-table-column label="昨日订单">
            <template slot-scope="scope">
              {{ scope.row.order_yesterday_num }}
            </template>
          </el-table-column>
          <el-table-column label="客单价" sortable="custom" prop="3" v-if="agentInfo.business_type != 1">
            <template slot-scope="scope">
              {{ scope.row.order_customer_price }}
            </template>
          </el-table-column>
          <el-table-column label="总盈利" v-if="agentInfo.business_type != 1">
            <template slot-scope="scope">
              {{ scope.row.order_total_profit }}
            </template>
          </el-table-column>
          <el-table-column label="今日盈利" v-if="agentInfo.business_type != 1">
            <template slot-scope="scope">
              {{ scope.row.order_today_profit }}
            </template>
          </el-table-column>
          <el-table-column label="昨日盈利" v-if="agentInfo.business_type != 1">
            <template slot-scope="scope">
              {{ scope.row.order_yesterday_profit }}
            </template>
          </el-table-column>
          <el-table-column label="盈利率" sortable="custom" prop="4" v-if="agentInfo.business_type != 1">
            <template slot-scope="scope">
              {{ scope.row.order_total_profit_rate }}%
            </template>
          </el-table-column>
          <el-table-column label="交易额日增长率" v-if="agentInfo.business_type != 1">
            <template slot-scope="scope">
              {{ scope.row.nowat_zuo_sn }}
            </template>
          </el-table-column>
          <el-table-column label="投放天数">
            <template slot-scope="scope">
              {{ scope.row.operated_days }}
            </template>
          </el-table-column>
          <el-table-column label="是否回本" v-if="agentInfo.business_type != 1">
            <template slot-scope="scope">
              {{ scope.row.is_cost_recovery == 1 ? '已回本' : '未回本' }}
            </template>
          </el-table-column>
          <el-table-column label="回本周期" v-if="agentInfo.business_type != 1">
            <template slot-scope="scope">
              {{ scope.row.cost_recovery_date }}
            </template>
          </el-table-column>
          <el-table-column label="今日表现">
            <template slot-scope="scope">
              {{ scope.row.today_business_status_desc }}
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
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import drawer from '@/components/filterDrawer'
export default {
  name: 'BindEquip',
  components: {
    Pagination,
    drawer
  },
  data() {
    return {
      nowTime: Date.parse(new Date()) / 1000,
      form: {

      },
      tableMaxH: '250',
      list: [],
      listLoading: true,
      listQuery: {
        search_goods_type: 0,
        search_user_type: 0,
        page_num: 1
      }
    }
  },
  computed: {
    deviceNameObj(){
      return this.$store.state.user.deviceNameObj
    },
    agentInfo(){
      return this.$store.state.user.agentInfo
    },
  },
  mounted() {
    for(var i in this.deviceNameObj){
      this.listQuery.search_goods_type = this.deviceNameObj[i]
      break
    }
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

    getList() {
      const listQuery = Object.assign({}, this.listQuery, this.form, {
        start: this.listQuery.start - 1
      })
      if(this.sort_id_key && window.sort_id_key) listQuery.sort_id_key= window.sort_id_key
      this.$get('agentapi/statistics/business_device_data', listQuery).then(res => {
        this.listLoading = false
        this.list = res.list
        this.listQuery.page_num = res.page_num
        if(listQuery.start == 0) this.tableMaxH = window.innerHeight - this.$refs.equip_table.$el.offsetTop - 85
      }).catch(() => {
        this.listLoading = false
      })
    },

    sortChange( column ){
      if(column.order){
        this.listQuery.sort_field_key = column.prop
        this.listQuery.sort_order = column.order == 'ascending' ? 0 : 1
      } else {
        delete this.listQuery.stype
        delete this.listQuery.sort_order
      }
      this.toQuery()
    }
  }
}
</script>

<style lang="scss" scoped></style>
