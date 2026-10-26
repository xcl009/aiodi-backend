<template>
  <div>
    <div class="bg-white">
      <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
        <template v-slot:defult>
          <el-form-item :label="$t('public.moneyType')">
            <el-select v-model="form.capitalType" :placeholder="$t('public.moneyType')" @change="toQuery()">
              <el-option :label="$t('payType.regularWallet')" :value="1" />
              <el-option :label="$t('payType.khbMoney')" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('payType.khbMoney')">
          <el-date-picker
            class="range-day flex align-center"
              v-model="form.date"
              type="datetimerange"
              range-separator="-"
              value-format="yyyy-MM-dd HH:mm:ss"
              :start-placeholder="$t('public.statrtDate')"
              :end-placeholder="$t('public.endDate')"
              :picker-options="pickerOptionsEnd"
              @change="toQuery()">
            </el-date-picker>
          </el-form-item>
        </template>
      </condition>
    </div>

    <div class="pl-10 pr-10 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list" show-summary
        :max-height="tableMaxH" element-loading-text="Loading">
        <el-table-column :label="$t('public.img')" width="60">
          <template slot-scope="scope">
            <el-avatar shape="square" :size="35" :src="scope.row.avatar" fit="fill" icon="el-icon-picture-outline" class="m-auto block"></el-avatar>
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.user')" width="160">
          <template slot-scope="scope">
            <el-link class="cursor">{{ scope.row.nickname || $t('public.noNickname') }}</el-link>
            <div>{{ scope.row.mobile || '' }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.moneyType')">
          <template slot-scope="scope">
            <span>{{ scope.row.happyCurrencyNum > 0 ? $t('payType.khbMoney') : $t('payType.regularWallet') }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('money.rechargeTime')">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.payType')" width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.pay_type == 2 ? $t('payType.zfb') : $t('payType.wx')}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('money.rechargeAmount')" prop="amount" sortable></el-table-column>
        <el-table-column :label="$t('money.actualReceipt')">
          <template slot-scope="scope">
            <span>{{ scope.row.actualAmount || scope.row.happyCurrencyNum || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.remark')">
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
