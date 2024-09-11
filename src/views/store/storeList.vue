<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery" :exportStatus="true"
      @saveXlsx="saveXlsx">
      <template v-slot:defult>
        <el-form-item v-for="item in 1">
          <div class="flex combined">
            <el-select v-model="formKey[`sel${item}`]" :placeholder="$t('public.pleaseSelect')">
              <template v-for="(q, key) in queryObj">
                <el-option :label="q.title" :value="key" v-if="checkQueryRepeat(key, item, formKey)"></el-option>
              </template>
            </el-select>
            <template v-if="queryObj[formKey[`sel${item}`]] && queryObj[formKey[`sel${item}`]].type == 'input'">
              <el-input :placeholder="`${$t('publck.enter')}${queryObj[formKey[`sel${item}`]].title}`"
                v-model="form[formKey[`sel${item}`]]"></el-input>
            </template>
            <template v-if="queryObj[formKey[`sel${item}`]] && queryObj[formKey[`sel${item}`]].type == 'selectSearch'">
              <selectSearch v-model="form[formKey[`sel${item}`]]" :type="queryObj[formKey[`sel${item}`]].sType"
                :name="queryObj[formKey[`sel${item}`]].name" :placeholder="`${queryObj[formKey['sel' + item]].title}`"
                @change="toQuery()">
              </selectSearch>
            </template>
            <template v-if="queryObj[formKey[`sel${item}`]] && queryObj[formKey[`sel${item}`]].type == 'select'">
              <el-select v-model="form[formKey[`sel${item}`]]" :placeholder="`${queryObj[formKey['sel' + item]].title}`"
                clearable @change="toQuery()">
                <el-option :label="item.label" :value="item.value"
                  v-for="(item, key) in queryObj[formKey[`sel${item}`]].selectArr" />
              </el-select>
            </template>
          </div>
        </el-form-item>
        <el-form-item>
          <el-date-picker class="range-day flex align-center" v-model="form.date" type="daterange" range-separator="-"
            value-format="yyyy-MM-dd" :start-placeholder="$t('public.statrtDate')" :end-placeholder="$t('public.endDate')" :picker-options="pickerOptionsEnd"
            @change="toQuery()">
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-radio-group v-model="form.dates" @input="toQuery(1)">
            <el-radio-button label="0">{{ $t('public.today')}}</el-radio-button>
            <el-radio-button label="-1">{{ $t('public.yesterday')}}</el-radio-button>
            <el-radio-button label="3">{{ $t('public.thisWeek')}}</el-radio-button>
            <el-radio-button label="4">{{ $t('public.lastWeek')}}</el-radio-button>
            <el-radio-button label="5">{{ $t('public.thisMonth')}}</el-radio-button>
            <el-radio-button label="6">{{ $t('public.lastMonth')}}</el-radio-button>
            <el-radio-button label="7">{{ $t('public.thisYear')}}</el-radio-button>
            <el-radio-button label="8">{{ $t('public.lastYear')}}</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </template>
    </condition>
    <div class="pl-10 pr-10 bg-white" :class="{ 'pt-15': isStore() }">
      <div class="flex align-center pt-15 mb-15 l-t">
        <div class="flex1 fs-c1 text-black">{{ $t('public.enquiryForm') }}</div>
        <table-column-set storageKey="storeTableColumn" :showColumn.sync="showColumn"
          :defaultColumn="defaultColumn"></table-column-set>
      </div>

      <el-table class="ptd-5" id="list_table" ref="list_table" highlight-current-row element-loading-text="Loading"
        v-loading="listLoading" :max-height="tableMaxH" :data="list" @sort-change="sortChange">
        <el-table-column label="商户名称" width="150" prop="storeName"></el-table-column>
        <template v-for="item in showColumn">
          <el-table-column :label="item.name" v-if="item.val && item.key == 'orderNumber'" column-key="orderAllNumber" sortable>
            <template slot-scope="scope">
              <div class="flex align-center">
                {{ scope.row.orderNumber || 0 }}
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" v-if="item.val && item.key == 'amount'" column-key="amount" sortable>
            <template slot-scope="scope">
              <div class="row-device_stat">
                {{ scope.row.amount || 0 }}
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" v-if="item.val && item.key == 'amountDivide'" column-key="amountDivide" sortable>
            <template slot-scope="scope">
              {{ scope.row.amountDivide || 0 }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" v-if="item.val && item.key == 'amountDeposit' && (isSaas() || isBrand())">
            <template slot-scope="scope">
              {{ scope.row.amountDeposit || 0 }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" v-if="item.val && item.key == 'active' && (isSaas() || isBrand())">
            <template slot-scope="scope">
              {{ scope.row.amountDeposit && scope.row.amountUnrefund ? (Number(scope.row.amountDeposit) - Number(scope.row.amountUnrefund)).toFixed(2) || 0 : 0 }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name"
            v-if="item.val && item.key == 'amountUnrefund' && (isSaas() || isBrand())">
            <template slot-scope="scope">
              {{ scope.row.amountUnrefund || 0 }}
            </template>
          </el-table-column>
        </template>
      </el-table>

      <div class="flex justify-center">
        <pagination :page.sync="listQuery.page" :limit.sync="listQuery.size" :total="parseInt(listTotal)"
          @pagination="getList" />
      </div>
    </div>
    <xlsx ref="toXlsx" :fileName="$t('home.storeList')"></xlsx>
  </div>
</template>

<script>
  import qs from 'qs'
  import {
    getToken,
    setToken,
    removeToken
  } from '@/utils/auth'
  import {
    arrayToObj,
    copyText
  } from '@/utils/index'
  import Pagination from '@/components/Pagination'
  import condition from '@/components/condition/'
  import RelatedTemplate from '@/components/RelatedTemplate/'
  import VendorMode from '@/components/VendorMode/'
  import AssignAbility from '@/components/AssignAbility/'
  import ImportData from '@/components/ImportData/'
  import selectSearch from '@/components/condition/selectSearch'
  import TableColumnSet from '@/components/TableColumnSet/index'
  import xlsx from '@/components/xlsx/'
  import DateUtil from '@/utils/date'
  export default {
    name: 'subShop',
    components: {
      Pagination,
      condition,
      TableColumnSet,
      RelatedTemplate,
      VendorMode,
      AssignAbility,
      ImportData,
      selectSearch,
      xlsx
    },
    props: {
      lowerStore: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        clickSubmit: false,
        copyText: copyText,
        catList: [],
        cityList: [],
        form: {},
        tableMaxH: '250',
        list: [],
        listLoading: true,
        listTotal: 0,
        listQuery: {
          page: 1,
          size: 20
        },
        /**
         * 列的配置化对象，存储配置信息
         */
        showColumn: [],
        defaultColumn: [{
            key: 'orderNumber',
            val: true,
            name: this.$t('home.orderNum')
          },
          {
            key: 'amount',
            val: true,
            name: this.$t('public.aTurnover')
          },
          {
            key: 'amountDivide',
            val: true,
            name: this.$t('public.income')
          },
          {
            key: 'amountDeposit',
            val: true,
            name: this.$t('home.seizuresNum')
          },
          {
            key: 'active',
            val: true,
            name: this.$t('home.alldeposit')
          },
          {
            key: 'amountUnrefund',
            val: true,
            name: this.$t('home.allRefunded')
          },
        ],
        formKey: {
          sel1: 'storeId',
        },
        queryObj: {
          storeId: {
            title: this.$t('public.storeName'),
            type: 'selectSearch',
            name: 'name',
            sType: 3
          },
        },
        pickerOptionsEnd: {
          disabledDate: (time) => {
            let timeOptionRange = this.timeOptionRange
            let secondNum = 60 * 60 * 24 * 31 * 1000
            if (timeOptionRange) {
              return (time.getTime() > timeOptionRange.getTime() + secondNum || time.getTime() < timeOptionRange
                .getTime() - secondNum) || time.getTime() > Date.now()
            }
            return time.getTime() > Date.now()
          },
          onPick: (time) => {
            //当第一时间选中才设置禁用
            if (time.minDate && !time.maxDate) {
              this.timeOptionRange = time.minDate
            }
            if (time.maxDate) {
              this.timeOptionRange = null
            }
          }
        },
      }
    },
    computed: {
      device() {
        return this.$store.state.app.device
      },
      myDeviceName() {
        return this.$store.state.user.myDeviceName
      },
      myDeviceId() {
        return this.$store.state.user.myDeviceId
      },
      siteInfo() {
        return this.$store.getters.siteInfo
      },
      agentInfo() {
        return this.$store.getters.agentInfo
      },
      Ability() {
        return this.$store.getters.Ability
      }
    },
    activated() {
      this.getList()
    },
    mounted() {
      this.getList()
    },
    methods: {
      /**
       * 搜索查询
       */
      toQuery(type) {
        if (this.clickSubmit) return
        this.clickSubmit = true
        this.listQuery.page = 1
        this.listQuery.size = 20
        if (type == 1) {
          if (this.form.dates) {
            this.form.date = '';
          }
        }
        if (this.form.date) {
          this.form.dates = '';
        }
        this.getList()
      },

      /**
       * 重置查询
       */
      reset() {
        this.form = {}
        this.listQuery.page = 1
        this.listQuery.size = 20
        this.$refs.list_table.clearSort()
        this.getList()
      },

      /**
       * 排序
       */
      sortChange({column, prop, order}){
        if(order){
          this.form.sortSet = {}
          this.form.sortSet[column.columnKey] = (order == 'ascending' ? 'asc' : 'desc')
        }else{
          this.form.sortSet[column.columnKey] = ''
        }
        this.toQuery()
      },

      /**
       * 获取列表
       */
      getList() {
        let endDateStr = new Date().getFullYear() + 1;
        var params = Object.assign({}, this.form, this.listQuery, {
          page: this.listQuery.page - 1,
          startDateStr: "2011",
          endDateStr,
        })
        if (params.date) {
          params.startDateStr = params.date[0];
          params.endDateStr = params.date[1];
          delete params.date;
        }
        if (params.dates || params.dates == '0') {
          if (params.dates || params.dates) {
            params.startDateStr = DateUtil.getDate(params.dates, 2).start;
            params.endDateStr = DateUtil.getDate(params.dates, 2).end;
          }
          if (params.dates == '3') {
            params.startDateStr = DateUtil.getMonday("s", 0, 2);
            params.endDateStr = DateUtil.getMonday("e", 0, 2);
          }
          if (params.dates == '4') {
            params.startDateStr = DateUtil.getMonday("s", -1, 2);
            params.endDateStr = DateUtil.getMonday("e", -1, 2);
          }
          if (params.dates == '5') {
            params.startDateStr = DateUtil.getMonth("s", 0, 2);
            params.endDateStr = DateUtil.getMonth("e", 0, 2);
          }
          if (params.dates == '6') {
            params.startDateStr = DateUtil.getMonth("s", -1, 2);
            params.endDateStr = DateUtil.getMonth("e", -1, 2);

          }
          if (params.dates == '7') {
            params.startDateStr = DateUtil.getYear("s", 0, 2);
            params.endDateStr = DateUtil.getYear("e", 0, 2);

          }
          if (params.dates == '8') {
            params.startDateStr = DateUtil.getYear("s", -1, 2);
            params.endDateStr = DateUtil.getYear("e", -1, 2);
          }
          delete params.dates;
        }
        if (this.isBrand()) {
          params.brandId = this.agentInfo.brandId;
        } else if (this.isAgent()) {
          params.agentId = this.agentInfo.agentId;
        }
        this.$post('iot-saas-order/admin/order/count/store/queryDepositCount', params).then(async (res = {}) => {
          let list = res.rows || []
          this.list = list
          this.listLoading = false
          this.clickSubmit = false
          if (this.outStatus) {
            let end = false
            if (params.size > this.list.length) end = true
            this.$nextTick(() => {
              this.$refs['toXlsx'].saveTableXlsx(end, Math.ceil(res.total / params.size), () => {
                if (end) {
                  this.outStatus = false
                  this.toQuery()
                } else {
                  this.listQuery.page += 1
                  this.getList()
                }
              })
            })
          } else {
            this.listLoading = false
            this.clickSubmit = false
            if (params.page == 0) {
              this.listTotal = parseInt(res.total)
              this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 60
            }
          }
        }).catch(() => {
          this.clickSubmit = false
          this.listLoading = false
        })
      },


      /**
       * 导出
       */
      saveXlsx() {
        this.outStatus = true
        this.listLoading = true
        this.listQuery.size = 100
        this.list = []
        this.$refs['toXlsx'].clearData()
        this.getList()
      },
    }
  }
</script>

<style lang="scss" scoped>
  .text-cut_two {
    max-height: 66px;
    line-height: 22px;
    -webkit-line-clamp: 3;
    /*规定超过两行的部分截断*/
  }

  .row-device_stat {
    .item {
      &+.item {
        margin-top: 10px;
      }

      .w-80 {
        width: 80px;
      }
    }
  }

  .operate {
    /deep/ .el-button--text {
      &:nth-child(4) {
        margin-left: 0;
      }
    }

    .el-dropdown {
      margin-left: 10px;
    }
  }
</style>
