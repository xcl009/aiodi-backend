<template>
  <div>
    <condition ref="condition" @reset="reset" @query="toQuery">
      <template v-slot:tabs>
        <el-tabs class="mb-15 bg-white" v-model="listQuery.serviceTypeCode" @tab-click="toQuery()">
          <el-tab-pane label="全部" :name="'0'" />
          <el-tab-pane :label="item.name" :name="item.code" v-for="(item, index) in tabs" />
        </el-tabs>
      </template>
      <template v-slot:defult>
        <el-input v-model="form.serviceName" placeholder="服务名称"/>
      </template>
    </condition>

    <div class="pt-15 pl-15 pr-15 pb-5 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading" :max-height="tableMaxH">
        <el-table-column label="服务名称">
          <template slot-scope="scope">
            <div>{{ scope.row.serviceName || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="模式">
          <template slot-scope="scope">
            <div class="mb-5">{{ scope.row.priceName || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="周期" width="130">
          <template slot-scope="scope">
            {{ scope.row.cycleTypeName || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="快活币">
          <template slot-scope="scope">
            {{ scope.row.price || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column label="实付">
          <template slot-scope="scope">
            {{ scope.row.payAmount || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column label="购买时间">
          <template slot-scope="scope">
            {{ scope.row.buyDatetime }}
          </template>
        </el-table-column>
        <el-table-column label="到期时间">
          <template slot-scope="scope">
            {{ scope.row.expiresDatetime }}
          </template>
        </el-table-column>
        <el-table-column label="订单状态">
          <template slot-scope="scope">
            <el-tag class="normal fs-s4">{{ scope.row.orderStatusName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button class="p-5 ml-0" size="medium" type="text" @click="$router.push({path: `/order/subOrder?agentId=${scope.row.id}`})" v-if="scope.row.cycleTypeName != '永久'">续费</el-button>
            <el-button class="p-5 ml-0" size="medium" type="text" @click="$router.push({path: `/market/steal`})" v-if="scope.row.cycleTypeName != '永久'">去设置</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-center">
        <pagination
          :page.sync="listQuery.page"
          :limit.sync="listQuery.size"
          :total="parseInt(listTotal)"
          @pagination="getList"
        />
      </div>
    </div>

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" width="454px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 1">
        <div class="text-center">
          <div class="text-black">确定该笔提现申请通过审核吗？</div>
        </div>
      </template>
      <div class="mt-30 text-center">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">取消</el-button>
        <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import condition from '@/components/condition/'
  export default {
    name: 'agentWithdraw',
    components: {
      Pagination,
      condition
    },
    props: {
      user_type: {
        type: Number,
        default: 0
      }
    },
    data() {
      return {
        clickSubmit: false,
        tabs: [],
        form: {},
        tableMaxH: '250',
        list: [],
        listLoading: true,
        listTotal: 0,
        listQuery: {
          page: 1,
          size: 20
        },

        // 弹出相关
        dialogType: 1,
        dialogStatus: false,
        dialogTitle: {
          1: '通过提现'
        },
        curRow: {},
        curIdx: 0,
        dform: {}
      }
    },
    activated() {
      if(this.$route.meta.reload){
        this.getList()
      }else if(!this.list || this.list.length == 0) {
        this.toQuery()
      }
    },
    computed: {
      siteInfo() {
        return this.$store.getters.siteInfo
      },
      agentInfo(){
        return this.$store.getters.agentInfo
      }
    },
    mounted() {
      this.$store.dispatch('api/getServiceType').then(res => {
        this.tabs = res
      })
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
        this.form = {
          activated_status: 1
        }
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
        if(params.serviceTypeCode == 0) delete params.serviceTypeCode
        this.$get('iot-saas-basic/client/service/market/record/findPage', params).then(res => {
          this.list = res ? res.rows : []
          this.listLoading = false
          this.clickSubmit = false
          if(params.page == 0){
            this.listTotal = res ? res.total : 0
            this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 80
          }
        }).catch(() => {
          this.listLoading = false
          this.clickSubmit = false
        })
      },

      /**
       * 操作商户
       * @param {Object} type 1 dialog类型
       * @param {Object} row 选择当前数据
       * @param {Object} dialogType dialog内容显示类型 1: '提现通过'
       * @param {Object} idx 当前数据所在位置
       */
      setRows(type, row, dialogType, idx) {
        switch (type) {
          case 1:
            this.dialogType = dialogType
            this.curRow = row
            this.curIdx = idx
            this.dialogStatus = true
            break
        }
      },

      /**
       * 弹窗确认
       */
      dialogConfirm() {
        let curRow = this.curRow,
          curIdx = this.curIdx,
          params = JSON.parse(JSON.stringify(this.dform))
        switch (this.dialogType) {
          case 1:
            this.$post('agentapi/upper_review_apply', {
              apply_id: curRow.id,
              agree: 1
            }).then(res => {
              this.$message({
                message: '提交成功',
                type: 'success'
              })
              row.withdraw_status = 2
            })
            break
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .el-tag{
    height: 24px;
    line-height: 24px;
    border: none;
    border-radius: 2px;
    &.normal{
      background-color: rgba(7, 193, 96, 0.1);
      color: #07C160;
    }
    &.is-expired{
      background-color: rgba(255, 163, 44, 0.1);
      color: #FFA32C;
    }
    &.expired{
      background-color: #F2F3F5;
      color: #86909C;
    }
  }

</style>
