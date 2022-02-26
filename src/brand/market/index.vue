<template>
  <div>
    <div class="pl-15 pr-15 pb-5 bg-white">
      <div class="flex align-center">
        <div class="flex1">
          <el-button size="medium" :type="listQuery.status == item.value ? 'primary' : ''"
            :class="{'btn-body': listQuery.status != item.value}" v-for="item in statusArr"
            @click="toQuery(item.value)">{{ item.title }}</el-button>
        </div>
        <condition ref="condition" :resetStatus="false" :clickSubmit="clickSubmit" @query="toQuery">
          <template v-slot:defult>
            <el-input v-model="form.name" placeholder="搜索服务"/>
          </template>
        </condition>
      </div>

      <el-row :gutter="24">
        <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="8" v-for="item in 4">
          <div class="flex align-center list-item cursor" @click="$router.push({path: `/market/buy`})">
            <el-image
              class="list-img"
              src="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg"
              fit="cover"></el-image>
            <div class="pl-15 pr-15 flex1">
              <div class="flex align-center text-black">
                <div>共享密码线</div>
                <el-tag class="ml-5" size="mini" color="rgba(7, 193, 96, 0.1)">免费试用七天</el-tag>
                <div class="flex1"></div>
                <el-rate :value="5" disabled></el-rate>
              </div>
              <div class="mt-10 fs-s2">共享密码线以软件的可视化，智能化的操作页面和后台服务系统，用微信和支付宝等支付方式来便携和服务人们生活。</div>
              <div class="mt-10 flex align-center">
                <div class="flex1 fs-b2 text-danger">¥10000.00/永久</div>
                <el-button type="primary" size="medium">立即购买</el-button>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>

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
    data() {
      return {
        clickSubmit: false,
        statusArr: [{
            value: 0,
            title: '全部服务',
            nkey: ''
          },
          {
            value: 1,
            title: '系统功能',
            nkey: ''
          },
          {
            value: 2,
            title: '共享密码线',
            nkey: ''
          }
        ],

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
  .list-item{
    margin: 12px 0;
    border: 1px solid #E5E6EB;
    border-radius: 2px;
    .list-img{
      width: 138px;
      height: 138px;
      border-radius: 2px;
    }
    /deep/ .el-rate__icon{
      margin-right: 0;
    }
    .el-tag{
      border: none;
      color: #07C160;
    }
  }

</style>
