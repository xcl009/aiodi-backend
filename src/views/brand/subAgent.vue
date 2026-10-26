<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:defult>
        <el-form-item :label="$t('public.brandName')" v-if="isSaas()">
          <selectSearch v-model="form.brandId" :type="6" name="name" :placeholder="$t('brand.pleaseBrandName')"
            @change="toQuery()"></selectSearch>
        </el-form-item>
        <el-form-item :label="$t('public.agentName')">
          <el-input v-model="form.name" :placeholder="$t('public.agentName')" />
        </el-form-item>
        <el-form-item :label="$t('public.phone')">
          <el-input v-model="form.mobile" :placeholder="$t('public.phone')" />
        </el-form-item>
        <!-- <el-select placeholder="状态" v-model="form.activated_status" @change="toQuery()">
          <el-option label="有效" :value="1" />
          <el-option label="无效" :value="2" />
          <el-option label="已删除" :value="0" />
        </el-select> -->
      </template>
    </condition>

    <div class="pl-10 pr-10 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
        element-loading-text="Loading" highlight-current-row :max-height="tableMaxH">
        <el-table-column :label="$t('brand.brandPartners')" width="120">
          <template slot-scope="scope">
            <div>{{ brandUser[scope.row.brandId] ? brandUser[scope.row.brandId].name : '--' }}</div>
            <el-tooltip class="item" effect="dark" :content="brandUser[scope.row.brandId].mobile" placement="top"
              v-if="brandUser[scope.row.brandId]">
              <div>{{ dealPhone(brandUser[scope.row.brandId].mobile) }}</div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column :label="$t('brand.agentInfo')" width="130">
          <template slot-scope="scope">
            <div>{{ scope.row.name || $t('public.fullName') }}</div>
            <el-tooltip class="item" effect="dark" :content="scope.row.mobile" placement="top">
              <div>{{ dealPhone(scope.row.mobile) }}</div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column :label="$t('brand.category')" width="200">
          <template slot-scope="scope">
            <template v-for="(item, index) in scope.row.agentDeviceType">
              <div class="cursor" v-if="index < 2" @click="$router.push({ path: `/device?agentId=${scope.row.id}` })">
                {{ item.name }}
              </div>
            </template>
          </template>
        </el-table-column>
        <el-table-column :label="$t('brand.numberOfDevices')">
          <template slot-scope="scope">
            <div class="cursor inline text-left" @click="$router.push({ path: `/device?agentId=${scope.row.id}` })">
              <div>{{ $t('public.all') }}: {{ deviceCount[scope.row.id] ? deviceCount[scope.row.id].deviceNumber : '0' }}
              </div>
              <div>{{ $t('public.shipped') }}: {{ deviceCount[scope.row.id] ? deviceCount[scope.row.id].bindStoreNumber :
                '0' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.orderNum')" width="120">
          <template slot-scope="scope">
            <div class="text-primary cursor" @click="$router.push({ path: `/order?brandId=${scope.row.brandId}&agentId=${scope.row.id}`})">
              {{ orderCount[scope.row.id] ? orderCount[scope.row.id].wx + orderCount[scope.row.id].ali : 0 }}
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="`${$t('public.amount')}`" width="140">
          <template slot-scope="scope">
            <div class="inline">
              <div>{{ $t('public.aTurnover') }}: {{ orderCount[scope.row.id] ? orderCount[scope.row.id].amount : '0.00' }}</div>
              <div>{{ $t('public.totalRevenue') }}: {{ orderCount[scope.row.id] ? orderCount[scope.row.id].amountDivide : '0.00' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="`${$t('brand.withdrawableAmount')}`" width="120">
          <template slot-scope="scope">
            <span class="cursor text-blue">{{ cashStat[scope.row.id] ? cashStat[scope.row.id].balance : '0.00' }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('brand.dividendRatio')" width="140">
          <template slot-scope="scope">
            <template v-for="(item, index) in scope.row.agentDeviceType">
              <div v-if="index < 2">
                {{ item.name }}&nbsp;&nbsp;{{ item.profitRatio || '0' }}%
              </div>
            </template>
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.actions')" width="245" :fixed="device == 'desktop' ? 'right' : false">
          <template slot-scope="scope">
            <div class="flex flex-wrap">
              <el-button type="primary" size="mini"
                @click="$router.push({ path: `/order?brandId=${scope.row.brandId}&agentId=${scope.row.id}` })">{{ $t('brand.orderList') }}</el-button>
              <el-button type="primary" size="mini"
                @click="$router.push({ path: `/store?brandId=${scope.row.brandId}&agentId=${scope.row.id}` })">{{ $t('brand.storeList') }}</el-button>
              <el-dropdown trigger="click">
                <el-button type="primary" size="mini">{{ $t('public.adds') }}<i
                    class="el-icon-arrow-down el-icon--right line-1"></i></el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item @click.native="toLogin(scope.row)">{{ $t('brand.agentManagement') }}</el-dropdown-item>
                  <el-dropdown-item @click.native="setRow(6, scope.row)">{{ $t('public.setLoginPassword') }}</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
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
    if (this.$route.meta.reload) {
      this.getList()
    } else if (!this.list || this.list.length == 0) {
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
        if (params.page == 0) {
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
    queryCash(ids) {
      if (ids.length == 0) {
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
    queryOrderCount(ids) {
      if (ids.length == 0) {
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
      this.$get('iot-saas-device/admin/device/count/queryGroupCountV2', {
        countType: 'AGENT',
        groupIds: ids.join(',')
      }).then(res => {
        this.deviceCount = res
      })
    },

    /**
     * 获取所属品牌
     */
    getSubBrand(uids) {
      if (uids == 0) {
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
      let that = this;
      switch (type) {
        case 1:

        case 6:
          this.$alert(that.$t('brand.areYouSetPassword'), that.$t('brand.setLoginPassword'), {
            confirmButtonText: that.$t('public.confirm'),
            center: true,
            callback: action => {
              if (action == 'confirm') {
                this.$post('iot-saas-user/admin/user/password/reset', {
                  userId: row.userId,
                  password: '123456'
                }).then(res => {
                  this.$message({
                    message: that.$t('public.resetSuccess'),
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
    toLogin(row) {
      let that = this;
      this.loadObj = this.$loading({
        lock: true,
        text: that.$t('public.loggingIn'),
        spinner: 'el-icon-loading'
      })
      this.$post('iot-saas-user/admin/login', {
        userType: 'agent',
        id: row.id
      }).then(res => {
        setToken(getToken(), 'token1')
        setToken(res.loginToken.accessToken)
        setTimeout(() => {
          location.href = '/home'
          this.loadObj.close()
        }, 500)
      }).catch(err => {
        this.loadObj.close()
      })
    },
  }
}
</script>

<style lang="scss" scoped></style>
