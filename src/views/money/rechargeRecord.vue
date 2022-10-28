<template>
  <div>
    <div class="pl-5 bg-white">
      <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
        <template v-slot:defult>
          <el-select v-model="form.capitalType" placeholder="钱包类型" @change="toQuery()">
            <el-option label="普通钱包" :value="1" />
            <el-option label="快活币钱包" :value="2" />
          </el-select>
          <el-date-picker
            class="range-day flex align-center"
              v-model="form.date"
              type="datetimerange"
              range-separator="-"
              value-format="yyyy-MM-dd HH:mm:ss"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :picker-options="pickerOptionsEnd"
              @change="toQuery()">
            </el-date-picker>
        </template>
      </condition>
    </div>

    <div class="pt-10 pl-20 pr-20 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list" show-summary
        :max-height="tableMaxH" element-loading-text="Loading">
        <el-table-column label="头像" width="60">
          <template slot-scope="scope">
            <el-avatar shape="square" :size="35" :src="scope.row.avatar" fit="fill" icon="el-icon-picture-outline" class="m-auto block"></el-avatar>
          </template>
        </el-table-column>
        <el-table-column label="用户" width="160">
          <template slot-scope="scope">
            <el-link class="cursor">{{ scope.row.nickname || '无昵称' }}</el-link>
            <div>{{ scope.row.mobile || '' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="钱包类型">
          <template slot-scope="scope">
            <span>{{ scope.row.happyCurrencyNum > 0 ? '快活币钱包' : '普通钱包' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="充值时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="支付方式" width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.pay_type == 2 ? '支付宝' : '微信'}}</span>
          </template>
        </el-table-column>
        <el-table-column label="充值金额" prop="amount" sortable></el-table-column>
        <el-table-column label="实际到账">
          <template slot-scope="scope">
            <span>{{ scope.row.actualAmount || scope.row.happyCurrencyNum || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="备注">
          <template slot-scope="scope">
            <span>{{ scope.row.remark }}</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-center">
        <pagination v-show="listTotal > 0" :page.sync="listQuery.page" :limit.sync="listQuery.size"
          :total="parseInt(listTotal)" @pagination="getList" />
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
      agentInfo() {
        return this.$store.getters.agentInfo
      }
    },
    data() {
      return {
        clickSubmit: false,
        form: {
          capitalType: (this.isSaas() ? 2 : 1)
        },
        pickerOptionsEnd: {
          disabledDate: (time) => {
            let timeOptionRange = this.timeOptionRange
            let secondNum = 60 * 60 * 24 * 31 * 1000
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
        tableMaxH: '250',
        list: [],
        listLoading: false,
        listTotal: 0,
        listQuery: {
          page: 1,
          size: 20
        }
      }
    },
    mounted(options) {
      this.toQuery()
    },
    methods: {
      /**
       * 搜索查询
       */
      toQuery() {
        if (this.clickSubmit) return
        this.clickSubmit = true
        this.listQuery.page = 1
        this.listQuery.size = 20
        this.getList()
      },

      /**
       * 重置查询
       */
      reset() {
        if (this.clickSubmit) return
        this.clickSubmit = true
        this.form = {
          capitalType: (this.isSaas() ? 2 : 1)
        }
        this.listQuery.page = 1
        this.listQuery.size = 20
        this.getList()
      },

      /**
       * 获取列表
       */
      getList() {
        var params = Object.assign({}, this.form, this.listQuery, {
          page: this.listQuery.page - 1,
          orderStatus: 'SUCCESS'
        })
        if(params.date && params.date.length > 0){
          params.startTime = params.date[0]
          params.endTime = params.date[1]
          delete params.date
        }
        this.$get('iot-saas-pay/admin/recharge/list', params).then(res => {
          this.list = res.rows
          this.listLoading = false
          this.clickSubmit = false
          if (params.page == 0) {
            this.listTotal = res.total
            this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 120
          }
        }).catch(() => {
          this.clickSubmit = false
          this.listLoading = false
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
