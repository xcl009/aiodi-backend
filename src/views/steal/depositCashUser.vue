<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:tabs>
        <el-tabs class="bg-white" v-model="listQuery.deviceTypeCode" @tab-click="toQuery()">
          <el-tab-pane :label="index" :name="'' + item + ''" v-for="(item, index) in myDeviceName" />
        </el-tabs>
      </template>
      <template v-slot:defult>
        <el-form-item :label="$t('userManage.userSource')">
          <el-select :placeholder="$t('userManage.userSource')" v-model="form.userType" @change="toQuery()">
            <el-option :label="$t('public.all')" value="" />
            <el-option :label="$t('payType.wx')" value="wechat" />
            <el-option :label="$t('payType.zfb')" value="alipay" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('public.userNickName')">
          <el-input :placeholder="$t('public.userNickName')" v-model="form.nickname" />
        </el-form-item>
        <el-form-item :label="$t('public.phone')">
          <el-input :placeholder="$t('public.phone')" v-model="form.mobile" />
        </el-form-item>
      </template>
    </condition>

    <div class="pl-15 pr-15 pb-5 bg-white">
      <el-table class="custom" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
        :max-height="tableMaxH" element-loading-text="Loading" highlight-current-row>
        <el-table-column :label="$t('public.img')" width="60">
          <template slot-scope="scope">
            <el-avatar shape="square" :size="35" :src="scope.row.avatar" fit="fill" icon="el-icon-picture-outline"
              class="m-auto block"></el-avatar>
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.nickname')" width="160">
          <template slot-scope="scope">
            <el-link class="cursor">{{ scope.row.nickname || $t('public.noNickname') }}</el-link>
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.phone')">
          <template slot-scope="scope">
            <div>{{ dealPhone(scope.row.mobile) }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('home.source')">
          <template slot-scope="scope">
            {{ scope.row.userType == 'wechat' ? $t('payType.wx') : $t('payType.zfb') }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.expirationTime')" width="150">
          <template slot-scope="scope">
            {{ parseTime(scope.row.expiredTime, '{y}-{m}-{d} {h}:{i}') || '1970-01-01 00:00' }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.operate')" width="120">
          <template slot-scope="scope">
            <el-button type="danger" size="mini" class="ml-0" @click="del(scope.row, scope.$index)">{{
              $t('public.removeList') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-center">
        <pagination :page.sync="listQuery.page" :limit.sync="listQuery.size" :total="parseInt(listTotal)"
          @pagination="getList" />
      </div>
    </div>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import condition from '@/components/condition/'
import {
  dealPhone
} from '@/utils/index'
export default {
  name: 'userManage',
  components: {
    Pagination,
    condition
  },
  computed: {
    agentInfo() {
      return this.$store.getters.agentInfo
    },
    myDeviceName() {
      return this.$store.state.user.myDeviceName
    }
  },
  data() {
    return {
      dealPhone: dealPhone,
      clickSubmit: false,
      oemInfo: {},
      tableMaxH: '250',
      list: [],
      listLoading: false,
      listTotal: 0,
      listQuery: {
        page: 1,
        size: 20,
        deviceTypeCode: ''
      },
      form: {}
    }
  },
  beforeRouteEnter(to, from, next) {
    to.meta.urlQuery = JSON.stringify(to.query)
    if (from.name == '') {
      to.meta.reload = true
    } else {
      to.meta.reload = false
    }
    next()
  },
  activated() {
    let queryKey = [],
      query = this.$route.query
    this.listQuery.deviceTypeCode = Object.values(this.myDeviceName)[0]
    for (var i in queryKey) {
      this[queryKey[i]] = query[queryKey[i]]
    }
    if (this.$route.meta.reload) {
      this.getList()
    } else if (this.urlQuery != this.$route.meta.urlQuery) {
      this.toQuery(1)
    }
    this.urlQuery = this.$route.meta.urlQuery
  },
  mounted(options) {

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
      this.$get('iot-saas-order/admin/order/queryProbabilityDepositUser', params).then(res => {
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
    },

    /**
     * 移除押金名单
     */
    del(row, idx) {
      let that = this;
      this.$alert(that.$t('steal.message6'), that.$t('steal.message7'), {
        confirmButtonText: that.$t('public.confirm'),
        callback: action => {
          if (action == 'confirm') {
            this.$post('iot-saas-order/admin/order/deleteProbabilityDepositUser', {
              deviceTypeCode: row.deviceTypeCode,
              userId: row.userId
            }).then(res => {
              this.$message({
                message: that.$t('public.operationSuccessful'),
                type: 'success'
              })
              this.list.splice(idx, 1)
            })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped></style>
