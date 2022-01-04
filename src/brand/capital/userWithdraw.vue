<template>
  <div>
		<condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
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
		</condition>

    <div class="pl-15 pr-15 pb-5 bg-white">
      <div class="mb-15 flex">
        <div class="flex1">
          <el-button size="medium" :type="listQuery.status == item.value ? 'primary' : ''"
            :class="{'btn-body': listQuery.status != item.value}" v-for="item in statusArr"
            @click="toQuery(item.value)">{{ item.title }}({{numInfo[item.nkey] || 0}})</el-button>
      
          <el-button size="medium" class="btn-body">总提现<span class="ml-15 mr-30 text-black">52877.52元</span>平台手续费<span class="ml-15 text-black">52877.52元</span></el-button>
        </div>
      </div>
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading" border
        :max-height="tableMaxH">
        <el-table-column label="提现单号" align="center" width="120">
          <template slot-scope="scope">
            <div>{{ scope.row.charge_county || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="用户" align="center" width="130">
          <template slot-scope="scope">
            <div class="mb-5">{{ scope.row.name || '--' }}</div>
            <div>{{ scope.row.phone || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="提现时间" align="center" width="130">
          <template slot-scope="scope">
            <div class="mb-5">{{ scope.row.name || '--' }}</div>
            <div>{{ scope.row.phone || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="提现金额(元)" align="center">
          <template slot-scope="scope">
            {{ scope.row.charge_county || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column label="手续费(元)" align="center">
          <template slot-scope="scope">
            {{ scope.row.charge_county || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column label="到账金额(元)" align="center">
          <template slot-scope="scope">
            {{ scope.row.charge_county || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column label="到账账户" align="center" width="220">
          <template slot-scope="scope">
            <div v-if="scope.row.withdraw_type == 0">
              <div>{{ scope.row.withdraw_bank_uname }}</div>
              <div>{{ scope.row.withdraw_bank_info }}</div>
              <div>{{ scope.row.withdraw_bank_id }}</div>
            </div>
            <div class="flex align-center" v-else-if="scope.row.withdraw_type == 3">
              <div class="mr-5 flex1">{{ scope.row.wx_account_name }}</div>
              <el-image
                class="pay-code"
                :src="scope.row.wx_account_qrcode"
                fit="scale-down"
                :preview-src-list="[scope.row.wx_account_qrcode]"
                style="height: 80px">
              </el-image>
            </div>
            <div class="flex align-center" v-else-if="scope.row.withdraw_type == 4">
              <div class="mr-5 flex1">{{ scope.row.zfb_account_name }}</div>
              <el-image
                class="pay-code"
                style="height: 80px"
                fit="scale-down"
                :src="scope.row.zfb_account_qrcode"
                :preview-src-list="[scope.row.zfb_account_qrcode]">
              </el-image>
            </div>
            <div class="flex align-center" v-else>
              <el-avatar size="small" :src="scope.row.wx_avatar"></el-avatar>
              <div class="flex1 pl-10">{{ scope.row.wx_nick_name || "--" }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="提现方式" align="center" width="100">
          <template slot-scope="scope">
            {{ config.withdraw_way[scope.row.withdraw_type] }}
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center">
          <template slot-scope="scope">
            <div class="el-link el-link--success">{{ statusObj[scope.row.withdraw_status] }}</div>
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" width="170">
          <template slot-scope="scope">{{ scope.row.withdraw_reason }}</template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <div class="flex justify-center">
              <div class="p-10 cursor text-primary" @click="setRows(1, scope.row, 1)">通过</div>
              <div class="p-10 cursor text-danger" @click="setRows(2, scope.row, 1)">拒绝</div>
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
        statusArr: [{
            value: 0,
            title: '全部',
            nkey: ''
          },
          {
            value: 1,
            title: '审核中',
            nkey: ''
          },
          {
            value: 2,
            title: '已拒绝',
            nkey: ''
          },
          {
            value: 3,
            title: '到账中',
            nkey: ''
          },
          {
            value: 4,
            title: '已通过',
            nkey: ''
          }
        ],
        numInfo: {},
        form: {},
        tableMaxH: '250',
        list: [{}],
        listLoading: false,
        listTotal: 0,
        listQuery: {
          status: this.$route.query.status || 0,
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
