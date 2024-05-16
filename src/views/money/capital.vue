<template>
  <div>
    <div class="p-20 bg-white">
      <div class="pb-20 text-black fs-c1">{{ $t('moeny.accountOverview') }}</div>
      <el-row class="stat-box line-1">
        <el-col :xl="4" :lg="6" :md="8" :sm="12" :xs="12">
          <div class="fs-s3 text-black">{{ $t('brand.withdrawableAmount') }}（{{ $t('public.freezeAmount') }}：{{ money.frozenBalance || 0.00 }}）</div>
          <div class="mt-15 mb-15 cursor">
            <span class="text-primary khcoin">{{ money.balance || 0.00 }}{{ siteInfo.currencySymbol }}</span>
          </div>
          <div v-if="!isBrand() && Ability['cash']">
            <el-button type="primary" size="small" class="fs-s3" @click="$router.push({path: `/money/cash`})">{{ $t('public.withdrawal') }}</el-button>
          </div>
        </el-col>
        <el-col :xl="4" :lg="6" :md="8" :sm="12" :xs="12">
          <div class="fs-s3 text-black">
            {{ $t('payType.khbMoeny') }}
            <span class="ml-10 fs-s3 text-gray cursor" @click="khyCoinIntroDialog = true" v-if="isBrand()">{{ $t('moeny.whyKhb') }}</span>
            <el-popover
                placement="top-start"
                :title="$t('payType.khbMoeny')"
                width="300"
                trigger="hover"
                :content="$t('moeny.khbText')" v-else>
                <span slot="reference" class="ml-10 fs-s3 text-gray cursor">{{ $t('moeny.whyKhb') }}</span>
              </el-popover>
          </div>
          <div class="mt-15 mb-15 cursor">
            <span class="text-primary khcoin">{{ money.happyCurrencyNum || 0.00 }}</span>
          </div>
          <el-button type="primary" size="small" class="fs-s3" @click="$refs.rechargeCoin.show()">{{ $t('moeny.goRecharge') }}</el-button>
        </el-col>
      </el-row>
    </div>

    <div v-if="!isStore() || storeMoneySetInfo.checkIncome == 1">
      <div class="pt-10 pl-10 pr-10 bg-white">
        <div class="mt-10 pb-10 pl-10 fs-c1 text-black">{{ $t('moeny.overview') }}</div>
      </div>

      <div class="pl-5 bg-white">
        <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery" :exportStatus="true" @saveXlsx="saveXlsx">
          <template v-slot:defult>
            <el-form-item :label="$t('public.moenyType')">
              <el-select v-model="form.capitalType" :placeholder="$t('public.moenyType')" @change="toQuery()">
                <el-option :label="$t('payType.regularWallet')" value="RMB" />
                <el-option :label="$t('payType.khbMoeny')" value="KHB" />
              </el-select>
            </el-form-item>
          </template>
        </condition>
      </div>

      <div class="pt-10 pl-20 pr-20 bg-white">
        <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
          :max-height="tableMaxH" element-loading-text="Loading">
          <el-table-column :label="$t('public.name')">
            <template slot-scope="scope">
              {{ scope.row.remark}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('public.time')">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.updateDatetime) }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('public.amount')">
            <template slot-scope="scope">
              <el-link :type="scope.row.amountChange > 0 ? 'primary' : 'danger'">{{ scope.row.amountChange || "0.00" }}</el-link>
            </template>
          </el-table-column>
        </el-table>

        <div class="flex justify-center">
          <pagination v-show="listTotal > 0" :page.sync="listQuery.page" :limit.sync="listQuery.size"
            :total="parseInt(listTotal)" @pagination="getList" />
        </div>
      </div>
    </div>

    <el-dialog :visible.sync="khyCoinIntroDialog" width="600px">
      <div class="fs-c1 text-black" slot="title">
        {{ $t('payType.khb') }}
      </div>
      <div class="renewal-box">
        <div class="mb-20 flex">
          <div class="fs-c1">1、</div>
          <div>
            <div class="mb-10 text-black">{{ $t('moeny.khbWhy') }}</div>
            <div>{{ $t('moeny.khbWhyText') }}</div>
          </div>
        </div>
        <div class="mb-20 flex">
          <div class="fs-c1">2、</div>
          <div>
            <div class="mb-10 text-black">{{ $t('moeny.khbHowToAarn') }}</div>
            <div>{{ $t('moeny.khbHowToAarnText') }}</div>
          </div>
        </div>
        <div class="mb-20 flex">
          <div class="fs-c1">3、</div>
          <!-- <div>
            <div class="mb-10 text-black">快活币怎么用？</div>
            <div>快活币可提现。</div>
          </div> -->
          <div>
            <div class="mb-10 text-black">{{ $t('moeny.khbHowToUseIt') }}</div>
            <div>{{ $t('moeny.khbHowToUseItText') }}</div>
          </div>
        </div>
        <div>
          <el-button type="primary" @click="khyCoinIntroDialog = false" style="margin-left: 25px;">{{ $t('moeny.understood') }}</el-button>
        </div>
      </div>
    </el-dialog>

    <recharge-khy-coin ref="rechargeCoin"></recharge-khy-coin>
    <xlsx ref="toXlsx" :fileName="$t('moeny.revenueRecords')"></xlsx>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import condition from '@/components/condition/'
  import RechargeKhyCoin from '@/components/RechargeKhyCoin/'
  import xlsx from '@/components/xlsx/'
  export default {
    name: 'income',
    components: {
      Pagination,
      condition,
      RechargeKhyCoin,
      xlsx
    },
    computed: {
      siteInfo() {
        return this.$store.getters.siteInfo
      },
      agentInfo() {
        return this.$store.getters.agentInfo
      },      
      Ability() {
        return this.$store.getters.Ability
      },
      myDevice(){
        return this.$store.getters.myDevice
      }
    },
    data() {
      return {
        money: {},
        clickSubmit: false,
        khyCoinIntroDialog: false,
        form: {
          capitalType: 'RMB'
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
        },
        storeMoneySetInfo: {}
      }
    },
    mounted(options) {
      if(this.isStore()){
        this.getSettingsFind()
      } else {
        this.toQuery()
      }
      this.getBalance()
    },
    methods: {
      /**
       * 获取商户相关配置
       */
      getSettingsFind() {
      	this.$get('iot-saas-basic/open/settings/find', {
      		code: 'STORE_MONEY_SET',
          brandId: this.agentInfo.brandId
      	}).then(res => {
      		if (res && res.code) {
      			this.storeMoneySetInfo = JSON.parse(res.setting)
      		} else {
      			this.storeMoneySetInfo = {
      				checkIncome: 1,
      				checkMouthStat: 1,
      				checkMouthStatSp: 0
      			}
      		}
          console.log(this.myDevice)
          if(this.storeMoneySetInfo.checkIncome == 1){
            this.toQuery()
          }
      	})
      },

      /**
       * 获取可提现金额
       */
      getBalance(){
        this.$get('iot-saas-pay/api/pay/withdraw/balance').then(res => {
          this.money = res || {}
        })
      },

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
          capitalType: 'RMB'
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
          queryType: 'all'
        })
        if(params.date && params.date.length > 0){
          params.startTime = params.date[0]
          params.endTime = params.date[1]
          delete params.date
        }
        // /api/pay/tradeLog/list
        this.$get('iot-saas-pay/api/pay/acount/flow/findPage', params).then((res = {}) => {
          this.list = res.rows || []
          if (this.outStatus) {
            let end = false
            if (params.size > this.list.length) end = true
            this.$nextTick(() => {
              this.$refs['toXlsx'].saveTableXlsx(end, Math.ceil(res.total / params.size),  () => {
                if(end){
                  this.outStatus = false
                  this.toQuery()
                }else{
                  this.listQuery.page += 1
                  this.getList()
                }
              })
            })
          }else{
            this.listLoading = false
            this.clickSubmit = false
            if (params.page == 0) {
              this.listTotal = res.total
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
        this.getList()
      },
    }
  }
</script>

<style lang="scss" scoped>
  .khcoin{
    font-size: 36px;
  }
</style>
