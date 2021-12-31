<template>
  <div>
    <drawer ref="filterDrawer">
      <template v-slot:defult>
        <el-form-item label="合同类型:">
          <el-select v-model="listQuery.renew_fee_type" @change="toQuery()">
            <el-option label="全部" value="-1" />
            <el-option :label="item" :value="key" v-for="(item, key) in fee_type"/>
          </el-select>
        </el-form-item>
        <el-form-item label="时间类型:">
          <el-select v-model="listQuery.search_contract_type" @change="toQuery()">
            <el-option label="全部" value="-1" />
            <el-option :label="item" :value="key" v-for="(item, key) in date_type"/>
          </el-select>
        </el-form-item>
        <el-form-item label="支付状态:" class="hidden-sm-and-down">
          <el-select v-model="listQuery.search_contract_status" @change="toQuery()">
            <el-option label="全部" value="-1" />
            <el-option label="未支付" value="0" />
            <el-option label="已支付" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="代理名称:" class="hidden-md-and-down">
          <el-input v-model="form.search_name" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit">查询<i class="el-icon-search el-icon--right" /></el-button>
          <el-button type="warning" plain @click="toQuery(1)">重置<i class="el-icon-refresh el-icon--right" /></el-button>
          <el-button type="primary" plain @click="outTab('list_table', '续费记录')">导出<i class="el-icon-male el-icon--right" /></el-button>
        </el-form-item>
      </template>
      <template v-slot:more>
        <el-form-item label="支付状态:" class="hidden-md-and-up">
          <el-select v-model="listQuery.search_contract_status" @change="toQuery()">
            <el-option label="全部" value="-1" />
            <el-option label="未支付" value="0" />
            <el-option label="已支付" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="代理名称:" class="hidden-lg-and-up">
          <el-input v-model="form.search_name" />
        </el-form-item>
      </template>
    </drawer>

    <div class="p-5">
      <div class="bg-white">
        <el-table class="ptd-5" id="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading" stripe highlight-current-row>
          <el-table-column label="代理商">
            <template slot-scope="scope">
              {{ scope.row.name }}
            </template>
          </el-table-column>
          <el-table-column label="支付用户">
            <template slot-scope="scope">
              <div class="flex align-center" v-if="scope.row.status == 1 && scope.row.zfb_trade_no">
                <el-avatar size="small" :src="scope.row.zfb_avatar"></el-avatar>
                <div class="flex1 ml-5">{{ scope.row.zfb_nick_name }}</div>
              </div>
              <div class="flex align-center" v-if="scope.row.status == 1 && scope.row.wx_trade_no">
                <el-avatar size="small" :src="scope.row.wx_avatar"></el-avatar>
                <div class="flex1 ml-5">{{ scope.row.wx_nick_name }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="合同类型">
            <template slot-scope="scope">
              <div class="flex align-center">
                <div class="flex1 pl-10">{{ fee_type[scope.row.renew_fee_type] }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="商户单号">
            <template slot-scope="scope">
              <div>{{ scope.row.status == 1 ? (scope.row.wx_trade_no || scope.row.zfb_trade_no) : '--'}}</div>
            </template>
          </el-table-column>
          <el-table-column label="交易单号">
            <template slot-scope="scope">
              {{ scope.row.transaction_id || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="支付方式">
            <template slot-scope="scope">
              <div>{{ scope.row.status == 1 ? (scope.row.wx_trade_no ? '微信' : scope.row.zfb_trade_no ? '支付宝' : '') : '--'}}</div>
            </template>
          </el-table-column>
          <el-table-column label="时间类型">
            <template slot-scope="scope">
              <div class="flex align-center">
                <div class="flex1 pl-10">{{ date_type[scope.row.contract_type] }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="续费时间" width="180">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.add_date, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
            </template>
          </el-table-column>
          <el-table-column label="支付金额">
            <template slot-scope="scope">
              <div class="el-link">{{ scope.row.renew_money }}</div>
            </template>
          </el-table-column>
          <el-table-column label="当前月数">
            <template slot-scope="scope">
              <div class="el-link">{{ scope.row.now_taked_month }}</div>
            </template>
          </el-table-column>
          <el-table-column label="状态">
            <template slot-scope="scope">
              <div class="el-link el-link--success">{{ scope.row.status == 1 ? '已支付' : '未支付' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="备注">
            <template slot-scope="scope">{{ scope.row.renew_reason }}</template>
          </el-table-column>
        </el-table>
        <div class="flex justify-center bg-white">
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
    name: 'renewRecord',
    components: {
      Pagination,
      drawer
    },
    data() {
      return {
        fee_type: ['平台使用合同','微信广告开通'],
        date_type: ['永久','年付','月付'],
        form: {},
        list: [],
        listLoading: true,
        listQuery: {
          renew_fee_type: '-1',
          search_contract_type: '-1',
          search_contract_status: '-1',
          start: 1,
          total: 10,
          limit: 20,
          page_num: 1
        },
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
          this.listQuery.page = 1
        } else {
          this.listQuery.page = 1
        }
        this.getList()
      },

      /**
       * 获取列表
       */
      getList() {
        let listQuery = Object.assign({}, this.form, this.listQuery, {
          start: this.listQuery.page - 1
        }), url = 'agentapi/pay/contract_pay_log'
        this.$get(url, listQuery).then(res => {
          this.listLoading = false
          this.list = res.list
          this.stat_data = res.stat_data
          this.listQuery.page_num = res.page_num
        }).catch(() => {
          this.listLoading = false
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
