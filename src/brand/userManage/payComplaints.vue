<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:defult>
        <el-date-picker
          class="range-day flex align-center"
            v-model="form.day"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
      </template>
    </condition>

    <div class="pl-15 pr-15 pb-5 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list" :max-height="tableMaxH"
        element-loading-text="Loading">
        <el-table-column label="投诉单号" width="140">
          <template slot-scope="scope">
            {{ scope.row.complaint_id }}
          </template>
        </el-table-column>
        <el-table-column label="关联订单信息" width="350">
          <template slot-scope="scope">
            <template v-if="scope.row.complaint_order_info && scope.row.complaint_order_info.length > 0">
              <div v-for="item in scope.row.complaint_order_info">
                <span class="mr-10">交易单号：{{ item.transaction_id }}</span><br>
                <span>订单金额：￥{{ item.amount }}<a class="ml-10 text-blue" :href="`/order/order?transaction_id=${item.transaction_id}`" target="_blank">查看订单</a></span>
              </div>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="投诉内容">
          <template slot-scope="scope">
            <div class="text-cut_two">{{ scope.row.complaint_detail }}</div>
          </template>
        </el-table-column>
        <el-table-column label="投诉时间" width="110">
          <template slot-scope="scope">
            {{ RFCToDate(scope.row.complaint_time) }}
          </template>
        </el-table-column>
        <el-table-column label="投诉次数" width="100">
          <template slot-scope="scope">
            <div>{{ scope.row.user_complaint_times }}次</div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="150">
          <template slot-scope="scope">
            <div>{{ statu[scope.row.complaint_state] }}</div>
            <div class="mt-5 text-primary" v-if="scope.row.complaint_full_refunded">已全额退款</div>
            <div class="mt-5 text-danger" v-if="scope.row.incoming_user_response && scope.row.complaint_state != 'PROCESSED'">待回复用户</div>
          </template>
        </el-table-column>
        <el-table-column label="退款备注" width="200">
          <template slot-scope="scope">
            <div class="text-danger">{{ scope.row.withdraw_reason || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" round plain class="ml-0" @click="$router.push({path: `/userManage/PCDetail?id=${scope.row.complaint_id}`})">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-center">
        <pagination
          v-show="listQuery.count > 0"
          :page.sync="listQuery.page"
          :limit.sync="listQuery.size"
          :total="listQuery.count"
          @pagination="getList"
        />
      </div>
    </div>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import selPlat from '@/components/selPlat'
  import condition from '@/components/condition/'
  export default {
    name: 'userList',
    components: {
      Pagination,
      selPlat,
      condition
    },
    computed: {
      myDeviceId(){
        return this.$store.state.user.myDeviceId
      },
      agentInfo(){
        return this.$store.getters.agentInfo
      }
    },
    data() {
      return {
        clickSubmit: false,
        form: {
          begin: (Date.parse( new Date() ) - (29 * 86400 * 1000)),
          end: Date.parse( new Date() ),
        },
        tableMaxH: '250',
        list: [],
        listLoading: false,
        listQuery: {
          start: 1,
          page_num: 0,
          limit: 15
        },
        statu: {
          PENDING: "待处理",
          PROCESSING: "处理中",
          PROCESSED: "已处理完成"
        }
      }
    },
    beforeRouteEnter(to, from, next) {
      if (from.name == 'PCDetail') {
        to.meta.isBack = true
      } else {
        to.meta.isBack = false
      }
      next()
    },
    activated() {
      if (!this.$route.meta.isBack || !this.list) {
        //this.getList()
      }
    },
    mounted(options) {

    },
    methods: {
      /**
       * 搜索查询
       */
      toQuery(val = '') {
        if(this.clickSubmit) return
        this.clickSubmit = true
        if (type == 1) {
          this.form = {}
          this.listQuery.page = 1
        } else {
          this.listQuery.page = 1
        }
        this.getList()
      },

      /**
       * 重置查询
       */
      reset(){
        this.form = {}
        this.listQuery.page = 1
        this.listQuery.size = 10
        this.getList()
      },

      /**
       * 获取列表
       */
      getList() {
        let params = Object.assign({}, this.form, this.listQuery, {
            start: this.listQuery.page - 1
          }),
          url = 'agentapi/analysis/wx_user_complaints'
        if(params.begin) params.begin_date = this.parseTime(params.begin / 1000, '{y}-{m}-{d}')
        if(params.end) params.end_date = this.parseTime(params.end / 1000, '{y}-{m}-{d}')
        this.$get(url, params).then(res => {
          this.listLoading = false
          this.list = res.list
          if (params.start == 0) this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 80
        }).catch(() => {
          this.listLoading = false
        })
      },

      /**
       * @param {Object} time RFC3339 日期格式
       * RFC3339转为标准格式日期
       */
      RFCToDate(time){
        var date = new Date(time).toJSON();
        return new Date(+new Date(date)+8*3600*1000).toISOString().replace(/T/g,' ').replace(/\.[\d]{3}Z/,'');
      }
    }
  }
</script>

<style lang="scss" scoped>
  /deep/ .filter-froms .el-input__inner{
    width: 140px;
  }

  .text-cut_two{
    -webkit-line-clamp: 4;/*规定超过两行的部分截断*/
  }
</style>
