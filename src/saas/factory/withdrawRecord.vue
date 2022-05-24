<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:defult>
        <!-- <el-input v-model="form.search_name" placeholder="工厂名称" /> -->
        <el-form-item label="提现ID">
        <el-input v-model="form.id" placeholder="提现ID" />
        </el-form-item>
        <el-form-item label="提现时间">
        <el-date-picker
          class="range-day flex align-center"
            v-model="form.date"
            type="daterange"
            value-format="timestamp"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptionsEnd"
            @change="toQuery()">
          </el-date-picker>
          </el-form-item>
      </template>
    </condition>

    <div class="mt-15">
      <div class="flex bg-white">
        <div class="pl-15 pr-15 flex1">
          <el-tabs v-model="listQuery.apply_status" class="mb-0" @tab-click="typeClick">
            <el-tab-pane :label="`全部`" name="0"/>
            <el-tab-pane :label="`申请中`" name="1"/>
            <el-tab-pane :label="`已驳回`" name="3"/>
            <el-tab-pane :label="`已通过`" name="2"/>
          </el-tabs>
        </div>
      </div>
      <div class="pl-15 pr-15 pb-5 bg-white">
        <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list" :max-height="tableMaxH" element-loading-text="Loading" stripe highlight-current-row>
          <el-table-column label="ID">
            <template slot-scope="scope">
              <div>{{ scope.row.id }}</div>
            </template>
          </el-table-column>
          <el-table-column label="工厂名称">
            <template slot-scope="scope">
              {{ scope.row.factory.factory_name }}
            </template>
          </el-table-column>
          <el-table-column label="提现时间" width="90">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.create_time, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
            </template>
          </el-table-column>
          <el-table-column label="提现金额">
            <template slot-scope="scope">
              <div class="el-link">{{ scope.row.apply_money }}</div>
            </template>
          </el-table-column>
          <el-table-column label="到帐账户" width="220">
            <template slot-scope="scope">
              <div>{{ scope.row.payee }}</div>
              <div>{{ scope.row.receiving_bank_name }}</div>
              <div>{{ scope.row.receiving_bank_id }}</div>
            </template>
          </el-table-column>
          <el-table-column label="状态">
            <template slot-scope="scope">
              <div class="el-link el-link--primary">{{ statusObj[scope.row.apply_status] }}</div>
            </template>
          </el-table-column>
          <el-table-column label="备注" width="170">
            <template slot-scope="scope">{{ scope.row.remark }}</template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template slot-scope="scope">
              <div v-if="scope.row.apply_status == 1">
                <el-button size="mini" type="primary" round @click="setRows(1, scope.row, 1, scope.$index)">
                  通过
                </el-button>
                <el-button size="mini" type="primary" round @click="setRows(1, scope.row, 2, scope.$index)">
                  驳回
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <div class="flex justify-center">
          <pagination :total="dataTotal" :page.sync="listQuery.page" :limit.sync="listQuery.size"
            layout="sizes, prev, pager, next, jumper" @pagination="getList" />
        </div>
      </div>
    </div>

    <el-dialog :visible.sync="dialogStatus" :center="true" :close-on-click-modal="false" :show-close="false" width="454px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 1">
        <div class="mb-20 text-center">确定该笔提现申请通过审核吗？</div>
        <el-form class="pt-5 custom-form">
          <el-input v-model="dform.remark" placeholder="请输入备注内容" type="textarea" :rows="5" />
        </el-form>
      </template>
      <template v-if="dialogType == 2">
        <div class="mb-20 text-center">确定该笔提现申请拒绝通过吗？？</div>
        <el-form class="pt-5 custom-form">
          <el-input v-model="dform.remark" placeholder="请输入备注内容" type="textarea" :rows="5" />
        </el-form>
      </template>
      <div class="mt-30 text-center">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">取消</el-button>
        <el-button size="medium" type="primary" @click="dialogConfim()" :disabled="clickSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import condition from '@/components/condition'
  export default {
    name: 'reviewe',
    components: {
      Pagination,
      condition
    },
    props: {

    },
    data() {
      return {
        clickSubmit: false,
        form: {},
        numInfo: {},
        stat_data: {},
        tableMaxH: '250',
        list: [],
        listLoading: true,
        dataTotal: 0,
        listQuery: {
          apply_status: this.$route.query.apply_status || 0,
          page: 1,
          size: 20
        },
        statusObj: {
          1: '申请中',
          2: '已通过',
          3: '已驳回'
        },
        pickerOptionsEnd: {
            disabledDate: (time) => {
              let timeOptionRange = this.timeOptionRange
              let secondNum = 60 * 60 * 24 * 31 * 1000
              if (timeOptionRange) {
                return (time.getTime() > timeOptionRange.getTime() + secondNum || time.getTime() < timeOptionRange.getTime() - secondNum) || time.getTime() > Date.now()
              }
              return time.getTime() > Date.now()
            }, onPick: (time) => {
              //当第一时间选中才设置禁用
              if (time.minDate && !time.maxDate) {
                this.timeOptionRange = time.minDate
              }
              if (time.maxDate) {
                this.timeOptionRange = null
              }
            }
        },

        // 弹出相关
        dialogType: 1,
        dialogStatus: false,
        dialogTitle: {
          1: '通过提现',
          2: '拒绝提现'
        },
        curRow: {},
        curIdx: 0,
        dform: {}
      }
    },
    computed: {
      agentInfo(){
        return this.$store.state.user.agentInfo
      }
    },
    mounted(options) {
      //this.getNum()
      this.getList()
    },
    methods: {
      /**
       * 数量
       */
      getNum() {
        const params = Object.assign({}, this.listQuery, this.form)
        this.$get('agentapi/index/agent_withdraw_applys_stat_num', params).then(res => {
          this.numInfo = res
        })
      },

      /**
       * 搜索查询
       */
      toQuery(type = 0) {
        if(this.clickSubmit) return
        this.clickSubmit = true
        this.listQuery.page = 1
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
        this.getList()
      },

      /**
       * 请求类型筛选
       * @param {Object} tab
       * @param {Object} event
       */
      typeClick(tab) {
        this.listQuery.page = 1
        this.getList()
      },

      /**
       * 获取列表
       */
      getList() {
        let params = Object.assign({}, this.form, this.listQuery, {
          page: this.listQuery.page - 1
        }), url = '/agentapi/team/getFactoryWithdrwalList'
        if(params.date && params.date.length > 0){
          params.start_time = params.date[0] / 1000
          params.end_time = params.date[1] / 1000
          delete params.date
        }
        if(params.apply_status == 0) delete params.apply_status
        this.$get(url, params).then(res => {
          this.list = res.list
          this.stat_data = res.stat_data || {}
          this.dataTotal = res.total
          this.listLoading = false
          this.clickSubmit = false
          if (params.page == 0) this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 90
        }).catch(() => {
          this.listLoading = false
        })
      },

      /**
       * 操作行
       * @param {Object} type 1 dialog类型
       * @param {Object} row 选择当前行
       * @param {Object} dialogType dialog内容显示类型 1: '提现通过', 2: '提现驳回'
       * @param {Object} idx 当前行所在位置
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
      dialogConfim() {
        let curRow = this.curRow,
          curIdx = this.curIdx,
          params = JSON.parse(JSON.stringify(this.dform))
        switch (this.dialogType) {
          case 1: case 2:
            this.$post('agentapi/team/handleFactoryWithdrwal', {
              id: curRow.id,
              action_type: (this.dialogType == 1 ? 'AGREE' : 'REJECT'),
              remark: params.remark
            }).then(res => {
              this.$message({
                message: '提交成功',
                type: 'success'
              })
              this.dialogStatus = false
              this.curRow.apply_status = (this.dialogType == 1 ? 2 : 3)
              this.curRow.remark = params.remark
            })
            break
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  /deep/ .pay-code .el-image__inner{
    width: inherit;
  }
</style>
