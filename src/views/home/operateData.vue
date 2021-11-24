<template>
  <div class="p-5">
    <el-tabs class="mb-0 bg-white" type="card" v-model="listQuery.sel_agent_level" @tab-click="selDataType">
      <el-tab-pane label="全部" name="0" ></el-tab-pane>
      <el-tab-pane :label="item" :name="key" v-if="agentInfo.agent_level < key" v-for="(item, key) in give_role"></el-tab-pane>
    </el-tabs>
    <div class="bg-white">
      <!-- <div class="mb-10 flex align-center ">
        <div class="flex1"></div>
        <el-button size="small" type="primary" plain @click="outTab('operate_data')">导出<i class="el-icon-male el-icon--right"></i></el-button>
      </div> -->
      <el-table id="list_table" ref="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading" stripe highlight-current-row :max-height="tableMaxH">
        <el-table-column label="名称">
          <template slot-scope="scope">
            {{ scope.row.name ? scope.row.name : scope.row.nick_name }}
          </template>
        </el-table-column>
        <el-table-column label="角色">
          <template slot-scope="scope">
            {{ give_role[scope.row.role_id] }}
          </template>
        </el-table-column>
        <!-- <el-table-column label="运营区域">
          <template slot-scope="scope">
            <div>{{ scope.row.charge_province }}{{ scope.row.charge_city ? '，' + scope.row.charge_city : '' }}{{ scope.row.charge_county ? '，' + scope.row.charge_county : '' }}</div>
          </template>
        </el-table-column> -->
        <el-table-column label="总交易额">
          <template slot-scope="scope">
            {{ scope.row.order_total_amount || 0}}
          </template>
        </el-table-column>
        <el-table-column label="本月交易额">
          <template slot-scope="scope">
            {{ scope.row.order_month_amount || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="昨日交易额">
         <template slot-scope="scope">
           {{ scope.row.order_yesterday_amount || 0 }}
         </template>
        </el-table-column>
        <el-table-column label="今日交易额">
          <template slot-scope="scope">
            {{ scope.row.order_today_amount || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="总订单数">
          <template slot-scope="scope">
            {{ scope.row.order_total_num || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="本月订单数">
          <template slot-scope="scope">
            {{ scope.row.order_month_num || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="昨日订单数">
          <template slot-scope="scope">
            {{ scope.row.order_yesterday_num || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="今日订单数">
          <template slot-scope="scope">
            {{ scope.row.order_today_num || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="总商户">
          <template slot-scope="scope">
            {{ scope.row.store_num || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="已铺货底座">
          <template slot-scope="scope">
            {{ scope.row.all_zuo_num || 0 }}
          </template>
        </el-table-column>
        <!-- <el-table-column label="已铺货底座">
          <template slot-scope="scope">
            {{ scope.row.devoted_zuo_num }}
          </template>
        </el-table-column> -->
      </el-table>
      <div class="flex justify-center">
        <pagination :page.sync="listQuery.start" :limit.sync="listQuery.limit" :total="listQuery.count" @pagination="getList" />
      </div>
    </div>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  export default {
    name: 'operateData',
    components: {
      Pagination
    },
    data() {
      return {
        give_role: {},
        tableMaxH: '250',
        list: [],
        listLoading: true,
        listQuery: {
          sel_agent_level: this.$route.query.l || 0,
          start: 1,
          limit: 20,
          count: 10
        }
      }
    },
    computed: {
      agentInfo(){
        return this.$store.getters.agentInfo
      }
    },
    mounted(options) {
      this.getPower()
      this.getList()
    },
    methods: {
      /**
         * 获取权限
         */
      getPower() {
        let give_role = { 5: '商户'}
        this.$get('agentapi/add_agent').then(ares => {
          for (var i in ares.give_role_right) {
            let role_i = ares.give_role_right[i]
            give_role[role_i.role_id] = role_i.role_name
          }
          this.give_role = give_role
        })
      },

      /**
       * 运营数据类型筛选
       * @param {Object} val
       */
      selDataType(tab) {
        this.listQuery.sel_agent_level = tab.name
        this.listQuery.start = 1
        this.getList()
      },

      getList() {
        let listQuery = Object.assign({}, this.listQuery, {
          start: this.listQuery.start - 1
        })
        this.$get('SyStatistics/getTotalBusinessData', listQuery).then(res => { //agentapi/my_total_business_data
          this.listLoading = false
          this.list = res.list
          this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 80
          this.listQuery.count = res.count
        }).catch(() => {
          this.listLoading = false
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
