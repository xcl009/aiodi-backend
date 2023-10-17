<template>
  <div>
		<condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
		  <template v-slot:defult>
        <el-form-item label="品牌名称" v-if="isSaas()">
          <selectSearch v-model="form.brandId" :type="6" name="name" placeholder="请输入品牌名称" @change="toQuery()"></selectSearch>
        </el-form-item>
        <el-form-item label="代理姓名">
          <el-input v-model="form.name" placeholder="代理姓名"/>
        </el-form-item>
        <el-form-item label="手机号码">
          <el-input v-model="form.mobile" placeholder="手机号码"/>
        </el-form-item>
        <!-- <el-select placeholder="状态" v-model="form.activated_status" @change="toQuery()">
          <el-option label="有效" :value="1" />
          <el-option label="无效" :value="2" />
          <el-option label="已删除" :value="0" />
        </el-select> -->
		  </template>
		</condition>

    <div class="pl-10 pr-10 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading" highlight-current-row :max-height="tableMaxH">
        <el-table-column label="品牌商" width="120">
          <template slot-scope="scope">
            <div>{{ brandUser[scope.row.brandId] ? brandUser[scope.row.brandId].name : '--' }}</div>
            <el-tooltip class="item" effect="dark" :content="brandUser[scope.row.brandId].mobile" placement="top" v-if="brandUser[scope.row.brandId]">
              <div>{{ dealPhone(brandUser[scope.row.brandId].mobile) }}</div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="代理信息" width="130">
          <template slot-scope="scope">
            <div>{{ scope.row.name || '姓名' }}</div>
            <el-tooltip class="item" effect="dark" :content="scope.row.mobile" placement="top">
              <div>{{ dealPhone(scope.row.mobile) }}</div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="品类" width="200">
          <template slot-scope="scope">
            <div>
              <span class="mr-20 inline" v-for="item in scope.row.agentDeviceType" @click="$router.push({path: `/device?agentId=${scope.row.id}`})">
                {{ item.name }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="设备数">
          <template slot-scope="scope">
            <div class="cursor inline text-left" @click="$router.push({path: `/device?agentId=${scope.row.id}`})">
              <div>全部：{{ deviceCount[scope.row.id] ? deviceCount[scope.row.id].deviceNumber : '0' }}</div>
              <div>已铺货：{{ deviceCount[scope.row.id] ? deviceCount[scope.row.id].bindStoreNumber : '0' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="订单数" width="120">
          <template slot-scope="scope">
            <div class="inline text-left">
              <div>微信：<el-link type="primary"
                  @click="$router.push({path: `/order?agentId=${scope.row.id}&sourceType=1`})">
                  {{ orderCount[scope.row.id] ? orderCount[scope.row.id].wx : 0 }}
                </el-link>
              </div>
              <div>支付宝：<el-link type="primary"
                  @click="$router.push({path: `/order?agentId=${scope.row.id}&sourceType=2`})">
                  {{ orderCount[scope.row.id] ? orderCount[scope.row.id].ali : 0 }}
                </el-link>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="金额(元)" width="140">
          <template slot-scope="scope">
            <div class="inline">
              <div>交易额：{{ orderCount[scope.row.id] ? orderCount[scope.row.id].amount : '0.00' }}</div>
              <div>总收益：{{ orderCount[scope.row.id] ? orderCount[scope.row.id].amountDivide : '0.00' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="可提现金额(元)" width="120">
          <template slot-scope="scope">
            <span class="cursor text-blue">{{ cashStat[scope.row.id] ? cashStat[scope.row.id].balance : '0.00' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="分润比例" width="140">
          <template slot-scope="scope">
            <div class="inline text-left">
              <div v-for="item in scope.row.agentDeviceType">
                {{ item.name }}&nbsp;&nbsp;{{ item.profitRatio || '0' }}%
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="245" :fixed="device == 'desktop' ? 'right' : false">
          <template slot-scope="scope">
            <div class="flex flex-wrap">
              <el-button type="primary" size="mini" @click="$router.push({path: `/order?brandId=${scope.row.brandId}&agentId=${scope.row.id}`})">订单列表</el-button>
              <el-button type="primary" size="mini" @click="$router.push({path: `/store?brandId=${scope.row.brandId}&agentId=${scope.row.id}`})">商户列表</el-button>
              <el-dropdown trigger="click">
                <el-button type="primary" size="mini">更多<i class="el-icon-arrow-down el-icon--right line-1"></i></el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item @click.native="toLogin(scope.row)">代理管理</el-dropdown-item>
                  <el-dropdown-item @click.native="setRow(6, scope.row)">重置登录密码</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
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
  import selectSearch from '@/components/condition/selectSearch'
  export default {
    name: 'agent',
    components: {
      Pagination,
      condition,
      selectSearch
    },
    data() {
      return {
        clickSubmit: false,
        form: {},
        tableMaxH: '250',
        list: [],
        listLoading: true,
        listTotal: 0,
        listQuery: {
          page: 1,
          size: 20
        },

        orderCount: {},
        deviceCount: {},
        cashStat: {},
        brandUser: {}
      }
    },
    beforeRouteEnter(to, from, next) {
      if (from.name == 'addAgent') {
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
      device() {
        return this.$store.state.app.device
      },
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
            this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 95
          }
          this.queryCash(this.arrayKeys(res.rows, 'id'))
          this.queryOrderCount(this.arrayKeys(res.rows, 'id'))
          this.queryDeviceCount(this.arrayKeys(res.rows, 'id'))
          this.getSubBrand(this.arrayKeys(res.rows, 'brandId'))
        }).catch(() => {
          this.clickSubmit = false
          this.listLoading = false
        })
      },

      /**
       * 获取可提现金额
       */
      queryCash(ids){
        if(ids.length == 0){
          this.cashStat = {}
          return
        }
        this.$get('iot-saas-pay/api/pay/acount/list', {
          accountType: 1,
          ownerIds: ids.join(',')
        }).then(res => {
          this.cashStat = res
        })
      },

      /**
       * 订单数量统计查询
       */
      queryOrderCount(ids){
        if(ids.length == 0){
          this.orderCount = {}
          return
        }
        this.$get('iot-saas-order/admin/order/count/queryGroupCount', {
          countType: 'AGENT',
          groupIds: ids.join(',')
        }).then(res => {
          this.orderCount = res
        })
      },

      /**
       * 设备数量统计查询
       */
      queryDeviceCount(ids){
        if(ids.length == 0){
          this.deviceCount = {}
          return
        }
        this.$get('iot-saas-device/admin/device/count/queryGroupCount', {
          countType: 'AGENT',
          groupIds: ids.join(',')
        }).then(res => {
          this.deviceCount = res
        })
      },

      /**
       * 获取所属品牌
       */
      getSubBrand(uids){
        if(uids == 0){
          this.brandUser = {}
          return
        }
        this.$get('iot-saas-basic/admin/brand/findInfoByIds', {
          brandIds: uids.join(',')
        }).then(res => {
          this.brandUser = res
        })
      },

      /**
       * 操作行
       * @param {Object} type 6 重置登录密码
       * @param {Object} row
       * @param {Object} index
       */
      setRow(type, row, index) {
        switch (type) {
          case 1:

          case 6:
            this.$alert('确定重置该品牌账号的登录密码吗？', '重置登录密码', {
              confirmButtonText: '确定',
              center: true,
              callback: action => {
                if (action == 'confirm') {
                  this.$post('iot-saas-user/admin/user/password/reset', {
                    userId: row.userId,
                    password: '123456'
                  }).then(res => {
                    this.$message({
                      message: '重置成功',
                      type: 'success'
                    })
                  })
                }
              }
            })
            break
        }
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
        this.$post('iot-saas-user/admin/login', {
          userType: 'agent',
          id: row.id
        }).then(res => {
          setToken(getToken(), 'token1')
          setToken(res.loginToken.accessToken)
          setTimeout(()=>{
            location.href = '/home'
            this.loadObj.close()
          }, 500)
        }).catch(err=>{
          this.loadObj.close()
        })
      },
	  }
  }
</script>

<style lang="scss" scoped>

</style>
