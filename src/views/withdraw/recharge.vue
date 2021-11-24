<template>
  <div>
    <drawer ref="filterDrawer">
      <template v-slot:defult>
        <el-form-item label="充值类型:">
          <el-select v-model="form.from_balance" @change="toQuery()">
            <el-option label="钱包" value="1" />
            <el-option label="储值卡" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="充值状态:">
          <el-select v-model="form.pay_status" @change="toQuery()">
            <el-option label="未支付" value="0" />
            <el-option label="已支付" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="充值方式:">
          <el-select v-model="form.pay_type" @change="toQuery()">
            <el-option label="微信" value="1" />
            <el-option label="支付宝" value="2" />
            <el-option label="后台充值" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户ID:" class="hidden-sm-and-down">
          <el-input v-model="form.uid" />
        </el-form-item>
        <el-form-item label="用户昵称:" class="hidden-lg-and-down">
          <el-input v-model="form.search_name" />
        </el-form-item>
        <el-form-item label="时间筛选:" class="hidden-xg-and-down">
          <div class="flex">
            <el-date-picker v-model="form.begin" type="datetime" placeholder="开始日期" value-format="timestamp" style="width: 100%;"
              :picker-options="beginOptions" />
            <span class="ml-5 mr-5">-</span>
            <el-date-picker v-model="form.end" type="datetime" placeholder="结束日期" value-format="timestamp" style="width: 100%;"
              :picker-options="endOptions" />
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit">查询<i class="el-icon-search el-icon--right" /></el-button>
          <el-button type="warning" plain @click="toQuery(1)">重置<i class="el-icon-refresh el-icon--right" /></el-button>
          <el-button type="primary" plain @click="outTab('list_table', '用户充值记录')">导出<i class="el-icon-male el-icon--right" /></el-button>
        </el-form-item>
      </template>
      <template v-slot:more>
        <el-form-item label="用户ID:" class="hidden-md-and-up">
          <el-input v-model="form.uid" />
        </el-form-item>
        <el-form-item label="用户昵称:" class="hidden-lg-and-up">
          <el-input v-model="form.search_name" />
        </el-form-item>
        <el-form-item label="时间筛选:" class="hidden-xg-and-up">
          <div class="flex">
            <el-date-picker v-model="form.begin" type="datetime" placeholder="开始日期" value-format="timestamp" style="width: 100%;"
              :picker-options="beginOptions" />
            <span class="ml-5 mr-5">-</span>
            <el-date-picker v-model="form.end" type="datetime" placeholder="结束日期" value-format="timestamp" style="width: 100%;"
              :picker-options="endOptions" />
          </div>
        </el-form-item>
      </template>
    </drawer>

    <div class="p-5">
      <div class="flex bg-white">
        <!-- <div class="flex1">

        </div> -->
        <div class="pl-15 flex1 tabs-right fs-s3">
          <span class="mr-15">总充值：{{ stat_data.total_consume_amount || 0 }}元</span>
        </div>
      </div>
      <div class="bg-white">
        <el-table id="list_table" ref="list_table" v-loading="listLoading" :data="list" :max-height="tableMaxH" element-loading-text="Loading" stripe
          highlight-current-row>
          <el-table-column label="订单信息">
            <template slot-scope="scope">
              <div>单号：{{ scope.row.id}}</div>
              <div>来源：{{ scope.row.pay_type == 1 ? "微信" : scope.row.pay_type == 2 ? "支付宝" : '后台' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="商户单号">
            <template slot-scope="scope">
              <span>{{ scope.row.out_trade_no }}</span>
            </template>
          </el-table-column>
          <el-table-column label="用户" width="150">
            <template slot-scope="scope">
              <div class="flex align-center">
                <el-avatar size="small" :src="scope.row.user_avatar"></el-avatar>
                <div class="flex1 ml-5">{{ scope.row.user_nick_name }}<br>{{ scope.row.user_mobile }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="充值时间">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.add_date, '{y}-{m}-{d} {h}:{i}') }}</span>
            </template>
          </el-table-column>
          <el-table-column label="充值金额">
            <template slot-scope="scope">
              ￥{{ scope.row.pay_money }}
            </template>
          </el-table-column>
          <el-table-column label="赠送金额">
            <template slot-scope="scope">
              ￥{{ scope.row.gift_money || 0 }}
            </template>
          </el-table-column>
          <el-table-column label="类型">
            <template slot-scope="scope">
              {{ scope.row.from_type}}
            </template>
          </el-table-column>
          <el-table-column label="状态">
            <template slot-scope="scope">
              <el-link :type="scope.row.status == 2 ? 'primary' : 'danger'">{{ scope.row.status == 2 ? '已支付' : scope.row.status == 0 ? '未支付' : ''}}</el-link>
            </template>
          </el-table-column>
        </el-table>
        <div class="flex justify-center">
          <pagination v-show="listQuery.page_num > 0" :page.sync="listQuery.start" :limit.sync="listQuery.limit"
            :page-count="listQuery.page_num" @pagination="getList" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import drawer from '@/components/filterDrawer/filter'
  export default {
    name: 'userReviewe',
    components: {
      Pagination,
      drawer
    },
    computed: {
      agentInfo(){
        return this.$store.getters.agentInfo
      }
    },
    data() {
      return {
        son_id: this.$route.query.son_id || '',
        form: {},
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
        stat_data: {},
        tableMaxH: '250',
        list: [],
        listLoading: true,
        listQuery: {
          start: 1,
          page_num: 1,
          change_type: 1,
          limit: 20
        }
      }
    },
    mounted(options) {
      this.getList()
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

      getList() {
        let listQuery = Object.assign({}, this.form, this.listQuery, {
            start: this.listQuery.start - 1
          }),
          url = 'agentapi/search/query_user_consume'
        if (listQuery.begin) listQuery.begin = this.parseTime(listQuery.begin, '{y}-{m}-{d}')
        if (listQuery.end) listQuery.end = this.parseTime(listQuery.end, '{y}-{m}-{d}')
        this.$get(url, listQuery).then(res => {
          this.listLoading = false
          this.list = res.list
          this.stat_data = res.stat_data
          this.listQuery.page_num = res.page_num
          if (listQuery.start == 0) this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 80
        }).catch(() => {
          this.listLoading = false
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
