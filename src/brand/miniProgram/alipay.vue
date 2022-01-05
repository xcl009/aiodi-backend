<template>
  <div>
		<!-- <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
		  <template v-slot:defult>
        <el-date-picker
          class="range-day flex align-center"
          v-model="form.day"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期">
        </el-date-picker>
        <el-select v-model="form.withdraw_type" placeholder="提现方式" @change="toQuery()">
          <el-option :label="item" :value="index" v-for="(item, index) in config.withdraw_way"/>
        </el-select>
        <el-input v-model="form.name" placeholder="代理姓名"/>
        <el-input v-model="form.mobile" placeholder="手机号码"/>
		  </template>
		</condition> -->

    <div class="pt-15 pl-15 pr-15 pb-5 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading" border
        :max-height="tableMaxH">
        <el-table-column label="品牌方" align="center" width="120">
          <template slot-scope="scope">
            <div>{{ scope.row.charge_county || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="账号/手机号" align="center" width="120">
          <template slot-scope="scope">
            <div>{{ scope.row.charge_county || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="小程序" align="center" width="130">
          <template slot-scope="scope">
            <div class="mb-5">{{ scope.row.name || '小程序名称' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="APPID" align="center" width="130">
          <template slot-scope="scope">
            <div class="mb-5">{{ scope.row.name || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="最新版本" align="center">
          <template slot-scope="scope">
            {{ scope.row.charge_county || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column label="当前版本" align="center">
          <template slot-scope="scope">
            {{ scope.row.charge_county || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center">
          <template slot-scope="scope">
            {{ scope.row.charge_county || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column label="更新时间" align="center" width="100">
          <template slot-scope="scope">
            2021/12/27
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <div class="inline pl-10 pr-10 cursor text-primary" @click="setRows(1, scope.row, 1)">小程序绑定</div>
            <div class="inline pl-10 pr-10 cursor text-primary" @click="setRows(1, scope.row, 1)">上传代码</div>
            <div class="inline pl-10 pr-10 cursor text-primary" @click="setRows(1, scope.row, 1)">服务域名</div>
            <div class="inline pl-10 pr-10 cursor text-primary" @click="setRows(1, scope.row, 2)">业务域名</div>
          </template>
        </el-table-column>
      </el-table>

      <div class="p-20 text-center cursor" @click="$router.push({path: `/systemSet/alipayEdit`})">绑定小程序</div>
 
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

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" width="454px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 1">
        <div class="text-center">
          <div class="text-black">确定该笔提现申请通过审核吗？</div>
        </div>
      </template>
      <template v-if="dialogType == 2">
        <div class="text-black">确定该笔提现申请拒绝通过吗？</div>
        <el-form class="custom-form">
          <el-input v-model="dform.note" placeholder="请输入备注内容" type="textarea" :rows="5" />
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
        statusObj: {
          0: '审核中',
          1: '到账中',
          2: '提现已到账',
          3: '审核不通过'
        },

        form: {},
        tableMaxH: '250',
        list: [{}],
        listLoading: false,
        listTotal: 0,
        listQuery: {
          page: 1,
          size: 20
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
        this.$get('iot-saas-basic/admin/agent/findPage', params).then(res => {
          this.list = res.rows || [{}]
          this.listLoading = false
          this.clickSubmit = false
          if(params.page == 0){
            this.listTotal = res.total
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
       * @param {Object} dialogType dialog内容显示类型 1: '提现通过', 2: '提现拒绝'
       * @param {Object} idx 当前数据所在位置
       */
      setRows(type, row, dialogType, idx) {
        switch (row.type) {
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
          case 2:
            this.$post('agentapi/upper_review_apply', {
              apply_id: curRow.id,
              note: params.note,
              agree: 2
            }).then(res => {
              this.$message({
                message: '提交成功',
                type: 'success'
              })
              row.withdraw_status = 3
            })
            break
        }
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
