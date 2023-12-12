<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:defult>
        <el-form-item :label="$t('userManage.userSource')">
          <el-select :placeholder="$t('userManage.userSource')" v-model="form.userType" @change="toQuery()">
            <el-option :label="$t('public.all')" value="" />
            <el-option :label="$t('payType.wx')" value="wechat" />
            <el-option :label="$t('payType.zfb')" value="alipay" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('public.userId')">
          <el-input :placeholder="$t('userManage.idText')" v-model="form.idLastNine" />
        </el-form-item>
        <el-form-item :label="$t('public.userNickName')">
          <el-input :placeholder="$t('public.userNickName')" v-model="form.nickname" />
        </el-form-item>
        <el-form-item :label="$t('public.phone')">
          <el-input :placeholder="$t('public.phone')" v-model="form.mobile" />
        </el-form-item>
        <el-form-item :label="$t('userManage.userStatus')">
          <el-select :placeholder="$t('userManage.userStatus')" v-model="form.status" @change="toQuery()">
            <el-option :label="$t('public.all')" value="" />
            <el-option :label="$t('public.normal')" value="0" />
            <el-option :label="$t('userManage.blackened')" value="1" />
          </el-select>
        </el-form-item>
      </template>
    </condition>

    <div class="pl-10 pr-10 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list" :max-height="tableMaxH" element-loading-text="Loading" highlight-current-row>
        <el-table-column :label="$t('public.img')" width="60">
          <template slot-scope="scope">
            <el-avatar shape="square" :size="35" :src="scope.row.avatar" fit="fill" icon="el-icon-picture-outline" class="m-auto block"></el-avatar>
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
        <el-table-column :label="$t('public.numberOfRentals')">
          <template slot-scope="scope">
            {{ scope.row.loanNumber || '0' }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('userManage.totalAmount')">
          <template slot-scope="scope">
            {{ scope.row.totalConsumption || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.walletBalance')" v-if="isSaas() || isBrand()">
          <template slot-scope="scope">
            {{ scope.row.accountBalance || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('userManage.registrationDate')" width="150">
          <template slot-scope="scope">
            {{ parseTime(scope.row.registeredTime, '{y}-{m}-{d} {h}:{i}') || '1970-01-01 00:00' }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.operate')" width="165" :fixed="device == 'desktop' ? 'right' : false">
          <template slot-scope="scope">
            <div class="flex flex-wrap">
              <el-button type="primary" size="mini" @click="$router.push({path: `/order?userId=${scope.row.id}`})">{{ $t('public.orderList') }}</el-button>
              <el-button :type="scope.row.status == 1 ? 'danger' : ''" size="mini" @click="setBlack(scope.row)">{{ scope.row.status == 1 ? $t('userManage.restore') : $t('userManage.block') }}</el-button>
            </div>
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
      myDeviceId(){
        return this.$store.state.user.myDeviceId
      },
      agentInfo(){
        return this.$store.getters.agentInfo
      },
      device() {
        return this.$store.state.app.device
      },
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
          size: 20
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
          page: this.listQuery.page - 1,
          needCount: true
        })
        this.$get('iot-saas-user/user/relation/findUserByAdmin', params).then((res = {}) => {
          this.list = res.rows || []
          this.listLoading = false
          this.clickSubmit = false
          if (params.page == 0) {
            this.listTotal = res.total || 0
            this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 95
          }
        }).catch(() => {
          this.clickSubmit = false
          this.listLoading = false
        })
      },

      /**
       * 拉黑 或 移除黑名单
       */
      setBlack(row) {
        let that = this;
        row.status = row.status == 1 ? 0 : 1
        this.$post('iot-saas-user/api/user/updateStatus', {
          userId: row.id,
          status: row.status
        }).then(res => {
          this.$message({
            message: that.$t('public.setSuccess'),
            type: 'success'
          })
        })
      },

      /**
       * 充值
       */
      recharge(row, type = 1) {
        let that = this;
        this.$prompt(that.$t('userManage.rechargeTitle'), type == 1 ? that.$t('userManage.rechargeType') : that.$t('userManage.rechargeType1'), {
          confirmButtonText: that.$t('userManage.confirmRecharge'),
          cancelButtonText: that.$t('public.cancel'),
          inputPlaceholder: that.$t('userManage.rechargeText'),
          inputType: 'text',
          beforeClose: (action, instance, done) => {
            if (action == 'confirm') {
              this.loadObj = this.$loading({
                lock: true,
                text: that.$t('userManage.recharging'),
                spinner: 'el-icon-loading'
              })
              const value = instance.inputValue
              this.$post('agentapi/business/invest_user_accout', {
                uid: row.id,
                type: type,
                money: value
              }).then(res => {
                this.loadObj.close()
                this.$message({
                  message: that.$t('public.operationSuccessful'),
                  type: 'success'
                })
                this.toQuery()
                done()
              })
            } else {
              done()
            }
          }
        })
      },

      /**
       * 设置会员
       */
      setUserMember(){
        let that = this;
        let params = this.memberObj
        this.loadObj = this.$loading({
          lock: true,
          text: `${that.$t('public.submitting')}~~`,
          spinner: 'el-icon-loading'
        })
        this.$post('agentapi/card/save_user_member_card_info', params).then(res => {
          this.loadObj.close()
          this.$message({
            message: that.$t('public.operationSuccessful'),
            type: 'success'
          })
          this.memberDialog = false
        }).catch(err => {
          this.loadObj.close()
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
