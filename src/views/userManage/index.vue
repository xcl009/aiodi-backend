<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:defult>
        <el-form-item label="用户来源">
          <el-select placeholder="用户来源" v-model="form.userType" @change="toQuery()">
            <el-option label="全部" value="" />
            <el-option label="微信" value="wechat" />
            <el-option label="支付宝" value="alipay" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户昵称">
          <el-input placeholder="用户昵称" v-model="form.nickname" />
        </el-form-item>
        <el-form-item label="手机号码">
          <el-input placeholder="手机号码" v-model="form.mobile" />
        </el-form-item>
        <el-form-item label="用户状态">
          <el-select placeholder="用户状态" v-model="form.status" @change="toQuery()">
            <el-option label="全部" value="" />
            <el-option label="正常" value="0" />
            <el-option label="已拉黑" value="1" />
          </el-select>
        </el-form-item>
      </template>
    </condition>

    <div class="pl-10 pr-10 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list" :max-height="tableMaxH" element-loading-text="Loading" highlight-current-row>
        <el-table-column label="头像" width="60">
          <template slot-scope="scope">
            <el-avatar shape="square" :size="35" :src="scope.row.avatar" fit="fill" icon="el-icon-picture-outline" class="m-auto block"></el-avatar>
          </template>
        </el-table-column>
        <el-table-column label="昵称" width="160">
          <template slot-scope="scope">
            <el-link class="cursor">{{ scope.row.nickname || '无昵称' }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="手机号码">
          <template slot-scope="scope">
            <div>{{ dealPhone(scope.row.mobile) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="来源">
          <template slot-scope="scope">
            {{ scope.row.userType == 'wechat' ? '微信' : '支付宝' }}
          </template>
        </el-table-column>
        <el-table-column label="租借次数">
          <template slot-scope="scope">
            {{ scope.row.loanNumber || '0' }}
          </template>
        </el-table-column>
        <el-table-column label="消费总金额">
          <template slot-scope="scope">
            {{ scope.row.totalConsumption || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column label="钱包余额" v-if="isSaas() || isBrand()">
          <template slot-scope="scope">
            {{ scope.row.accountBalance || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column label="注册日期" width="150">
          <template slot-scope="scope">
            {{ parseTime(scope.row.registeredTime, '{y}-{m}-{d} {h}:{i}') || '1970-01-01 00:00' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="165" :fixed="device == 'desktop' ? 'right' : false">
          <template slot-scope="scope">
            <div class="flex flex-wrap">
              <el-button type="primary" size="mini" @click="$router.push({path: `/order?userId=${scope.row.id}`})">订单记录</el-button>
              <el-button :type="scope.row.status == 1 ? 'danger' : ''" size="mini" @click="setBlack(scope.row)">{{ scope.row.status == 1 ? '恢复' : '拉黑' }}</el-button>
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
        row.status = row.status == 1 ? 0 : 1
        this.$post('iot-saas-user/api/user/updateStatus', {
          userId: row.id,
          status: row.status
        }).then(res => {
          this.$message({
            message: '设置成功',
            type: 'success'
          })
        })
      },

      /**
       * 充值
       */
      recharge(row, type = 1) {
        this.$prompt('请输入充值金额', type == 1 ? '余额充值' : '储值卡充值', {
          confirmButtonText: '确定充值',
          cancelButtonText: '取消',
          inputPlaceholder: '正数为加，负数为减',
          inputType: 'text',
          beforeClose: (action, instance, done) => {
            if (action == 'confirm') {
              this.loadObj = this.$loading({
                lock: true,
                text: '正在充值',
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
                  message: '充值成功',
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
        let params = this.memberObj
        this.loadObj = this.$loading({
          lock: true,
          text: '提交中~~',
          spinner: 'el-icon-loading'
        })
        this.$post('agentapi/card/save_user_member_card_info', params).then(res => {
          this.loadObj.close()
          this.$message({
            message: '设置成功',
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
