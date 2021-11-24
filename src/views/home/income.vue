<template>
  <div>
    <drawer ref="filterDrawer">
      <template v-slot:defult>
        <el-form-item label="设备类别:">
          <el-select v-model="listQuery.search_depend_type" @change="toQuery()">
            <el-option label="全部" :value="-1" />
            <el-option :label="index" :value="item"  v-for="(item, index) in deviceNameObj" />
          </el-select>
        </el-form-item>
        <el-form-item label="商户名称:">
          <el-input v-model="form.search_store_name" />
        </el-form-item>
        <el-form-item label="设备SN码:">
          <el-input v-model="form.search_goods_sn" />
        </el-form-item>
        <el-form-item label="代理ID:" class="hidden-sm-and-down">
          <el-input v-model="form.son_id" />
        </el-form-item>
        <el-form-item label="时间筛选:" class="hidden-lg-and-down">
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
        <el-form-item>
          <el-button type="primary" native-type="submit">查询<i class="el-icon-search el-icon--right" /></el-button>
          <el-button type="warning" plain @click="toQuery(1)">重置<i class="el-icon-refresh el-icon--right" /></el-button>
          <el-button type="primary" plain @click="outTab('list_table', '收益记录')">导出<i class="el-icon-male el-icon--right" /></el-button>
        </el-form-item>
      </template>
      <template v-slot:more>
        <el-form-item label="代理ID:" class="hidden-md-and-up">
          <el-input v-model="form.son_id" />
        </el-form-item>
        <el-form-item label="时间筛选:" class="hidden-xg-and-up">
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
    </drawer>

    <div class="p-5">
      <div class="bg-white">
        <div class="p-10 fs-s3">
          <span class="mr-20" v-if="agentInfo.business_type != 1">总收益：{{ total_profit.all_total_profit }}元</span>
          <span class="mr-20">我的收益：{{ total_profit.my_total_profit }}元</span>
          <span class="mr-20" v-if="agentInfo.business_type != 1">下级收益：{{ total_profit.son_total_profit }}元</span>
          <span class="mr-20" v-if="agentInfo.business_type != 1">今日收益：{{ total_profit.my_today_profit }}元</span>
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
          <pagination v-show="listQuery.page_num > 0" :page.sync="listQuery.start" :limit.sync="listQuery.limit" :page-count="listQuery.page_num"
  @pagination="getList"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import drawer from '@/components/filterDrawer/filter'
  export default {
    name: 'income',
    components: {
      Pagination,
      drawer
    },
    computed: {
      deviceNameObj(){
        return this.$store.state.user.deviceNameObj
      },
      agentInfo(){
        return this.$store.state.user.agentInfo
      },
    },
    data() {
      return {
        form: {
          son_id: this.$route.query.son_id || ''
        },
        list: [],
        listLoading: true,
        total_profit: {},
        tableMaxH: '250',
        listQuery: {
          search_depend_type: -1,
          start: 1,
          limit: 20,
          page_num: 1
        },
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
        }
      }
    },
    mounted(options) {
      this.getList()
      this.$store.dispatch('user/postSetRecode', [1, 1, 1])
    },
    methods: {
      /**
       * 搜索查询
       */
      toQuery(type = 0) {
        this.$refs.filterDrawer.hide()
        if (type == 1) {
          this.form = {}
          this.listQuery.start = 1
        } else {
          this.listQuery.start = 1
        }
        this.getList()
      },

      /**
       * 获取列表
       */
      getList() {
        let listQuery = Object.assign({}, this.form, this.listQuery, {
          start: this.listQuery.start - 1
        }), url = 'agentapi/search/query_profit'
        if (listQuery.son_id > 0) {
          listQuery.search_user_type = 1
        }
        if (listQuery.begin) listQuery.begin = this.parseTime(listQuery.begin, '{y}-{m}-{d}')
        if (listQuery.end) listQuery.end = this.parseTime(listQuery.end, '{y}-{m}-{d}')
        this.$get(url, listQuery).then(res => {
          this.listLoading = false
          this.list = res.list
          this.total_profit = {
            all_total_profit: res.all_total_profit,
            my_total_profit: res.my_total_profit,
            son_total_profit: res.son_total_profit,
            my_today_profit: res.my_today_profit,
          }
          this.listQuery.page_num = res.page_num
          if(listQuery.start == 0) this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 83
        }).catch(() => {
          this.listLoading = false
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
