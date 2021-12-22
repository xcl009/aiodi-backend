<template>
  <div>
		<condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
		  <template v-slot:defult>
        <!-- <el-select placeholder="排序" v-model="form.sort" @change="toQuery()">
          <el-option v-for="itme in sort_type" :label="itme.name" :value="''+itme.value" />
        </el-select> -->
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
            <div class="mb-5">{{ scope.row.name || '品牌名' }}</div>
            <div>{{ scope.row.phone || '手机号码' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="代理信息" align="center" width="130">
          <template slot-scope="scope">
            <div class="mb-5">{{ scope.row.name || '姓名' }}</div>
            <div>{{ scope.row.phone || '手机号码' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="运营城市" align="center" width="120">
          <template slot-scope="scope">
            <div>{{ scope.row.charge_county || '深圳' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="设备" align="center">
          <template slot-scope="scope">
            {{ scope.row.depend_type_name || '密码线' }}：{{ scope.row.goods_sum || '0' }}
          </template>
        </el-table-column>
        <el-table-column label="下级总数" align="center" width="150">
          <template slot-scope="scope">
            <div class="mb-5">直属下级：{{ scope.row.child_agent_num || 0}}</div>
            <div>间属下级：{{ scope.row.child_agent_num || 0}}</div>
          </template>
        </el-table-column>
        <el-table-column label="收益(元)" align="center" width="200">
          <template slot-scope="scope">
            <div class="cursor">
              <span class="text-blue" @click="$router.push({path: `/money/income?son_id=${scope.row.id}`})">{{ scope.row.income || '0.00' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="分润比例" align="center">
          <template slot-scope="scope">
            {{ scope.row.depend_type_name || '密码线' }}：{{ scope.row.goods_sum || '50%' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="175">
          <template slot-scope="scope">
            <div class="inline text-left">
              <el-button type="primary" size="mini" @click="$router.push({path: `/order?son_id=${scope.row.id}`})">订单列表</el-button>
              <el-button type="primary" size="mini" @click="$router.push({path: `/store?son_id=${scope.row.id}`})">商户列表</el-button>
              <el-button type="primary" size="mini" @click="">一键登录</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-center">
        <pagination
          v-show="listQuery.count > 0"
          :page.sync="listQuery.page"
          :limit.sync="listQuery.size"
          :total="listQuery.count"
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
        sort_type: [{
            name: '综合排序',
            value: 0
          },
          {
            name: '收益从高到低',
            value: 1
          },
          {
            name: '收益从低到高',
            value: 2
          },
          {
            name: '创建时间由近到远',
            value: 3
          },
          {
            name: '创建时间由远到近',
            value: 4
          }
        ],
        form: {},
        tableMaxH: '250',
        list: [
          {}
        ],
        deviceNum: {},
        listLoading: false,
        listQuery: {
          activated_status: 1,
          search_agent_id: '0',
          sort_type: '0',
          search_agent_level: '0',
          son_type: 0,
          page: 1,
          size: 20,
          count: 10
        }
      }
    },
    beforeRouteEnter(to, from, next) {
      if (from.name == "agentEdit") {
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
      myDeviceName(){
        return this.$store.state.user.myDeviceName
      },
      siteInfo() {
        return this.$store.getters.siteInfo
      },
      myDeviceId(){
        return this.$store.state.user.myDeviceId
      },
      agentInfo(){
        return this.$store.getters.agentInfo
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
        this.$get('/brand/findPage', params).then(res => {
          this.listLoading = false
          this.list = res.list
          this.clickSubmit = false
          if(params.page == 1){
            this.count = res.count
            this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 80
          }
        }).catch(() => {
          this.clickSubmit = false
          this.listLoading = false
        })
      },

      /**
       * 获取设备数量
       */
      getDeviceNum(agent_ids){
        this.$get('SyStatistics/getmyDeviceNum', {
          agent_ids: JSON.stringify(agent_ids)
        }).then(res => {
          this.clickSubmit = false
          this.deviceNum = res
        }).catch(() => {
          this.clickSubmit = false
        })
      },

      /**
       * 登录代理后台
       * @param {Object} row
       */
      toLogin(row){
        this.loadObj = this.$loading({
          lock: true,
          text: '正在登录',
          spinner: 'el-icon-loading'
        })
        this.$post('agentapi/pretend_son_login', {
          son_id: row.id
        }).then(res => {
          setToken(getToken(), 'token1')
          setToken(res.token)
          setToken(res.belong_partner_aid, 'agent_id')
          setToken(row.id, 'user_id')
          setTimeout(()=>{
            location.href = '/home'
            this.loadObj.close()
          }, 500)
        })
      },

      /**
       * 复制贴牌登录地址
       * @param {Object} row
       */
      copyloginUrl(row){
        copyText(`${location.origin}/login/${row.id}`)
        this.$message({
          message: '复制成功',
          type: 'success'
        })
      }
	  }
  }
</script>

<style lang="scss" scoped>

</style>
