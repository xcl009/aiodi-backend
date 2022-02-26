<template>
  <div>
		<condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
		  <template v-slot:defult>
        <el-input v-model="form.name" placeholder="代理姓名"/>
        <el-input v-model="form.mobile" placeholder="手机号码"/>
        <!-- <el-select placeholder="状态" v-model="form.activated_status" @change="toQuery()">
          <el-option label="有效" :value="1" />
          <el-option label="无效" :value="2" />
          <el-option label="已删除" :value="0" />
        </el-select> -->
		  </template>
		</condition>

    <div class="pl-15 pr-15 pb-5 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading" border
        highlight-current-row :max-height="tableMaxH">
        <el-table-column label="品牌信息" align="center" width="130">
          <template slot-scope="scope">
            <div class="mb-5">{{ scope.row.brandName || '--' }}</div>
            <div>{{ scope.row.brandMobile || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="代理信息" align="center" width="130">
          <template slot-scope="scope">
            <div class="mb-5">{{ scope.row.name || '姓名' }}</div>
            <div>{{ scope.row.mobile || '手机号码' }}</div>
          </template>
        </el-table-column>
        <!-- <el-table-column label="运营城市" align="center" width="120">
          <template slot-scope="scope">
            <div>{{ scope.row.charge_county || '深圳' }}</div>
          </template>
        </el-table-column> -->
        <el-table-column label="品类" align="center">
          <template slot-scope="scope">
            <div class="inline text-left">
              <el-tag
                class="block mtb-3 cursor"
                :hit="true"
                size="medium"
                effect="plain"
                @click="$router.push({path: `/device?agent_id=${scope.row.id}`})" v-for="item in scope.row.agentDeviceType">
                {{ item.name }}<!-- &nbsp;&nbsp;{{ scope.row.goods_sum || '0' }} -->
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="下级总数" align="center" width="150">
          <template slot-scope="scope">
            <div class="inline text-left">
              <div class="mb-5">直属下级：{{ scope.row.child_agent_num || 0}}</div>
              <div>间属下级：{{ scope.row.child_agent_num || 0}}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="收益(元)" align="center" width="150">
          <template slot-scope="scope">
            <span class="cursor text-blue" @click="$router.push({path: `/money/income?son_id=${scope.row.id}`})">{{ scope.row.income || '0.00' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="可提现金额(元)" align="center" width="150">
          <template slot-scope="scope">
            <span class="cursor text-blue" @click="$router.push({path: `/money/income?son_id=${scope.row.id}`})">{{ scope.row.income || '0.00' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="分润比例" align="center">
          <template slot-scope="scope">
            <div class="inline text-left">
              <div v-for="item in scope.row.agentDeviceType">
                {{ item.name }}&nbsp;&nbsp;{{ item.profitRatio || '0' }}%
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="240">
          <template slot-scope="scope">
            <div class="inline text-left">
              <el-button class="pl-5 pr-5 ml-0" size="medium" type="text" @click="$router.push({path: `/order?agentId=${scope.row.id}`})">订单列表</el-button>
              <el-button class="pl-5 pr-5 ml-0" size="medium" type="text" @click="$router.push({path: `/order?agentId=${scope.row.id}`})">商户列表</el-button>
              <el-button class="pl-5 pr-5 ml-0" size="medium" type="text" @click="$router.push({path: `/order?agentId=${scope.row.id}`})">一键登录</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-center">
        <pagination
          v-show="listTotal > 0"
          :page.sync="listQuery.page"
          :limit.sync="listQuery.size"
          :total="parseInt(listTotal)"
          @pagination="getList"
        />
      </div>
    </div>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import condition from '@/components/condition/'
  import { copyText } from '@/utils/index'
  import { getToken, setToken, removeToken } from '@/utils/auth'

  export default {
    name: 'agent',
    components: {
      Pagination,
      condition
    },
    data() {
      return {
        clickSubmit: false,
        tableMaxH: '250',
        list: [],
        listLoading: false,
        listTotal: 0,
        listQuery: {
          page: 1,
          size: 20
        },
        form: {},
      }
    },
    beforeRouteEnter(to, from, next) {
      if (from.name == '') {
        to.meta.reload = true
      } else {
        to.meta.reload = false
      }
      next()
    },
    activated() {
      if(this.$route.meta.reload){
        this.getList()
      }else if(!this.list || this.list.length == 0) {
        this.listQuery.son_type = this.user_type
        this.toQuery(1)
      }
    },
    computed: {
      siteInfo() {
        return this.$store.getters.siteInfo
      }
    },
    mounted() {

    },
    methods: {
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
       * 重置查询
       */
      reset(){
        if(this.clickSubmit) return
        this.clickSubmit = true
        this.form = {}
        this.listQuery.page = 1
        this.listQuery.size = 20
        this.getList()
      },

      /**
       * 获取列表
       */
      getList() {
        var params = Object.assign({}, this.form, this.listQuery, {
          page: this.listQuery.page - 1
        })
        this.$get('iot-saas-basic/admin/agent/findPage', params).then(res => {
          this.list = res.rows
          this.listLoading = false
          this.clickSubmit = false
          if(params.page == 0){
            this.listTotal = res.total
            this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 80
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
