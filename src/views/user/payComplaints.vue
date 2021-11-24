<template>
  <div>
    <drawer ref="filterDrawer">
      <template v-slot:defult>
        <el-form-item label="时间筛选:">
          <div class="flex">
            <el-date-picker
              v-model="form.begin"
              type="date"
              placeholder="开始"
              value-format="timestamp"
              style="width: 100%;"
              :picker-options="beginOptions"
            />
            <span class="ml-5 mr-5">-</span>
            <el-date-picker
              v-model="form.end"
              type="date"
              placeholder="结束"
              value-format="timestamp"
              style="width: 100%;"
              :picker-options="endOptions"
            />
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="toQuery()">查询<i class="el-icon-search el-icon--right" /></el-button>
          <el-button type="warning" plain @click="toQuery(1)">重置<i class="el-icon-refresh el-icon--right" /></el-button>
        </el-form-item>
      </template>
    </drawer>

    <div class="p-5">
      <div class="bg-white">
        <el-table class="ptd-5" id="order_table" ref="order_table" v-loading="listLoading" :data="list" :max-height="tableMaxH"
          element-loading-text="Loading" stripe highlight-current-row>
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
          <pagination v-show="listQuery.page_num > 0" :page.sync="listQuery.start" :limit.sync="listQuery.limit"
            :page-count="listQuery.page_num" @pagination="getList" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import selPlat from '@/components/selPlat'
  import drawer from '@/components/filterDrawer/filter'
  export default {
    name: 'userList',
    components: {
      Pagination,
      selPlat,
      drawer
    },
    computed: {
      deviceKeyObj(){
        return this.$store.state.user.deviceKeyObj
      },
      agentInfo(){
        return this.$store.getters.agentInfo
      }
    },
    data() {
      return {
        beginOptions: {
          disabledDate: (time) => {
            if (this.form.end) {
              return time.getTime() > this.form.end || time.getTime() < (this.form.end - (29 * 86400 * 1000))
            } else {
              return time.getTime() > new Date(new Date().toLocaleDateString()).getTime()
            }
          }
        },
        endOptions: {
          disabledDate: (time) => {
            if (this.form.begin) {
              return time.getTime() < this.form.begin || time.getTime() > (this.form.begin + (29 * 86400 * 1000)) || time.getTime() > new Date(new Date().toLocaleDateString()).getTime()
            } else {
              return time.getTime() > new Date(new Date().toLocaleDateString()).getTime() + 86400
            }
          }
        },
        form: {
          begin: (Date.parse( new Date() ) - (29 * 86400 * 1000)),
          end: Date.parse( new Date() ),
        },
        tableMaxH: '250',
        list: [],
        listLoading: true,
        listQuery: {
          start: 1,
          page_num: 0,
          limit: 15
        },
        memberDialog: false,
        memberObj: {
          status: 1,
          depend_type: 3,
          date_type: 0
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
        this.getList()
      }
    },
    mounted(options) {

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
       * 获取列表s
       */
      getList() {
        let listQuery = Object.assign({}, this.form, this.listQuery, {
            start: this.listQuery.start - 1
          }),
          url = 'agentapi/analysis/wx_user_complaints'
        if(listQuery.begin) listQuery.begin_date = this.parseTime(listQuery.begin / 1000, '{y}-{m}-{d}')
        if(listQuery.end) listQuery.end_date = this.parseTime(listQuery.end / 1000, '{y}-{m}-{d}')
        this.$get(url, listQuery).then(res => {
          this.listLoading = false
          this.list = res.list
          if(res.page_num > 0) this.listQuery.page_num = res.page_num
          if (listQuery.start == 0) this.tableMaxH = window.innerHeight - this.$refs.order_table.$el.offsetTop - 95
        }).catch(() => {
          this.listLoading = false
        })
      },

      /**
       * 充值
       */
      recharge(row, type = 1) {
        this.$prompt('请输入充值金额', type == 1 ? '余额充值' : '储值卡充值', {
          confirmButtonText: '确定充值',
          cancelButtonText: '取消',
          inputPlaceholder: '正数为加，负数为减',
          inputType: 'text',
          beforeClose: (action, instance, done) => {
            if (action == 'confirm') {
              this.loadObj = this.$loading({
                lock: true,
                text: '正在充值',
                spinner: 'el-icon-loading'
              })
              const value = instance.inputValue
              this.$post('agentapi/business/invest_user_accout', {
                uid: row.id,
                type: type,
                money: value
              }).then(res => {
                this.loadObj.close()
                this.$message({
                  message: '充值成功',
                  type: 'success'
                })
                this.toQuery()
                done()
              })
            } else {
              done()
            }
          }
        })
      },

      /**
       * 设置会员
       */
      setUserMember(){
        let params = this.memberObj
        this.loadObj = this.$loading({
          lock: true,
          text: '提交中~~',
          spinner: 'el-icon-loading'
        })
        this.$post('agentapi/card/save_user_member_card_info', params).then(res => {
          this.loadObj.close()
          this.$message({
            message: '设置成功',
            type: 'success'
          })
          this.memberDialog = false
        }).catch(err => {
          this.loadObj.close()
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