<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" :resetStatus="false" @query="toQuery">
      <template v-slot:defult>
        <el-select v-model="form.appId" placeholder="小程序" @change="toQuery()">
          <el-option :label="item.appName" :value="item.appId" v-for="(item, key) in wechatList" />
        </el-select>
        <el-date-picker
          class="range-day flex align-center"
            v-model="form.date"
            type="daterange"
            range-separator="-"
            value-format="yyyy-MM-dd"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptionsEnd"
            @change="toQuery()">
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
                <span>订单金额：￥{{ item.amount / 100 }}<a class="ml-10 text-blue" @click="copyText(item.transaction_id)">复制单号</a></span>
              </div>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="投诉内容">
          <template slot-scope="scope">
            <div class="text-cut_two">{{ scope.row.complaint_detail }}</div>
          </template>
        </el-table-column>
        <el-table-column label="投诉时间" width="150">
          <template slot-scope="scope">
            {{ parseTime(scope.row.complaint_time) }}
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
        <el-table-column label="操作" width="100">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="$router.push({path: `/userManage/PCDetail?complaintId=${scope.row.complaint_id}&appId=${form.appId}`})">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-center">
        <pagination :page.sync="listQuery.page" :limit.sync="listQuery.size" :total="parseInt(listTotal)"
          @pagination="getList" />
      </div>
    </div>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import condition from '@/components/condition/'
  import {
    copyText
  } from '@/utils/index'
  export default {
    name: 'payComplaints',
    components: {
      Pagination,
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
        copyText: copyText,
        clickSubmit: false,
        tableMaxH: '250',
        wechatList: [],
        list: [],
        listLoading: false,
        listTotal: 0,
        listQuery: {
          page: 1,
          size: 20
        },
        form: {
          appId: '',
          date: [this.parseTime(this.currentTime() - (29 * 86400), '{y}-{m}-{d}'), this.parseTime(this.currentTime(), '{y}-{m}-{d}')]
        },
        pickerOptionsEnd: {
          disabledDate: (time) => {
            let timeOptionRange = this.timeOptionRange
            let secondNum = 60 * 60 * 24 * 29 * 1000
            if (timeOptionRange) {
              return (time.getTime() > timeOptionRange.getTime() + secondNum || time.getTime() < timeOptionRange.getTime() - secondNum) || time.getTime() > Date.now()
            }
            return time.getTime() > Date.now()
          }, onPick: (time) => {
            //当第一时间选中才设置禁用
            if (time.minDate && !time.maxDate) {
              this.timeOptionRange = time.minDate
            }
            if (time.maxDate) {
              this.timeOptionRange = null
            }
          }
        },
        statu: {
          PENDING: "待处理",
          PROCESSING: "处理中",
          PROCESSED: "已处理完成"
        }
      }
    },
    beforeRouteEnter(to, from, next) {
      to.meta.urlQuery = JSON.stringify(to.query)
      if (from.name == '') {
        to.meta.reload = true
      } else {
        to.meta.reload = false
      }
      next()
    },
    activated() {
      let queryKey = [],
        query = this.$route.query
      for (var i in queryKey) {
        this[queryKey[i]] = query[queryKey[i]]
      }
      if (this.$route.meta.reload) {
        this.getList()
      } else if (this.urlQuery != this.$route.meta.urlQuery) {
        this.getWechatList()
      }
      this.urlQuery = this.$route.meta.urlQuery
    },
    mounted(options) {

    },
    methods: {
      /**
       * 获取列表
       */
      getWechatList() {
        this.$get('iot-saas-pay/admin/pay/config/wechat/list', {
          page: 0,
          size: 20
        }).then((res = {}) => {
          if(res.rows && res.rows.length > 0){
            this.wechatList = res.rows || []
            this.form.appId = res.rows[0].appId
            this.toQuery(1)
          }
        })
      },

      /**
       * 搜索查询
       */
      toQuery() {
        if(this.clickSubmit) return
        this.clickSubmit = true
        this.listQuery.page = 1
        this.listQuery.size = 20
        this.getList()
      },

      /**
       * 获取列表
       */
      getList() {
        let params = Object.assign({}, this.form, this.listQuery, {
          page: this.listQuery.page - 1,
        })
        params.beginDate = params.date[0]
        params.endDate = params.date[1]
        delete params.date
        this.$get('iot-saas-pay/admin/wx/complaints/list', params).then((res = {}) => {
          this.list = res.rows || []
          this.listLoading = false
          this.clickSubmit = false
          if (params.page == 0) {
            this.listTotal = res.total || 0
            this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 120
          }
        }).catch(() => {
          this.listLoading = false
          this.clickSubmit = false
        })
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
