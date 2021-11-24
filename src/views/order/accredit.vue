<template>
  <div>
    <drawer ref="filterDrawer">
      <template v-slot:defult>
        <el-form-item label="状态:">
          <el-select v-model="listQuery.check_order">
            <el-option label="全部" value="-1" />
            <el-option label="未创建订单" value="0" />
            <el-option label="已创建订单" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备SN:">
          <el-input v-model="form.search_goods_sn" />
        </el-form-item>
        <el-form-item label="用户ID:" class="hidden-sm-and-down">
          <el-input v-model="form.uid" />
        </el-form-item>
        <el-form-item label="时间筛选:" class="hidden-lg-and-down">
          <div class="flex">
            <el-date-picker
              v-model="form.begin"
              type="datetime"
              placeholder="开始"
              value-format="timestamp"
              style="width: 100%;"
              :picker-options="beginOptions"
            />
            <span class="ml-5 mr-5">-</span>
            <el-date-picker
              v-model="form.end"
              type="datetime"
              placeholder="结束"
              value-format="timestamp"
              style="width: 100%;"
              :picker-options="endOptions"
            />
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit">查询<i class="el-icon-search el-icon--right" /></el-button>
          <el-button type="warning" plain @click="toQuery(1)">重置<i class="el-icon-refresh el-icon--right" /></el-button>
          <el-tooltip class="item" effect="dark" content="选择开始时间和结束时间,点击查询后即可导出该时间段内的订单" placement="top">
            <el-button type="primary" plain @click="outTab('order_table', xlsxName)">导出<i class="el-icon-male el-icon--right" /></el-button>
          </el-tooltip>
          <el-button type="primary" @click="$router.push({path: `/order/editAccredit`})">添加授权订单</el-button>
        </el-form-item>
      </template>
      <template v-slot:more>
        <el-form-item label="用户ID:" class="hidden-md-and-up">
          <el-input v-model="form.uid" />
        </el-form-item>
        <el-form-item label="时间筛选:" class="hidden-xg-and-up">
          <div class="flex">
            <el-date-picker
              v-model="form.begin"
              type="datetime"
              placeholder="开始"
              value-format="timestamp"
              style="width: 100%;"
              :picker-options="beginOptions"
            />
            <span class="ml-5 mr-5">-</span>
            <el-date-picker
              v-model="form.end"
              type="datetime"
              placeholder="结束"
              value-format="timestamp"
              style="width: 100%;"
              :picker-options="endOptions"
            />
          </div>
        </el-form-item>
      </template>
    </drawer>

    <div class="p-10">
      <div class="bg-white pl-10 pr-10">
        <el-table
          id="order_table"
          ref="order_table"
          v-loading="listLoading"
          :data="list"
          element-loading-text="Loading"
          stripe
          highlight-current-row
          :max-height="tableMaxH"
        >
          <el-table-column label="订单ID" width="70">
            <template slot-scope="scope">
              {{ scope.row.fund_order_id }}
            </template>
          </el-table-column>
          <el-table-column label="标题">
            <template slot-scope="scope">
              {{ scope.row.order_title }}
            </template>
          </el-table-column>
          <el-table-column label="授权金额">
            <template slot-scope="scope">
              {{ scope.row.order_amount }}
            </template>
          </el-table-column>
          <el-table-column label="备注">
            <template slot-scope="scope">
              {{ scope.row.remark }}
            </template>
          </el-table-column>
          <el-table-column label="用户ID" width="70">
            <template slot-scope="scope">
              {{ scope.row.uid }}
            </template>
          </el-table-column>
          <el-table-column label="用户昵称" width="140">
            <template slot-scope="scope">
              <div class="flex align-center">
                <el-avatar :size="30" :src="scope.row.avatar" />
                <div class="flex1 pl-10">{{ scope.row.nick_name || "--" }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="手机号码">
            <template slot-scope="scope">
              {{ scope.row.mobile || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="时间" width="200">
            <template slot-scope="scope">
              <div>{{ parseTime(scope.row.add_date, '{y}-{m}-{d} {h}:{i}:{s}') }}</div>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="135">
            <template slot-scope="scope">
              {{ deviceState[scope.row.device_status] || "--" }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template slot-scope="scope">
              <el-button type="primary" size="small" plain round @click="getOrderDetail(scope.row.order_id)">结束订单</el-button>
              <p class="mt-0 mb-5" />
              <el-button type="primary" size="small" plain round @click="getOrderDetail(scope.row.order_id)">修改订单</el-button>
              <p class="mt-0 mb-5" />
              <el-button type="primary" size="small" plain round @click="getOrderDetail(scope.row.order_id)">取消订单</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="flex justify-center">
          <pagination
            v-show="listQuery.page_num > 0"
            :total="listQuery.total"
            :page.sync="listQuery.start"
            :limit.sync="listQuery.limit"
            :page-count="listQuery.page_num"
            @pagination="getList"
          />
        </div>
      </div>
    </div>

    <el-dialog title="订单详情" :visible.sync="detailDialog">
      <el-timeline>
        <el-timeline-item v-for="(item, index) in order.operate_flow" :key="index" placement="top" :timestamp="item.date">
          <div>{{ item.event }} ---> {{ item.result }}</div>
          <div v-if="item.reason" class="mt-5">
            <el-link type="danger">{{ item.reason }}</el-link>
          </div>
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import drawer from '@/components/filterDrawer/filter'
export default {
  name: 'Order',
  components: {
    Pagination,
    drawer
  },
  props: {
    user_type: {
      type: Number,
      default: 0
    }
  },
  computed: {
    deviceNameObj(){
      return this.$store.state.user.deviceNameObj
    },
    deviceKeyObj(){
      return this.$store.state.user.deviceKeyObj
    }
  },
  data() {
    return {
      deviceState: ['掉线', '正常', '维护', '异常'],
      drawer: true,
      agentInfo: {},
      form: {
        uid: this.$route.query.uid || ''
      },
      tableMaxH: '250',
      list: [],
      listLoading: true,
      listQuery: {
        type: 1,
        start: 1,
        limit: 10,
        total: 10,
        page_num: 1,
        check_order: '-1'
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
      },

      // 订单详情
      detailDialog: false,
      order: {}
    }
  },
  mounted(options) {
    this.agentInfo = window.agentInfo
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

    /**
       * 获取列表
       */
    getList() {
      var params = Object.assign({}, this.form, this.listQuery, {
        start: this.listQuery.start - 1
      })
      if (params.begin) params.begin = this.parseTime(params.begin, '{y}-{m}-{d}')
      if (params.end) params.end = this.parseTime(params.end, '{y}-{m}-{d}')
      this.$get('agentapi/fund/order_list', params).then(res => {
        this.listLoading = false
        this.list = res.list
        this.listQuery.page_num = res.page_num
        this.listQuery.total = res.info_num
        if(params.start == 0) this.tableMaxH = window.innerHeight - this.$refs.order_table.$el.offsetTop - 85
      }).catch(() => {
        this.listLoading = false
      })
    },

    /**
     * 获取订单详情
     */
    getOrderDetail(order_id) {
      this.$get('wxapi/order_detail', {
        order_id: order_id
      }).then(res => {
        this.detailDialog = true
        this.order = res
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  /deep/ .el-tabs__header {
    margin-bottom: 0;
  }
</style>
