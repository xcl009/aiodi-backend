<template>
  <div>
    <drawer ref="filterDrawer">
      <template v-slot:defult>
        <el-form-item label="用户来源:">
          <el-select v-model="listQuery.search_user_type" @change="toQuery()">
            <el-option label="全部" value="2" />
            <el-option label="微信" value="0" />
            <el-option label="支付宝" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="卡类型:">
          <el-select v-model="form.date_type" @change="toQuery()">
            <el-option :label="item.name" :value="item.value" v-for="(item, key) in config.cardObj"/>
          </el-select>
        </el-form-item>
        <el-form-item label="设备类型:" class="hidden-sm-and-down">
          <el-select v-model="form.depend_type" @change="toQuery()">
            <el-option :label="item" :value="key" v-for="(item, key) in deviceKeyObj"/>
          </el-select>
        </el-form-item>
        <el-form-item label="用户ID:" class="hidden-md-and-down">
          <el-input v-model="form.uid" />
        </el-form-item>
        <el-form-item label="用户昵称:" class="hidden-lg-and-down">
          <el-input v-model="form.search_name" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit">查询<i class="el-icon-search el-icon--right" /></el-button>
          <el-button type="warning" plain @click="toQuery(1)">重置<i class="el-icon-refresh el-icon--right" /></el-button>
        </el-form-item>
      </template>
      <template v-slot:more>
        <el-form-item label="设备类型:" class="hidden-md-and-up">
          <el-select v-model="form.depend_type" @change="toQuery()">
            <el-option :label="item" :value="key" v-for="(item, key) in deviceKeyObj"/>
          </el-select>
        </el-form-item>
        <el-form-item label="用户ID:" class="hidden-xg-and-up">
          <el-input v-model="form.uid" />
        </el-form-item>
        <el-form-item label="用户昵称:" class="hidden-xl-only">
          <el-input v-model="form.search_name" />
        </el-form-item>
      </template>
    </drawer>

    <div class="p-5">
      <div class="bg-white">
        <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list" :max-height="tableMaxH" element-loading-text="Loading" stripe highlight-current-row>
          <el-table-column label="商户单号" width="150">
            <template slot-scope="scope">
              {{ scope.row.wx_trade_no || scope.row.zfb_trade_no}}
            </template>
          </el-table-column>
          <el-table-column label="用户" width="150">
            <template slot-scope="scope">
              <div class="flex align-center">
                <el-avatar size="small" :src="scope.row.avatar"></el-avatar>
                <div class="flex1 ml-5">{{ scope.row.nick_name }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="来源" width="80">
            <template slot-scope="scope">
              {{ scope.row.wx_app_id ? "微信" : "支付宝" }}
            </template>
          </el-table-column>
          <el-table-column label="设备类型" width="80">
            <template slot-scope="scope">
              {{ deviceKeyObj[scope.row.depend_type] || '--'}}
            </template>
          </el-table-column>
          <el-table-column label="商户">
            <template slot-scope="scope">
              {{ scope.row.store_name }}
            </template>
          </el-table-column>
          <el-table-column label="支付金额">
            <template slot-scope="scope">
              <div>{{ scope.row.renew_money || "--" }}</div>
            </template>
          </el-table-column>
          <el-table-column label="类型">
            <template slot-scope="scope">
              {{ config.cardObj[scope.row.date_type].name }}
            </template>
          </el-table-column>
          <el-table-column label="开通时间">
            <template slot-scope="scope">
              <div>{{ parseTime(scope.row.begin_date) }}</div>
            </template>
          </el-table-column>
          <el-table-column label="到期时间">
            <template slot-scope="scope">
              <div>{{ parseTime(scope.row.end_date) }}</div>
            </template>
          </el-table-column>
          <el-table-column label="备注">
            <template slot-scope="scope">
              {{ scope.row.renew_reason }}
            </template>
          </el-table-column>
        </el-table>
        <div class="flex justify-center">
          <pagination v-show="listQuery.page_num > 0" :page.sync="listQuery.start" :page-count="listQuery.page_num" :limit.sync="listQuery.limit"
            @pagination="getList"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import drawer from '@/components/filterDrawer/filter'
  export default {
    name: 'cashpledge',
    components: {
      Pagination,
      drawer
    },
    data() {
      return {
        form: {},
        stat_data: {},
        tableMaxH: '250',
        list: [],
        listLoading: false,
        listQuery: {
          type: 1,
          start: 1,
          total: 10,
          page_num: 1,
          limit: 20
        }
      }
    },
    computed: {
      deviceKeyObj(){
        return this.$store.state.user.deviceKeyObj
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
        let listQuery = Object.assign({}, this.listQuery, {
          start: this.listQuery.start - 1
        })
        this.$get('agentapi/card/query_umcards', listQuery).then(res => {
          this.listLoading = false
          this.list = res.list
          this.listQuery.page_num = res.page_num
          if (listQuery.start == 0) this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 80
        }).catch(() => {
          this.listLoading = false
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
