<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:defult>
        <el-form-item label="设备类别:">
          <el-select v-model="form.search_depend_type" @change="toQuery()">
            <el-option label="全部" :value="-1" />
            <el-option :label="index" :value="item"  v-for="(item, index) in myDeviceName" />
          </el-select>
        </el-form-item>
        <el-form-item label="商户名称:">
          <el-input v-model="form.search_store_name" />
        </el-form-item>
        <el-form-item label="设备SN码:">
          <el-input v-model="form.search_goods_sn" />
        </el-form-item>
        <el-form-item label="代理ID:">
          <el-input v-model="form.son_id" />
        </el-form-item>
        <el-form-item label="时间筛选:">
          <div class="flex">
            <el-date-picker
              v-model="form.begin"
              type="datetime"
              placeholder="开始日期"
              value-format="timestamp"
              style="width: 100%;"
              :picker-options="beginOptions"
            />
            <span class="ml-5 mr-5">-</span>
            <el-date-picker
              v-model="form.end"
              type="datetime"
              placeholder="结束日期"
              value-format="timestamp"
              style="width: 100%;"
              :picker-options="endOptions"
            />
          </div>
        </el-form-item>
      </template>
    </condition>

    <div class="p-5">
      <div class="bg-white">
        <div class="p-10 fs-s3">
          <span class="mr-20">总收益：{{ total_profit.all_total_profit || 0.00 }}元</span>
          <span class="mr-20">我的收益：{{ total_profit.my_total_profit || 0.00 }}元</span>
          <span class="mr-20">下级收益：{{ total_profit.son_total_profit || 0.00 }}元</span>
          <span class="mr-20">今日收益：{{ total_profit.my_today_profit || 0.00 }}元</span>
        </div>
        <el-table id="list_table" ref="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading" stripe highlight-current-row :max-height="tableMaxH">
          <el-table-column label="类型">
            <template slot-scope="scope">
              {{ scope.row.change_reason}}
            </template>
          </el-table-column>
          <el-table-column label="来源信息">
            <template slot-scope="scope">
              <div class="flex align-center" v-if="scope.row.relation_type == 0">
                <el-avatar size="small" shape="square" :src="scope.row.store_avatar"></el-avatar>
                <div class="flex1 ml-5">{{ scope.row.store_name }}</div>
              </div>

              <div class="flex align-center" v-if="scope.row.relation_type == 1">
                <el-avatar size="small" :src="scope.row.agent_avatar" ></el-avatar>
                <div class="flex1 ml-5">{{ scope.row.agent_name }}</div>
              </div>

              <div class="flex align-center" v-if="scope.row.relation_type == 2">
                <el-avatar size="small" :src="scope.row.user_avatar"></el-avatar>
                <div class="flex1 ml-5">{{ scope.row.user_nick_name }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="支付时间">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.add_date, '{y}-{m}-{d} {h}:{i}') }}</span>
            </template>
          </el-table-column>
          <el-table-column label="金额">
            <template slot-scope="scope">
              <el-link :href="scope.row.relation_type == 0 ? `/order/detail?order_id=${scope.row.order_id}` : 'javascript:void(0)'" :type="scope.row.change_type == 2 ? 'danger' : 'success'">{{ scope.row.change_type == 1 ? "+" : "-" }}{{ scope.row.change_money || "--" }}</el-link>
            </template>
          </el-table-column>
        </el-table>
        <div class="flex justify-center">
          <pagination
            v-show="listQuery.count > 0"
            :page.sync="listQuery.page"
            :limit.sync="listQuery.size"
            :page-count="listQuery.count"
            @pagination="getList"
          />
        </div>
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
      myDeviceName(){
        return this.$store.state.user.myDeviceName
      },
      agentInfo(){
        return this.$store.state.user.agentInfo
      },
    },
    data() {
      return {
        beginOptions: {
          disabledDate: (time) => {
            if (this.form.end) {
              return time.getTime() > this.form.end || time.getTime() > new Date(new Date().toLocaleDateString()).getTime()
            } else {
              return time.getTime() > new Date(new Date().toLocaleDateString()).getTime()
            }
          }
        },
        endOptions: {
          disabledDate: (time) => {
            if (this.form.begin) {
              return time.getTime() < this.form.begin || time.getTime() > new Date(new Date().toLocaleDateString()).getTime()
            } else {
              return time.getTime() > new Date(new Date().toLocaleDateString()).getTime()
            }
          }
        },
        total_profit: {},
        tableMaxH: '250',
        clickSubmit: false,
        form: {
          son_id: this.$route.query.son_id || ''
        },
        list: [],
        listLoading: false,
        listQuery: {
          search_depend_type: -1,
          page: 1,
          size: 20,
          count: 0
        }
      }
    },
    mounted(options) {
      //this.getList()
    },
    methods: {
      /**
       * 搜索查询
       */
      toQuery() {
        if(this.clickSubmit) return
        this.clickSubmit = true
        this.listQuery.page = 1
        this.listQuery.size = 50
        if (this.xlsxStatus) this.xlsxStatus = false
        this.getList()
      },

      /**
       * 重置查询
       */
      reset(){
        if(this.clickSubmit) return
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
        let params = Object.assign({}, this.form, this.listQuery, {
          start: this.listQuery.start - 1
        }), url = 'agentapi/search/query_profit'
        if (params.son_id > 0) {
          params.search_user_type = 1
        }
        if (params.begin) params.begin = this.parseTime(params.begin, '{y}-{m}-{d}')
        if (params.end) params.end = this.parseTime(params.end, '{y}-{m}-{d}')
        this.$get(url, params).then(res => {
          this.list = res.list
          this.total_profit = {
            all_total_profit: res.all_total_profit,
            my_total_profit: res.my_total_profit,
            son_total_profit: res.son_total_profit,
            my_today_profit: res.my_today_profit,
          }
          this.listQuery.count = res.count
          if(params.page == 0) this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 83
          this.listLoading = false
          this.clickSubmit = false
        }).catch(() => {
          this.listLoading = false
          this.clickSubmit = false
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
