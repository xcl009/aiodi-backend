<template>
  <div>
    <div class="p-20 bg-white">
      <div class="pb-20 text-black fs-c1">账户总览</div>
      <el-row class="stat-box line-1">
        <el-col :xl="4" :lg="6" :md="8" :sm="12" :xs="12">
          <div class="fs-s3 text-black">可提现金额（冻结金额：{{ money.frozenBalance || 0.00 }}）</div>
          <div class="mt-15 mb-15 cursor">
            <span class="text-primary khcoin">￥{{ money.balance || 0.00 }}</span>
          </div>
          <div v-if="!isBrand() && Ability['cash']">
            <el-button type="primary" size="small" class="fs-s3" @click="$router.push({path: `/money/cash`})">去提现</el-button>
          </div>
        </el-col>
        <el-col :xl="4" :lg="6" :md="8" :sm="12" :xs="12">
          <div class="fs-s3 text-black">
            快活币钱包
            <span class="ml-10 fs-s3 text-gray cursor" @click="khyCoinIntroDialog = true" v-if="isBrand()">什么是快活币？</span>
            <el-popover
                placement="top-start"
                title="快活币钱包"
                width="300"
                trigger="hover"
                content="快活币钱包存放了您在系统中的快活币数量，快活币=1人民币，快活币不可提现。" v-else>
                <span slot="reference" class="ml-10 fs-s3 text-gray cursor">什么是快活币？</span>
              </el-popover>
          </div>
          <div class="mt-15 mb-15 cursor">
            <span class="text-primary khcoin">￥{{ money.happyCurrencyNum || 0.00 }}</span>
          </div>
          <el-button type="primary" size="small" class="fs-s3" @click="$refs.rechargeCoin.show()">去充值</el-button>
        </el-col>
      </el-row>
    </div>

    <div class="pt-10 pl-10 pr-10 bg-white">
      <div class="mt-10 pb-10 pl-10 fs-c1 text-black">收支概况</div>
    </div>

    <div class="pl-5 bg-white">
      <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
        <template v-slot:defult>
          <el-form-item label="钱包类型">
            <el-select v-model="form.capitalType" placeholder="钱包类型" @change="toQuery()">
              <el-option label="普通钱包" value="RMB" />
              <el-option label="快活币钱包" value="KHB" />
            </el-select>
          </el-form-item>
        </template>
      </condition>
    </div>

    <div class="pt-10 pl-20 pr-20 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
        :max-height="tableMaxH" element-loading-text="Loading">
        <el-table-column label="名称">
          <template slot-scope="scope">
            {{ scope.row.tradeName}}
          </template>
        </el-table-column>
        <el-table-column label="时间">
          <template slot-scope="scope">
            <span>{{ scope.row.tradeTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="金额">
          <template slot-scope="scope">
            <el-link :type="scope.row.amount > 0 ? 'primary' : 'danger'">{{ scope.row.amount || "0.00" }}</el-link>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-center">
        <pagination v-show="listTotal > 0" :page.sync="listQuery.page" :limit.sync="listQuery.size"
          :total="parseInt(listTotal)" @pagination="getList" />
      </div>
    </div>

    <el-dialog :visible.sync="khyCoinIntroDialog" width="600px">
      <div class="fs-c1 text-black" slot="title">
        快活币
      </div>
      <div class="renewal-box">
        <div class="mb-20 flex">
          <div class="fs-c1">1、</div>
          <div>
            <div class="mb-10 text-black">快活币是什么？</div>
            <div>快活币是本系统内部流通的货币，1快活币等于1元人民币。</div>
          </div>
        </div>
        <div class="mb-20 flex">
          <div class="fs-c1">2、</div>
          <div>
            <div class="mb-10 text-black">快活币怎么赚？</div>
            <div>登录电脑端后台，点击电脑端后台头部右上角【邀请链接获取】按钮，复制邀请链接，发给有需要做共享设备的朋友，朋友入驻本系统成为品牌商，每月系统服务续费时，您可得续费金额的40%，您的朋友也可以进行邀请，他邀请入驻的品牌商续费，您还可以得续费金额的10%。</div>
          </div>
        </div>
        <div class="mb-20 flex">
          <div class="fs-c1">3、</div>
          <!-- <div>
            <div class="mb-10 text-black">快活币怎么用？</div>
            <div>快活币可提现。</div>
          </div> -->
          <div>
            <div class="mb-10 text-black">快活币怎么用？</div>
            <div>快活币可用于系统服务续费、商城购买设备。</div>
          </div>
        </div>
        <div>
          <el-button type="primary" @click="khyCoinIntroDialog = false" style="margin-left: 25px;">已了解</el-button>
        </div>
      </div>
    </el-dialog>

    <recharge-khy-coin ref="rechargeCoin"></recharge-khy-coin>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import condition from '@/components/condition/'
  import RechargeKhyCoin from '@/components/RechargeKhyCoin/'
  export default {
    name: 'income',
    components: {
      Pagination,
      condition,
      RechargeKhyCoin
    },
    computed: {
      agentInfo() {
        return this.$store.getters.agentInfo
      },
      Ability() {
        return this.$store.getters.Ability
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
        }
      }
    },
    mounted(options) {
      this.getBalance()
      this.toQuery()
    },
    methods: {
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
        this.$get('iot-saas-pay/api/pay/tradeLog/list', params).then(res => {
          this.list = res.rows
          this.listLoading = false
          this.clickSubmit = false
          if (params.page == 0) {
            this.listTotal = res.total
            this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 60
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
  .khcoin{
    font-size: 36px;
  }
</style>
