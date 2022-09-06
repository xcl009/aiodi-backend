<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:tabs>
        <el-tabs class="mb-15 bg-white" v-model="listQuery.deviceTypeCode" @tab-click="toQuery()">
          <el-tab-pane :label="index" :name="''+item+''" v-for="(item, index) in myDeviceName" />
        </el-tabs>
      </template>
      <template v-slot:defult>
        <el-select placeholder="用户来源" v-model="form.userType" @change="toQuery()">
          <el-option label="全部" value="" />
          <el-option label="微信" value="wechat" />
          <el-option label="支付宝" value="alipay" />
        </el-select>
        <el-input placeholder="用户昵称" v-model="form.nickname" />
        <el-input placeholder="手机号码" v-model="form.mobile" />
      </template>
    </condition>

    <div class="pl-15 pr-15 pb-5 bg-white">
      <el-table class="custom" id="list_table" ref="list_table" v-loading="listLoading" :data="list" :max-height="tableMaxH" element-loading-text="Loading" stripe highlight-current-row>
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
        <el-table-column label="到期时间" width="150">
          <template slot-scope="scope">
            {{ parseTime(scope.row.expiredTime, '{y}-{m}-{d} {h}:{i}') || '1970-01-01 00:00' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template slot-scope="scope">
            <el-button type="danger" size="mini" class="ml-0" @click="del(scope.row, scope.$index)">移除名单</el-button>
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
      agentInfo(){
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
      del(row, idx){
        this.$alert('确定将该用户移除押金名单吗？', '移除', {
          confirmButtonText: '确定',
          callback: action => {
            if (action == 'confirm') {
              this.$post('iot-saas-order/admin/order/deleteProbabilityDepositUser', {
                deviceTypeCode : row.deviceTypeCode,
                userId: row.userId
              }).then(res => {
                this.$message({
                  message: '删除成功',
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

<style lang="scss" scoped>

</style>
