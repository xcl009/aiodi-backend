<template>
  <div>
    <div class="pt-15 pl-15 pr-15 pb-15 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading" border
        :max-height="tableMaxH">
        <el-table-column label="小程序" align="center">
          <template slot-scope="scope">
            <div class="mb-5">{{ scope.row.appName || '小程序名称' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="APPID" align="center">
          <template slot-scope="scope">
            <div class="mb-5">{{ scope.row.appId || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="最新模板" align="center">
          <template slot-scope="scope">
            {{ scope.row.latestTemplateId || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="当前模板" align="center">
          <template slot-scope="scope">
            {{ scope.row.appTemplate || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center">
          <template slot-scope="scope">
            {{ appAuditStatus[scope.row.appAuditStatus] || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center">
          <template slot-scope="scope">
            {{ scope.row.appAuditResut || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="更新时间" align="center">
          <template slot-scope="scope">
            {{ parseTime(scope.row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <div class="inline pl-10 pr-10 cursor text-primary" @click="setRows(1, scope.row, 1)">上传代码</div>
            <div class="inline pl-10 pr-10 cursor text-primary" @click="setRows(2, scope.row, 1)" v-if="scope.row.appAuditStatus == 1">提交审核</div>
            <div class="inline pl-10 pr-10 cursor text-primary" @click="setRows(3, scope.row, 1)" v-if="scope.row.appAuditStatus == 2">审核状态</div>
            <div class="inline pl-10 pr-10 cursor text-primary" @click="setRows(4, scope.row, 1)" v-if="scope.row.appAuditStatus == 3">发布代码</div>
            <div class="inline pl-10 pr-10 cursor text-primary" @click="setRows(4, scope.row, 1)" v-if="scope.row.appAuditStatus == 4">审核失败</div>
            <div class="inline pl-10 pr-10 cursor text-primary" @click="setRows(5, scope.row)">隐私设置</div>
            <div class="inline pl-10 pr-10 cursor text-primary" @click="$router.push({path: `/systemSet/wechatEdit?app_id=${scope.row.appId}`})">修改信息</div>
            <!-- <div class="inline pl-10 pr-10 cursor text-primary" @click="setRows(1, scope.row, 1)">服务域名</div>
            <div class="inline pl-10 pr-10 cursor text-primary" @click="setRows(1, scope.row, 2)">业务域名</div> -->
          </template>
        </el-table-column>
      </el-table>

      <div class="pt-20 text-center text-primary cursor" @click="$router.push({path: `/systemSet/wechatEdit`})" v-if="list.length == 0">绑定小程序</div>
    </div>

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" width="454px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 1">
        <div class="text-center">
          <div class="text-black">确定上传代码到此小程序吗？</div>
        </div>
      </template>
      <div class="mt-30 text-center">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">取消</el-button>
        <el-button size="medium" type="primary" @click="dialogConfim()" :disabled="clickSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'wechat',
    components: {},
    props: {
      user_type: {
        type: Number,
        default: 0
      }
    },
    data() {
      return {
        clickSubmit: false,
        form: {},
        tableMaxH: '250',
        list: [],
        listLoading: false,

        appAuditStatus: {
          0: '待上传',
          1: '待审核',
          2: '审核中',
          3: '待发布',
          4: '审核失败',
          5: '已发布'
        },
        // 弹出相关
        dialogType: 1,
        dialogStatus: false,
        dialogTitle: {
          1: '上传代码'
        },
        curRow: {},
        curIdx: 0,
        dform: {}
      }
    },
    beforeRouteEnter(to, from, next) {
      if (from.name == "wechatEdit") {
        to.meta.reload = true
      } else {
        to.meta.reload = false
      }
      next()
    },
    activated() {
      if(this.$route.meta.reload){
        this.toQuery()
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
        this.getList()
      },

      /**
       * 重置查询
       */
      reset(){
        if(this.clickSubmit) return
        this.clickSubmit = true
        this.form = {}
        this.getList()
      },

      /**
       * 获取列表
       */
      getList() {
        var params = Object.assign({}, this.form)
        this.$get('iot-saas-pay/admin/pay/config/wechat/list', params).then(res => {
          this.list = res
          this.listLoading = false
          this.clickSubmit = false
        }).catch(err => {
          this.listLoading = false
          this.clickSubmit = false
        })
      },

      /**
       * 操作
       * @param {Object} type 1 dialog类型
       * @param {Object} row 选择当前数据
       * @param {Object} dialogType dialog内容显示类型 1: '上传代码' 2: '提交审核' 3: '查询审核状态' 4: '发布代码' 5: '隐私设置'
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
          case 2:
            
            this.$post(`iot-saas-pay/wechat/${row.appId}/submit/audit`).then(res => {
              this.$message({
                message: '提交审核成功',
                type: 'success'
              })
              row.appAuditStatus = 2
            })
            break
          case 3:
            this.$get(`iot-saas-pay/wechat/${row.appId}/latest/audit/status`).then(res => {
              this.$message({
                message: '查询成功',
                type: 'success'
              })
              row.appAuditStatus = (res.status == 0 ? 3 : res.status == 1 ? 4 : res.appAuditStatus)
            })
            break
          case 4:
            this.$post(`iot-saas-pay/wechat/${row.appId}/push/release`).then(res => {
              this.$message({
                message: '发布成功',
                type: 'success'
              })
              row.appAuditStatus = 5
            })
            break
          case 5:
            this.$post(`iot-saas-pay/wechat/${row.appId}/set/privacy`, {

            }).then(res => {

            })
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
            this.$post('iot-saas-pay/wechat/upload/code', {
              appId: curRow.appId,
              ext: {
                appId: curRow.appId,
              },
              directCommit: false,
              extEnable: true,
              extAppid: curRow.appId
            }).then(res => {
              this.$message({
                message: '上传成功',
                type: 'success'
              })
              this.dialogStatus = false
              curRow.appAuditStatus = 1
            })
            break
        }
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
